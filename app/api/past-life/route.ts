import { NextResponse } from "next/server";
import pastLives from "@/data/pastLives.json";

export const runtime = "nodejs";
// GPT 작문 대기 시간 확보 (Vercel 함수 최대 실행 시간)
export const maxDuration = 60;

type PastLife = {
  id: number;
  being: string;
  era: string;
  cause: string;
  achievement: string;
  memory: string;
};

const RECORDS = pastLives as PastLife[];

// 랜덤으로 하나 뽑히는 작문 뉘앙스 — 감동부터 병맛까지
const TONES = [
  {
    label: "감동 신파",
    direction:
      "눈물샘을 자극하는 감동 드라마 문체로 쓴다. 잔잔하게 시작해 마지막 문장에서 뭉클한 여운을 남긴다.",
  },
  {
    label: "웅장한 대서사시",
    direction:
      "판타지 대서사시의 전지적 서술자 톤으로 쓴다. 운명, 별, 시간 같은 장대한 어휘로 한 생을 영웅담처럼 노래한다.",
  },
  {
    label: "정통 사극",
    direction:
      "정통 사극 내레이션 문체로 쓴다. '~하였다', '~였으니' 같은 장중한 어미를 사용하고 격조 있게 서술한다.",
  },
  {
    label: "자연 다큐멘터리",
    direction:
      "차분한 자연 다큐멘터리 내레이션 문체로 쓴다. 관찰자의 시선으로 담담하지만 경이롭게 서술한다.",
  },
  {
    label: "미스터리 괴담",
    direction:
      "한밤의 괴담을 들려주듯 미스터리하고 서늘한 문체로 쓴다. 긴장감을 쌓다가 마지막에 소름 돋는 반전 한 줄을 남긴다.",
  },
  {
    label: "애틋한 로맨스",
    direction:
      "애틋한 로맨스 소설 문체로 쓴다. 그 생에서 스쳐 간 인연 하나를 상상해 넣고 그리움의 정서로 마무리한다.",
  },
  {
    label: "완전 병맛",
    direction:
      "인터넷 밈과 드립이 난무하는 완전 병맛 코미디로 쓴다. 진지한 척 시작했다가 갑자기 어이없는 전개로 빵 터뜨린다. 과장, 자문자답, 뜬금없는 현대 용어 사용 환영.",
  },
  {
    label: "9시 뉴스 속보",
    direction:
      "뉴스 앵커가 단독 속보를 전하는 문체로 쓴다. '방금 들어온 소식입니다'로 시작해 리포터 멘트, 목격자 인터뷰 인용까지 뉴스 형식을 패러디한다.",
  },
  {
    label: "따뜻한 동화",
    direction:
      "어린이에게 읽어주는 따뜻한 동화 문체로 쓴다. '옛날 옛적에'로 시작하고 부드러운 교훈으로 끝맺는다.",
  },
  {
    label: "힙합 스웨거",
    direction:
      "힙합 MC가 랩 가사를 뱉듯 리듬감 있는 문체로 쓴다. 라임을 살리고 자신감 넘치는 스웨거로 그 생을 자랑하듯 서술한다.",
  },
];

// 이름을 안정적인 숫자로 바꾸는 해시 (같은 이름 → 항상 같은 전생 기록)
function hashName(name: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// API 실패 시에도 서비스가 죽지 않도록 하는 대체 작문
function fallbackStory(name: string, r: PastLife): string {
  return (
    `${name}님의 전생 기록입니다.\n\n` +
    `당신은 ${r.era}, ${r.being}(으)로 살았습니다. ` +
    `${r.achievement}. 그러나 ${r.cause}(으)로 생을 마감했습니다.\n\n` +
    `사람들은 당신을 이렇게 기억합니다 — ${r.memory}.`
  );
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
    }

    const cleanName = name.trim();
    const key = cleanName.toLowerCase().replace(/\s+/g, "");
    const record = RECORDS[hashName(key) % RECORDS.length];
    const tone = TONES[Math.floor(Math.random() * TONES.length)];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        name: cleanName,
        tone: "기록 보관소",
        story: fallbackStory(cleanName, record),
        record,
        generated: false,
      });
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-5.5";

    const systemPrompt =
      "당신은 사람들의 전생을 이야기로 써주는 전속 작가다. " +
      "주어진 전생 기록의 다섯 요소(직업/존재, 시대, 사인, 업적, 사람들의 기억)를 모두 자연스럽게 녹여 " +
      "한 편의 완결된 이야기를 한국어로 쓴다. " +
      "분량은 공백 포함 500~800자 사이를 반드시 지키고, 어떤 경우에도 800자를 넘기지 않는다. " +
      "의뢰인의 이름을 이야기 속에서 자연스럽게 불러준다. " +
      "제목, 머리말, 항목 나열 없이 본문만 출력한다.";

    const userPrompt =
      `의뢰인 이름: ${cleanName}\n` +
      `문체 지시: ${tone.direction}\n\n` +
      `전생 기록:\n` +
      `- 전생의 직업/존재: ${record.being}\n` +
      `- 시대: ${record.era}\n` +
      `- 사인: ${record.cause}\n` +
      `- 전생의 업적: ${record.achievement}\n` +
      `- 사람들의 기억: ${record.memory}\n\n` +
      `이 기록을 바탕으로 ${cleanName}님의 전생 이야기를 지시된 문체로 작문해주세요.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("OpenAI API error:", res.status, errBody.slice(0, 500));
      return NextResponse.json({
        name: cleanName,
        tone: "기록 보관소",
        story: fallbackStory(cleanName, record),
        record,
        generated: false,
      });
    }

    const data = await res.json();
    const story: string | undefined = data.choices?.[0]?.message?.content?.trim();

    if (!story) {
      return NextResponse.json({
        name: cleanName,
        tone: "기록 보관소",
        story: fallbackStory(cleanName, record),
        record,
        generated: false,
      });
    }

    return NextResponse.json({
      name: cleanName,
      tone: tone.label,
      story,
      record,
      generated: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "전생을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
