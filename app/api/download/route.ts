export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return (cleaned || "xhs-video") + ".mp4";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");
  const rawFilename = searchParams.get("filename") || "xhs-video";

  if (!videoUrl) {
    return new Response("Missing url", { status: 400 });
  }

  if (!/^https:\/\/[^\/]*xhscdn\.(com|net)\//.test(videoUrl)) {
    return new Response("Only xhscdn URLs are allowed", { status: 400 });
  }

  const upstream = await fetch(videoUrl, {
    headers: { "User-Agent": BROWSER_UA },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  const filename = sanitizeFilename(rawFilename);
  const encoded = encodeURIComponent(filename);

  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Content-Disposition": `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { headers });
}
