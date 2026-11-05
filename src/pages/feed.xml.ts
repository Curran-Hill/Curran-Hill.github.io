import { getPosts } from "../lib/content";
import { siteData } from "../lib/site-data";
export const prerender = true;
const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export async function GET() {
  const posts = await getPosts();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>${esc(siteData.name)} — Field journal</title><link>https://www.duckp0nd.com/</link><description>${esc(siteData.owner)}’s cybersecurity write-ups and discoveries.</description><language>en-us</language><atom:link href="https://www.duckp0nd.com/feed.xml" rel="self" type="application/rss+xml"/>${posts.map((p) => `<item><title>${esc(p.title)}</title><link>https://www.duckp0nd.com${esc(p.url)}</link><guid isPermaLink="true">https://www.duckp0nd.com${esc(p.url)}</guid><pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate><description>${esc(p.excerpt)}</description><content:encoded><![CDATA[${p.html.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded></item>`).join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
