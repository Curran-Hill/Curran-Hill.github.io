import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { editorAsset } from "./assets.ts";
import { createEditorStore, EditorError } from "./server.ts";

export function editorPlugin(): Plugin {
  return {
    name: "duckpond-local-editor",
    apply: "serve",
    configureServer(server) {
      const root = process.cwd(),
        store = createEditorStore(root),
        token = crypto.randomBytes(32).toString("hex");
      const json = (res: ServerResponse, value: unknown, status = 200) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(value));
      };
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");
        if (
          !url.pathname.startsWith("/__editor/") &&
          url.pathname !== "/admin/" &&
          url.pathname !== "/admin"
        )
          return next();
        void (async () => {
          const host = req.headers.host || "",
            address = req.socket.remoteAddress || "";
          const hostname = new URL("http://" + host).hostname;
          if (
            !["127.0.0.1", "localhost", "[::1]"].includes(hostname) ||
            !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address)
          )
            throw new EditorError(
              403,
              "The editor is available only on this computer.",
            );
          if (req.headers.origin && req.headers.origin !== `http://${host}`)
            throw new EditorError(
              403,
              "Open the editor directly on localhost.",
            );
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
          res.setHeader("X-Frame-Options", "DENY");
          res.removeHeader("Access-Control-Allow-Origin");
          if (url.pathname === "/admin" || url.pathname === "/admin/") {
            if (req.method !== "GET")
              throw new EditorError(405, "Use the editor page.");
            res.setHeader(
              "Content-Security-Policy",
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https:; font-src 'self'; frame-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
            );
            let html = fs
              .readFileSync(path.join(root, "src/editor/index.html"), "utf8")
              .replace("__EDITOR_TOKEN__", token);

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
            return;
          }
          if (req.method === "GET") {
            if (url.pathname.startsWith("/__editor/assets/")) {
              const asset = editorAsset(
                root,
                url.pathname.slice("/__editor/assets/".length),
              );
              if (!asset) throw new EditorError(404, "Editor asset not found.");
              res.setHeader("Content-Type", asset.type);
              res.end(asset.body);
              return;
            }
            if (url.pathname === "/__editor/state")
              return json(res, { site: store.site(), posts: store.list() });
            if (url.pathname === "/__editor/post")
              return json(res, store.read(url.searchParams.get("file") || ""));
            throw new EditorError(404, "Editor action not found.");
          }
          if (
            req.method !== "POST" ||
            req.headers.origin !== `http://${host}` ||
            req.headers["x-pond-editor"] !== token ||
            !req.headers["content-type"]?.startsWith("application/json")
          )
            throw new EditorError(
              403,
              "Reload the local editor before saving.",
            );
          let size = 0;
          const chunks: Buffer[] = [];
          for await (const chunk of req as IncomingMessage) {
            size += chunk.length;
            if (size > 18 * 1024 * 1024)
              throw new EditorError(413, "This upload is too large.");
            chunks.push(chunk);
          }
          let body;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString());
          } catch {
            throw new EditorError(400, "The editor request could not be read.");
          }
          if (url.pathname === "/__editor/post")
            return json(res, await store.save(body));
          if (url.pathname === "/__editor/site")
            return json(res, await store.saveSite(body.data, body.revision));
          if (url.pathname === "/__editor/preview")
            return json(res, await store.preview(body));
          if (url.pathname === "/__editor/upload")
            return json(res, store.upload(body.name, body.content));
          throw new EditorError(404, "Editor action not found.");
        })().catch((error) =>
          json(
            res,
            { error: error.message },
            error instanceof EditorError ? error.status : 400,
          ),
        );
      });
      server.httpServer?.once("listening", () => {
        const address = server.httpServer!.address();
        if (address && typeof address !== "string")
          console.log(
            `\n  Pond keeper → http://127.0.0.1:${address.port}/admin/\n`,
          );
      });
    },
  };
}
