import Link from "next/link";
import { createServiceClient } from "@/lib/supabase-service";

export type ResourceSectionKey = "overview" | "structure" | "research";

const LABELS: Record<ResourceSectionKey, {
  title: string;
  kicker: string;
  empty: string;
}> = {
  overview: {
    title: "개관",
    kicker: "OVERVIEW",
    empty: "저자·연대·수신자·역사적 배경·문학적 특징을 넣는 자리",
  },
  structure: {
    title: "구조와 흐름",
    kicker: "STRUCTURE & FLOW",
    empty: "책 전체 구조, 주요 단락, 핵심 주제와 신학적 흐름을 넣는 자리",
  },
  research: {
    title: "본문 연구",
    kicker: "TEXTUAL RESEARCH",
    empty: "원문, 사본, 구약·신약 상호본문성, 역사적 배경, 주석 비교를 넣는 자리",
  },
};

type ResourceRow = {
  id: number;
  title: string;
  content_type: "text" | "file";
  body_text: string | null;
  source_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  updated_at: string;
};

function fileSizeLabel(size: number | null) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

export async function BookResourceSection({
  bookSlug,
  section,
}: {
  bookSlug: string;
  section: ResourceSectionKey;
}) {
  const meta = LABELS[section];
  let resources: ResourceRow[] = [];

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("book_resources")
      .select("id,title,content_type,body_text,source_filename,mime_type,file_size,updated_at")
      .eq("book_slug", bookSlug)
      .eq("section", section)
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    resources = (data || []) as ResourceRow[];
  } catch {
    resources = [];
  }

  return (
    <section className="page-section content-section" id={section}>
      <div className="section-heading">
        <div>
          <div className="section-kicker">{meta.kicker}</div>
          <h2>{meta.title}</h2>
        </div>
      </div>

      {!resources.length ? (
        <div className="empty-state">{meta.empty}</div>
      ) : (
        <div className="resource-list">
          {resources.map((resource) => (
            <article className="resource-card" key={resource.id}>
              <div className="resource-card-head">
                <div>
                  <span className="eyebrow">
                    {resource.content_type === "text" ? "TEXT" : "FILE"}
                  </span>
                  <h3>{resource.title}</h3>
                </div>
                {resource.content_type === "file" && (
                  <span className="resource-file-meta">
                    {resource.source_filename || "첨부 파일"}
                    {resource.file_size ? ` · ${fileSizeLabel(resource.file_size)}` : ""}
                  </span>
                )}
              </div>

              {resource.body_text && (
                <div className="resource-text">{resource.body_text}</div>
              )}

              {resource.content_type === "file" && (
                <Link className="primary-link resource-open" href={`/resource/${resource.id}`}>
                  파일 열기 ↗
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
