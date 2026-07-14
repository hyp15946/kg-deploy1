# 🔮 전생 이야기 (Past Life)

이름을 입력하면 그 사람의 전생을 OpenAI GPT가 이야기로 써주는 한 기능짜리 웹 서비스입니다.
(TypeScript · Next.js · OpenAI · Vercel 배포)

## 로컬 실행

```bash
npm install
# .env.local 에 OPENAI_API_KEY 입력 후
npm run dev
# http://localhost:3000
```

## 구조

- `app/page.tsx` — 인풋창 1개짜리 화면
- `app/api/past-life/route.ts` — OpenAI 호출 서버 라우트 (API 키는 서버에만 존재, 브라우저 노출 없음)
- `.env.local` — 로컬용 키 (git에 커밋되지 않음)

## GitHub 연결 (Deploy Key 방식)

1. https://github.com/hyp15946/kg-deploy1/settings/keys/new 에서
   - **Title**: `kg-deploy1 local deploy key`
   - **Key**: `~/.ssh/kg-deploy1_deploy.pub` 의 내용
   - **Allow write access** 체크 (push 하려면 필수)
2. 로컬에서 push:
   ```bash
   git push -u origin main
   ```
   (이 저장소는 `core.sshCommand`로 해당 deploy key를 사용하도록 설정돼 있습니다.)

## Vercel 배포

1. https://vercel.com → **Add New → Project → Import** 에서 `kg-deploy1` 저장소 선택
2. Framework 은 **Next.js** 자동 인식
3. **Environment Variables** 에 추가:
   - `OPENAI_API_KEY` = 본인 키
   - `OPENAI_MODEL` = `gpt-5.5` (원하는 모델)
4. **Deploy** → 이후 `git push` 할 때마다 자동 재배포
