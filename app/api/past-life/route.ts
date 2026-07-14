import { NextResponse } from "next/server";
import pastLives from "@/data/pastLives.json";

export const runtime = "nodejs";

type PastLife = {
  id: number;
  being: string;
  era: string;
  cause: string;
  achievement: string;
  memory: string;
};

const RECORDS = pastLives as PastLife[];

// 이름을 안정적인 숫자로 바꾸는 해시 (같은 이름 → 항상 같은 전생)
function hashName(name: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
    }

    const key = name.trim().toLowerCase().replace(/\s+/g, "");
    const index = hashName(key) % RECORDS.length;
    const record = RECORDS[index];

    return NextResponse.json({ name: name.trim(), record });
  } catch {
    return NextResponse.json(
      { error: "전생을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
