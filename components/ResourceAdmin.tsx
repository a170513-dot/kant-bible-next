"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import { CONTENT_BOOKS,bookGroupLabel } from "@/lib/books";

type SectionKey = "overview" | "structure" | "research";
type ContentType = "text" | "file";

type Resource = {
  id: number;
  book_slug: string;
  section: SectionKey;
  content_type: ContentType;
  title: string;
  body_text: string | null;
  source_filename: string | null;
  storage_path: string | null;
  file_size: number | null;
  is_published: boolean;
  updated_at: string;
};

const SECTION_LABELS: Record<SectionKey, string> = {
  overview: "개관",
  structure: "구조와 흐름",
  research: "본문 연구",
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = (dot >= 0 ? name.slice(dot + 1) : "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `resource-${id}${ext ? `.${ext}` : ""}`;
}

export function ResourceAdmin({ session }: { session: Session }) {
  const supabase = useMemo(() => createClient(url, key), []);
  const [resources, setResources] = useState<Resource[]>([]);
  const [contentType, setContentType] = useState<ContentType>("text");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const loadResources = useCallback(async () => {
    const { data, error } = await supabase
      .from("book_resources")
      .select("id,book_slug,section,content_type,title,body_text,source_filename,storage_path,file_size,is_published,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setResources((data || []) as Resource[]);
  }, [supabase]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  async function uploadFile(file: File, objectName: string) {
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${url}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: key,
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024,
        metadata: {
          bucketName: "book-resources",
          objectName,
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
        },
        onError(error) {
          reject(error);
        },
        onProgress(done, total) {
          setProgress(Math.round((done / total) * 100));
        },
        onSuccess() {
          resolve();
        },
      });
      upload.start();
    });
  }

  async function submitResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);

    const bookSlug = String(form.get("bookSlug") || "");
    const section = String(form.get("section") || "") as SectionKey;
    const title = String(form.get("title") || "").trim();
    const bodyText = String(form.get("bodyText") || "").trim();
    const isPublished = form.get("isPublished") === "on";
    const file = form.get("file");

    if (!bookSlug || !SECTION_LABELS[section] || !title) {
      return setMessage("자료 분류, 영역, 제목을 확인하세요.");
    }

    if (contentType === "text" && !bodyText) {
      return setMessage("올릴 글 내용을 입력하세요.");
    }

    if (contentType === "file") {
      if (!(file instanceof File) || !file.name) {
        return setMessage("파일을 선택하세요.");
      }
      if (file.size > 50 * 1024 * 1024) {
        return setMessage("파일은 최대 50MB까지 올릴 수 있습니다.");
      }
    }

    setMessage("저장하는 중…");
    setProgress(0);

    let storagePath: string | null = null;
    let sourceFilename: string | null = null;
    let mimeType: string | null = null;
    let fileSize: number | null = null;

    if (contentType === "file" && file instanceof File) {
      // 한글 원본 파일명은 DB에 그대로 보존하고 Storage 경로만 ASCII 안전 이름을 씁니다.
      storagePath = `${bookSlug}/${section}/${Date.now()}-${safeFileName(file.name)}`;
      sourceFilename = file.name;
      mimeType = file.type || "application/octet-stream";
      fileSize = file.size;

      try {
        await uploadFile(file, storagePath);
      } catch (error) {
        return setMessage(
          error instanceof Error ? error.message : "파일 업로드에 실패했습니다."
        );
      }
    }

    const { error } = await supabase.from("book_resources").insert({
      book_slug: bookSlug,
      section,
      content_type: contentType,
      title,
      body_text: bodyText || null,
      storage_path: storagePath,
      source_filename: sourceFilename,
      mime_type: mimeType,
      file_size: fileSize,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (storagePath) {
        await supabase.storage.from("book-resources").remove([storagePath]);
      }
      return setMessage(error.message);
    }

    formEl.reset();
    setContentType("text");
    setProgress(0);
    setMessage("자료를 등록했습니다.");
    await loadResources();
  }

  async function toggleResource(resource: Resource) {
    const { error } = await supabase
      .from("book_resources")
      .update({
        is_published: !resource.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resource.id);

    if (!error) await loadResources();
  }

  async function deleteResource(resource: Resource) {
    if (!window.confirm(`"${resource.title}" 자료를 삭제할까요?`)) return;

    if (resource.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("book-resources")
        .remove([resource.storage_path]);

      if (storageError) {
        window.alert(storageError.message);
        return;
      }
    }

    const { error } = await supabase
      .from("book_resources")
      .delete()
      .eq("id", resource.id);

    if (error) {
      window.alert(error.message);
      return;
    }

    await loadResources();
  }

  return (
    <>
      <form className="admin-card" onSubmit={submitResource}>
        <div className="section-kicker">BOOK CONTENT</div>
        <h2>개관 · 구조와 흐름 · 본문 연구 자료 올리기</h2>
        <p className="muted">
          성경 66권과 신구약중간사 모두 글을 직접 쓰거나 파일을 올릴 수 있습니다. 파일은 최대 50MB입니다.
        </p>

        <div className="form-grid">
          <label>
            성경책 / 신구약중간사
            <select name="bookSlug" required>
              {CONTENT_BOOKS.map((book) => (
                <option key={book.slug} value={book.slug}>
                  {bookGroupLabel(book)} · {book.nameKo}
                </option>
              ))}
            </select>
          </label>

          <label>
            들어갈 영역
            <select name="section" required>
              <option value="overview">개관</option>
              <option value="structure">구조와 흐름</option>
              <option value="research">본문 연구</option>
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            자료 형태
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value as ContentType)}
            >
              <option value="text">글 직접 입력</option>
              <option value="file">파일 업로드</option>
            </select>
          </label>

          <label>
            제목
            <input name="title" maxLength={120} required />
          </label>
        </div>

        <label>
          {contentType === "text" ? "본문 글" : "파일 설명 (선택)"}
          <textarea
            name="bodyText"
            rows={contentType === "text" ? 10 : 3}
            maxLength={20000}
            placeholder={
              contentType === "text"
                ? "개관, 구조, 본문 연구 내용을 직접 입력하세요."
                : "첨부 파일에 대한 설명을 적을 수 있습니다."
            }
          />
        </label>

        {contentType === "file" && (
          <label>
            파일
            <input
              name="file"
              type="file"
              accept=".html,.htm,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp,.gif,.docx,.pptx,.xlsx,text/html,application/pdf,text/plain,text/markdown,image/png,image/jpeg,image/webp,image/gif,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
            />
          </label>
        )}

        <label className="checkbox-row">
          <input name="isPublished" type="checkbox" defaultChecked />
          <span>등록 즉시 공개</span>
        </label>

        <button className="primary-button" type="submit">
          자료 등록
        </button>

        {progress > 0 && (
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        {message && <p className="form-message">{message}</p>}
      </form>

      <section className="admin-card">
        <div className="admin-section-heading">
          <h2>등록된 책별 자료</h2>
          <button className="ghost-button" type="button" onClick={loadResources}>
            새로고침
          </button>
        </div>

        <div className="manager-list">
          {resources.map((resource) => (
            <article className="manager-row" key={resource.id}>
              <div>
                <small>
                  {resource.book_slug} · {SECTION_LABELS[resource.section]} ·{" "}
                  {resource.content_type === "text" ? "글" : "파일"}
                </small>
                <strong>{resource.title}</strong>
                <span className="manager-preview">
                  {resource.content_type === "file"
                    ? resource.source_filename || "첨부 파일"
                    : resource.body_text || ""}
                </span>
              </div>

              <div className="manager-actions">
                <span
                  className={`status-pill ${
                    resource.is_published ? "visible" : "hidden"
                  }`}
                >
                  {resource.is_published ? "공개" : "비공개"}
                </span>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => toggleResource(resource)}
                >
                  {resource.is_published ? "비공개" : "공개"}
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => deleteResource(resource)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
