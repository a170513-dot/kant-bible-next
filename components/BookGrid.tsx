"use client";
import { useMemo,useState } from "react";
import Link from "next/link";
import type { BibleBook,Testament } from "@/lib/books";

export function BookGrid({books,boardMode=false}:{books:BibleBook[];boardMode?:boolean}){
  const [query,setQuery]=useState("");
  const [testament,setTestament]=useState<"ALL"|Testament>("ALL");
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return books.filter(book=>{
      const a=testament==="ALL"||book.testament===testament;
      const b=!q||book.nameKo.toLowerCase().includes(q)||book.slug.toLowerCase().includes(q)||book.category.toLowerCase().includes(q);
      return a&&b;
    });
  },[books,query,testament]);

  return (
    <section>
      <div className="book-toolbar">
        <input className="search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="성경책 검색" aria-label="성경책 검색"/>
        <div className="segmented" aria-label="구약 신약 필터">
          {(["ALL","OT","NT"] as const).map(v=>(
            <button key={v} type="button" className={testament===v?"active":""} onClick={()=>setTestament(v)}>
              {v==="ALL"?"전체":v==="OT"?"구약":"신약"}
            </button>
          ))}
        </div>
      </div>
      <div className="book-grid">
        {filtered.map((book,index)=>(
          <Link
            prefetch={true}
            href={boardMode?`/bible/${book.slug}#sharing`:`/bible/${book.slug}`}
            className="book-card"
            key={book.slug}
          >
            <span className="book-index">{String(index+1).padStart(2,"0")}</span>
            <div>
              <small>{book.testament==="OT"?"구약":"신약"} · {book.category}</small>
              <strong>{book.nameKo}</strong>
            </div>
            <span className="book-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
