"use client";

import { useEffect, useState } from "react";

export function LectureFrame({
  signedUrl,
  legacyHtml,
  title,
}: {
  signedUrl: string | null;
  legacyHtml: string | null;
  title: string;
}) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("강의안을 불러오는 중입니다…");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function prepare() {
      try {
        let html = legacyHtml || "";

        if (!html && signedUrl) {
          const response = await fetch(signedUrl, {
            method: "GET",
            cache: "no-store",
            credentials: "omit",
          });

          if (!response.ok) {
            throw new Error(`강의안 파일을 읽지 못했습니다. (${response.status})`);
          }

          html = await response.text();
        }

        if (!html) {
          throw new Error("강의안 파일이 없습니다.");
        }

        // Storage가 HTML을 다른 MIME 형식으로 전달하더라도 브라우저에서
        // UTF-8 HTML 문서로 다시 만들어 원래 CSS/레이아웃을 그대로 렌더링합니다.
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setFrameUrl(objectUrl);
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "강의안을 표시하지 못했습니다."
          );
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [signedUrl, legacyHtml]);

  if (!frameUrl) {
    return (
      <div className="empty-state viewer-empty">
        {message}
        {signedUrl && (
          <>
            {" "}
            <a className="text-button" href={signedUrl} target="_blank" rel="noreferrer">
              원본 파일 열기
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <iframe
      id="lectureFrame"
      className="lecture-screen"
      src={frameUrl}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
      referrerPolicy="no-referrer"
      title={title}
    />
  );
}
