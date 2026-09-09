import type { Metadata } from "next";
import { QtBoard } from "@/components/QtBoard";

export const metadata:Metadata={
  title:"매일성경 본문 QT",
  description:"로그인 없이 누구나 매일성경 본문 묵상과 적용을 나누는 Kant Bible QT 게시판"
};

export default function QtPage(){
  return <main className="simple-page">
    <section className="page-title parchment-hero compact">
      <div className="section-kicker">DAILY SCRIPTURE · QUIET TIME</div>
      <h1>매일성경 본문 QT</h1>
      <p>오늘 읽은 본문과 묵상, 적용을 한 줄 게시판처럼 차곡차곡 모읍니다. 로그인 없이 누구나 나눌 수 있습니다.</p>
    </section>
    <section className="page-section"><QtBoard/></section>
  </main>;
}
