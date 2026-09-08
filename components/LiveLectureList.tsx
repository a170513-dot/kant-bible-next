"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LectureList, type LectureItem } from "@/components/LectureList";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export function LiveLectureList({ bookSlug }: { bookSlug: string }) {
  const supabase = useMemo(() => createClient(url, key), []);
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadLectures = useCallback(async (silent = false) => {
    if (!url || !key) {
      setMessage("강의안 연결 설정을 확인해야 합니다.");
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    const { data, error } = await supabase
      .from("lectures")
      .select("id,title,summary,updated_at,source_filename")
      .eq("book_slug", bookSlug)
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage("강의안을 불러오지 못했습니다.");
    } else {
      setLectures((data || []) as LectureItem[]);
      setMessage("");
    }

    if (!silent) setLoading(false);
  }, [bookSlug, supabase]);

  useEffect(() => {
    void loadLectures();

    const refresh = () => {
      if (document.visibilityState === "visible") void loadLectures(true);
    };

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadLectures(true);
    }, 15000);

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadLectures]);

  if (loading) {
    return <div className="empty-state">공개 강의안을 확인하는 중입니다…</div>;
  }

  if (message) {
    return (
      <div className="empty-state">
        {message}{" "}
        <button className="text-button" type="button" onClick={() => void loadLectures()}>
          다시 불러오기
        </button>
      </div>
    );
  }

  return <LectureList lectures={lectures} />;
}
