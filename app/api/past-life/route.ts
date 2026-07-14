import { NextResponse } from "next/server";
import OpenAI from "openai";

// Vercel에서 Node.js 런타임 사용 (openai SDK 호환)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-5.5";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "당신은 사람의 전생을 재미있고 신비롭게 이야기해주는 이야기꾼입니다. " +
            "입력된 이름을 가진 사람의 전생을 상상해서 한 편의 짧은 이야기로 들려주세요. " +
            "직업, 시대, 성격, 극적인 사건, 그리고 현생에 남긴 흔적을 포함하세요. " +
            "따뜻하고 재치 있는 한국어 문체로 400자 내외로 작성합니다.",
        },
        {
          role: "user",
          content: `'${name.trim()}'님의 전생 이야기를 들려주세요.`,
        },
      ],
      temperature: 0.9,
    });

    const story = completion.choices[0]?.message?.content?.trim();
    if (!story) {
      return NextResponse.json({ error: "이야기를 생성하지 못했습니다." }, { status: 502 });
    }

    return NextResponse.json({ story });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "전생을 불러오는 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
