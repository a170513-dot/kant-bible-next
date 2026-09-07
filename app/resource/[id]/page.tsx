import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export default async function ResourceViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const supabase = createServiceClient();
  const { data: resource, error } = await supabase
    .from("book_resources")
    .select("id,book_slug,title,storage_path,source_filename,mime_type,is_published")
    .eq("id", numericId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !resource?.storage_path) notFound();

  const { data } = await supabase.storage
    .from("book-resources")
    .createSignedUrl(resource.storage_path, 60 * 60);

  const signedUrl = data?.signedUrl;
  if (!signedUrl) notFound();

  const mime = resource.mime_type || "";
  const embeddable =
    mime.startsWith("text/") ||
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime === "application/xhtml+xml";

  return (
    <main className="lecture-viewer-page">
      <div className="lecture-viewer-bar">
        <div>
          <span className="section-kicker">RESOURCE VIEWER</span>
          <strong>{resource.title}</strong>
        </div>
        <div className="viewer-actions">
          <Link className="ghost-button" href={`/bible/${resource.book_slug}`}>
            ← 성경책으로
          </Link>
          <a
            className="primary-button"
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
          >
            새 창에서 열기 ↗
          </a>
        </div>
      </div>

      {embeddable ? (
        <iframe
          className="lecture-screen"
          src={signedUrl}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          title={resource.title}
        />
      ) : (
        <div className="resource-download-panel">
          <div className="section-kicker">ATTACHED FILE</div>
          <h1>{resource.source_filename || resource.title}</h1>
          <p>
            이 파일 형식은 브라우저 안에서 바로 미리보기보다 새 창에서 여는 방식이 안정적입니다.
          </p>
          <a
            className="primary-button"
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
          >
            파일 열기 / 저장
          </a>
        </div>
      )}
    </main>
  );
}
