"use client";

import { useState } from "react";

type PastLife = {
  id: number;
  being: string;
  era: string;
  cause: string;
  achievement: string;
  memory: string;
};

type Result = {
  name: string;
  tone: string;
  story: string;
  record: PastLife;
  generated: boolean;
};

const FIELDS: { key: keyof PastLife; label: string; icon: string }[] = [
  { key: "being", label: "전생의 직업 · 존재", icon: "👤" },
  { key: "era", label: "시대", icon: "⏳" },
  { key: "cause", label: "사인", icon: "🥀" },
  { key: "achievement", label: "전생의 업적", icon: "🏆" },
  { key: "memory", label: "사람들의 기억", icon: "📜" },
];

const LOADING_MESSAGES = [
  "전생의 기록을 펼치는 중…",
  "먹을 갈고 붓을 드는 중…",
  "시간의 강을 거슬러 오르는 중…",
];

export default function Home() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setLoadingMsg(
      LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    );
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/past-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "요청에 실패했습니다.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="title">🔮 전생 이야기</h1>
      <p className="subtitle">이름을 넣으면 그 사람의 전생을 한 편의 이야기로 써드립니다.</p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요 (예: 홍길동)"
          maxLength={40}
        />
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "집필 중…" : "전생 보기"}
        </button>
      </form>

      {loading && <p className="loading">{loadingMsg}</p>}
      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <section className="story-card">
            <div className="story-head">
              <span className="tone-badge">✒️ {result.tone}</span>
              <span className="story-title">
                <b>{result.name}</b>님의 전생 이야기
              </span>
            </div>
            <p className="story">{result.story}</p>
            {!result.generated && (
              <p className="notice">
                * 작가(GPT)와 연결이 원활하지 않아 기록 원문으로 보여드렸어요.
              </p>
            )}
          </section>

          <section className="record">
            <p className="record-head">📁 전생 기록 원본</p>
            {FIELDS.map((f) => (
              <div className="row" key={f.key}>
                <div className="row-label">
                  <span className="icon">{f.icon}</span>
                  {f.label}
                </div>
                <div className="row-value">{result.record[f.key]}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
