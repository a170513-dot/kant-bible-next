import { notFound } from "next/navigation";
import { ContextInfographic } from "@/components/ContextInfographic";
import { LectureList,type LectureItem } from "@/components/LectureList";
import { ShareBoard } from "@/components/ShareBoard";
import { BookResourceSection } from "@/components/BookResourceSection";
import { BOOKS,getBook } from "@/lib/books";
import { getBookContext } from "@/lib/book-context";
import { createPublicClient } from "@/lib/supabase-public";

export const revalidate=60;

export function generateStaticParams(){
  return BOOKS.map(book=>({slug:book.slug}));
}

export default async function BibleBookPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const book=getBook(slug);
  if(!book)notFound();
  const context=getBookContext(book);
  let lectures:LectureItem[]=[];
  try{
    const supabase=createPublicClient();
    const {data}=await supabase.from("lectures").select("id,title,summary,updated_at,source_filename")
      .eq("book_slug",slug).eq("is_published",true).order("updated_at",{ascending:false});
    lectures=(data||[]) as LectureItem[];
  }catch{lectures=[];}

  return <main className="book-page">
    <section className="book-hero">
      <div className="book-hero-art" aria-hidden="true"/>
      <div className="book-hero-content">
        <div className="breadcrumb">{book.testament==="OT"?"구약":"신약"} · {book.category}</div>
        <h1>{book.nameKo}</h1>
        <p>본문을 역사와 문화, 지리의 결 속에서 읽고 강의안과 공동체 나눔을 함께 모읍니다.</p>
        <ContextInfographic {...context}/>
      </div>
    </section>

    <nav className="book-section-nav" aria-label={`${book.nameKo} 페이지 바로가기`}>
      <a href="#overview">개관</a>
      <a href="#structure">구조와 흐름</a>
      <a href="#lectures">강의안</a>
      <a href="#research">본문 연구</a>
      <a href="#sharing">나눔</a>
    </nav>

    <BookResourceSection bookSlug={book.slug} section="overview"/>
    <BookResourceSection bookSlug={book.slug} section="structure"/>

    <section className="page-section" id="lectures">
      <div className="section-heading">
        <div><div className="section-kicker">LECTURES</div><h2>강의안</h2></div>
        <p>강의안은 별도 전체화면 뷰어에서 넓고 편안하게 읽을 수 있습니다.</p>
      </div>
      <LectureList lectures={lectures}/>
    </section>

    <BookResourceSection bookSlug={book.slug} section="research"/>

    <section className="page-section sharing-section" id="sharing">
      <div className="section-heading">
        <div><div className="section-kicker">SHARING BOARD</div><h2>{book.nameKo} 나눔 게시판</h2></div>
        <p>로그인 없이 누구나 글을 남길 수 있습니다.</p>
      </div>
      <ShareBoard bookSlug={book.slug} bookName={book.nameKo}/>
    </section>
  </main>;
}
