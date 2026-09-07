import Link from "next/link";

export function SiteHeader(){
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">K</span>
          <span>KANT BIBLE</span>
        </Link>
        <nav className="main-nav" aria-label="주요 메뉴">
          <Link href="/">성경 66권</Link>
          <Link href="/board">나눔 게시판</Link>
          <Link href="/admin">관리자</Link>
        </nav>
      </div>
    </header>
  );
}
