import { getPosts } from "../lib/content";
export const prerender = true;
export async function GET() {
  const routes = [
    "/",
    "/about/",
    "/htb.html",
    "/ctf.html",
    "/blog.html",
    "/contact/",
    ...(await getPosts()).map((p) => p.url),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((url) => `<url><loc>https://www.duckp0nd.com${url}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
