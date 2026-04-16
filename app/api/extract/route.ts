export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ko;q=0.7",
};

function extractUrl(input: string): string | null {
  const match = input.match(/https?:\/\/[^\s"']+/);
  return match ? match[0] : null;
}

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]+)"`, "i"),
    new RegExp(`<meta\\s+property="${name}"\\s+content="([^"]+)"`, "i"),
    new RegExp(`<meta\\s+content="([^"]+)"\\s+name="${name}"`, "i"),
    new RegExp(`<meta\\s+content="([^"]+)"\\s+property="${name}"`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].replace(/&amp;/g, "&");
  }
  return null;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*\|\s*小红书.*$/, "")
    .replace(/\s*-\s*小红书.*$/, "")
    .trim()
    .slice(0, 80) || "xhs-video";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawInput = typeof body.url === "string" ? body.url.trim() : "";

    if (!rawInput) {
      return Response.json({ error: "링크를 입력해주세요" }, { status: 400 });
    }

    const url = extractUrl(rawInput);
    if (!url) {
      return Response.json(
        { error: "링크 형식이 올바르지 않습니다. 샤오홍슈 공유 링크를 붙여넣어주세요." },
        { status: 400 }
      );
    }

    if (!/xiaohongshu\.com|xhslink\.com/.test(url)) {
      return Response.json(
        { error: "샤오홍슈 링크가 아닙니다. (xiaohongshu.com 또는 xhslink.com)" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });

    if (!res.ok) {
      return Response.json(
        {
          error: `샤오홍슈 페이지를 불러오지 못했습니다 (HTTP ${res.status}). 잠시 후 다시 시도해주세요.`,
        },
        { status: 502 }
      );
    }

    const html = await res.text();

    const videoUrl = extractMeta(html, "og:video");
    if (!videoUrl) {
      return Response.json(
        {
          error:
            "영상을 찾을 수 없습니다. 이미지 게시물이거나, 비공개/로그인 필요 게시물일 수 있습니다.",
        },
        { status: 404 }
      );
    }

    const title = cleanTitle(extractMeta(html, "og:title") || "");

    return Response.json({ videoUrl, title });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `예상치 못한 오류: ${message}` },
      { status: 500 }
    );
  }
}
