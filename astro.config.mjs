import { defineConfig } from "astro/config";
import path from "node:path";
import { editorPlugin } from "./src/editor/plugin.ts";

export default defineConfig({
  site: "https://www.duckp0nd.com",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  vite: {
    plugins: [
      editorPlugin(),
      {
        name: "obsidian-live-preview",
        configureServer(server) {
          const vault = path.resolve("_posts");
          const data = path.resolve("_data");
          let timer;
          server.watcher.add([vault, data]);
          const reload = (_event, file) => {
            if (
              (!file.startsWith(vault + path.sep) &&
                !file.startsWith(data + path.sep)) ||
              file.includes(`${path.sep}.obsidian${path.sep}`)
            )
              return;
            clearTimeout(timer);
            timer = setTimeout(() => {
              if (!file.endsWith(".tmp"))
                server.ws.send({
                  type: "custom",
                  event: "duckpond:content",
                  data: {},
                });
            }, 150);
          };
          server.watcher.on("all", reload);
          server.httpServer?.once("close", () => {
            clearTimeout(timer);
            server.watcher.off("all", reload);
          });
        },
      },
    ],
  },
});
