import Link from "next/link";
export type LectureItem={id:number;title:string;summary:string|null;updated_at:string;source_filename:string|null};

export function LectureList({lectures}:{lectures:LectureItem[]}){
  if(!lectures.length) return <div className="empty-state">아직 공개된 강의안이 없습니다.</div>;
  return (
    <div className="lecture-grid">
      {lectures.map(lecture=>(
        <article className="lecture-card" key={lecture.id}>
          <div>
            <span className="eyebrow">LECTURE</span>
            <h3>{lecture.title}</h3>
            {lecture.summary&&<p>{lecture.summary}</p>}
          </div>
          <Link className="primary-link" href={`/lecture/${lecture.id}`}>전체화면으로 읽기 ⛶</Link>
        </article>
      ))}
    </div>
  );
}
