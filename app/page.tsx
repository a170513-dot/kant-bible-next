import { BookGrid } from "@/components/BookGrid";
import { BOOKS } from "@/lib/books";

export default function HomePage(){
  return <main>
    <section className="hero">
      <div className="hero-map" aria-hidden="true"/>
      <div className="hero-copy">
        <div className="section-kicker">SCRIPTURE · HISTORY · CULTURE · GEOGRAPHY</div>
        <h1>KANT<br/>BIBLE</h1>
        <p>성경 66권을 강의안, 역사적 배경, 문화와 지리의 시선으로 읽고 각 책마다 자유롭게 나눔을 남기는 열린 성경 아카이브입니다.</p>
        <div className="hero-stats">
          <div><strong>39</strong><span>구약</span></div>
          <div><strong>27</strong><span>신약</span></div>
          <div><strong>66</strong><span>성경책</span></div>
          <div><strong>∞</strong><span>나눔</span></div>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="section-heading">
        <div><div className="section-kicker">LIBRARY</div><h2>성경 66권</h2></div>
        <p>책을 선택하면 공개 강의안과 해당 성경책의 나눔 게시판이 함께 열립니다.</p>
      </div>
      <BookGrid books={BOOKS}/>
    </section>

    <section className="infographic-band">
      <div><span>⌖</span><strong>지리</strong><p>고대 근동에서 지중해 세계까지 이동과 도시를 따라 읽습니다.</p></div>
      <div><span>𓂀</span><strong>문화</strong><p>성전, 회당, 가족, 제국, 도시 공동체의 생활 세계를 살핍니다.</p></div>
      <div><span>⌛</span><strong>역사</strong><p>왕정, 포로, 제2성전기, 로마 제국이라는 시간의 층을 펼칩니다.</p></div>
    </section>
  </main>;
}
