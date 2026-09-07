import { BookGrid } from "@/components/BookGrid";
import { BOOKS } from "@/lib/books";

export default function BoardIndexPage(){
  return <main className="simple-page">
    <section className="page-title parchment-hero">
      <div className="section-kicker">66 OPEN BOARDS</div>
      <h1>성경책별 나눔 게시판</h1>
      <p>로그인 없이 누구나 글을 남길 수 있습니다. 나누고 싶은 성경책을 선택하세요.</p>
    </section>
    <section className="page-section"><BookGrid books={BOOKS} boardMode/></section>
  </main>;
}
