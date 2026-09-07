import Link from "next/link";

export function SiteHeader(){
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link prefetch={true} className="brand" href="/">
          <span className="brand-mark">K</span>
          <span>KANT BIBLE</span>
        </Link>
        <nav className="main-nav" aria-label="주요 메뉴">
          <Link prefetch={true} href="/">성경 66권</Link>
          <Link prefetch={true} href="/board">나눔 게시판</Link>
          <Link prefetch={true} href="/admin">관리자</Link>
        </nav>
      </div>
    </header>
  );
}
