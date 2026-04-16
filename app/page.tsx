"use client";

import { useState } from "react";

type ExtractResult = {
  videoUrl: string;
  title: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);

  async function handleExtract() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "알 수 없는 오류가 발생했습니다.");
      } else {
        setResult(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`네트워크 오류: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setInput("");
    setResult(null);
    setError(null);
  }

  const downloadHref = result
    ? `/api/download?url=${encodeURIComponent(
        result.videoUrl
      )}&filename=${encodeURIComponent(result.title)}`
    : "#";

  return (
    <main className="relative min-h-screen flex items-start justify-center px-4 py-16 sm:py-24 bg-gradient-to-b from-rose-50 to-white dark:from-zinc-900 dark:to-black overflow-hidden">
      <img
        src="/kangaroo-watermark.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed -bottom-6 -right-6 w-56 h-56 sm:w-72 sm:h-72 opacity-25 mix-blend-multiply dark:opacity-10 dark:mix-blend-screen dark:invert"
      />
      <div className="relative w-full max-w-xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            샤오홍슈 영상 다운로더
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            샤오홍슈 공유 링크를 붙여넣고 다운로드 버튼을 누르세요.
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <label
            htmlFor="xhs-url"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            샤오홍슈 링크
          </label>
          <textarea
            id="xhs-url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://www.xiaohongshu.com/... 또는 공유 텍스트 그대로 붙여넣기"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            disabled={loading}
          />

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleExtract}
              disabled={loading || !input.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium text-sm px-4 py-2.5 transition-colors"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  추출 중...
                </>
              ) : (
                "영상 추출"
              )}
            </button>
            {(result || error) && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium px-4 py-2.5 transition-colors"
              >
                초기화
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">오류:</span> {error}
              </p>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 p-4">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                영상 찾음
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3 break-words">
                {result.title}
              </p>
              <a
                href={downloadHref}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v7.19l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 111.06-1.06l2.47 2.47V3.75A.75.75 0 0110 3zM4.75 15a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z"
                    clipRule="evenodd"
                  />
                </svg>
                영상 다운로드
              </a>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-500 space-y-2">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            제작 · 핸드인캥거루
          </p>
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500 max-w-sm mx-auto">
            본 사이트의 무단 복제·재배포·상업적 이용을 금지합니다.
            위반 시 관련 법령에 따라 법적 책임이 따를 수 있습니다.
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
            ※ 다운로드한 영상은 개인 학습·소장 목적으로만 사용해주세요. 영상 저작권은 원작자에게 있습니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
