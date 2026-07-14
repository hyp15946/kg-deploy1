import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전생 이야기 | Past Life",
  description: "이름을 넣으면 그 사람의 전생을 GPT가 써드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
