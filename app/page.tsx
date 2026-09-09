import Link from "next/link";
import { BookGrid } from "@/components/BookGrid";
import { BOOKS,INTERTESTAMENTAL_STUDY } from "@/lib/books";

const features=[
  {icon:"▣",title:"개관",text:"저자·연대·수신자와 시대적 배경을 한눈에",href:"#library"},
  {icon:"≡",title:"구조와 흐름",text:"본문의 구조와 신학적 흐름을 체계적으로",href:"#library"},
  {icon:"✎",title:"강의안",text:"바로 활용할 수 있는 충실한 강의 자료",href:"#library"},
  {icon:"⌕",title:"본문 연구",text:"원문·사본·상호본문성과 주석 비교",href:"#library"},
  {icon:"◈",title:"성경 문화",text:"당시 사람들의 삶과 문화적 배경을 생생하게",href:"#library"},
  {icon:"⌖",title:"성경 지리",text:"고대 근동과 지중해 세계를 장소와 이동으로",href:"#library"},
  {icon:"☷",title:"나눔 게시판",text:"책별로 질문하고 함께 배우며 나누는 공간",href:"/board"},
  {icon:"☀",title:"매일성경 본문 QT",text:"오늘의 본문을 묵상하고 적용을 함께 나누는 열린 공간",href:"/qt"},
];

export default function HomePage(){
  return <main>
    <section className="home-hero">
      <div className="home-hero-copy">
        <div className="section-kicker">SCRIPTURE · HISTORY · CULTURE · GEOGRAPHY</div>
        <h1><span>Kant</span> Bible</h1>
        <p className="hero-tagline">성경 · 역사 · 문화 · 지리 · 나눔</p>
        <p className="hero-description">
          성경 강의안과 본문 연구를 쉽고 품격 있게 정리하는 지식 아카이브입니다.
          오래 읽어도 편안하도록 본문 중심의 가독성을 가장 먼저 생각했습니다.
        </p>
        <div className="hero-actions">
          <Link className="primary-button hero-button" href="#library">성경 66권 둘러보기 <span>→</span></Link>
          <Link className="secondary-button hero-button" href="/qt">오늘의 QT 나누기</Link>
        </div>
        <div className="hero-stats" aria-label="성경 구성">
          <div><strong>39</strong><span>구약</span></div>
          <div><strong>27</strong><span>신약</span></div>
          <div><strong>66</strong><span>성경책</span></div>
        </div>
      </div>

      <div className="home-hero-art">
        <img
          src="/visuals/kant-hamster-library.webp"
          alt="고전 서재에서 책을 읽는 Kant Bible의 학자 햄스터 캐릭터"
          width="1052"
          height="724"
        />
        <div className="hero-art-caption">
          <strong>Sapere aude</strong>
          <span>말씀을 더 깊이, 세상을 더 넓게.</span>
        </div>
      </div>
    </section>

    <section className="home-feature-section" aria-label="Kant Bible 주요 영역">
      <div className="home-feature-grid">
        {features.map(feature=>(
          <Link className="home-feature-card" href={feature.href} key={feature.title}>
            <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
            <div><strong>{feature.title}</strong><p>{feature.text}</p></div>
            <span className="feature-arrow" aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>

    <section className="page-section library-section" id="library">
      <div className="section-heading">
        <div>
          <div className="section-kicker">LIBRARY</div>
          <h2>성경 66권 + 신구약중간사</h2>
        </div>
        <p>성경책과 신구약중간사를 선택하면 개관, 구조와 흐름, 강의안, 본문 연구와 나눔을 한 페이지에서 읽을 수 있습니다.</p>
      </div>

      <div className="book-grid" style={{marginBottom:"18px"}}>
        <Link prefetch={true} href={`/bible/${INTERTESTAMENTAL_STUDY.slug}`} className="book-card">
          <span className="book-index">SPECIAL STUDY</span>
          <div>
            <small>성경 배경사 · {INTERTESTAMENTAL_STUDY.category}</small>
            <strong>{INTERTESTAMENTAL_STUDY.nameKo}</strong>
          </div>
          <span className="book-arrow">↗</span>
        </Link>
      </div>

      <BookGrid books={BOOKS}/>
    </section>

    <section className="reading-manifesto">
      <div>
        <span className="manifesto-mark">“</span>
        <blockquote>말씀을 더 깊이, 세상을 더 넓게, 함께 걸어가는 여정</blockquote>
        <p>정보를 쌓는 데서 멈추지 않고 성경의 세계를 이해하고 오늘의 삶으로 이어 가는 공간을 지향합니다.</p>
      </div>
    </section>
  </main>;
}
