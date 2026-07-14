"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setStory("");

    try {
      const res = await fetch("/api/past-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "요청에 실패했습니다.");
      }
      setStory(data.story);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="title">🔮 전생 이야기</h1>
      <p className="subtitle">이름을 넣으면 그 사람의 전생을 들려드립니다.</p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요 (예: 홍길동)"
          maxLength={40}
        />
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "점치는 중…" : "전생 보기"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {story && <div className="result">{story}</div>}
    </main>
  );
}
