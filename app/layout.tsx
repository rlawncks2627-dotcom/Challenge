import type { Metadata } from "next";
import { Gothic_A1, IBM_Plex_Mono, Jua } from "next/font/google";
import "./globals.css";

// 손으로 칠한 간판 글씨 같은 둥근 활자. 워드마크와 큰 숫자에만 쓴다.
//
// 이 두 서체는 subsets 를 지정하지 않는다. next/font 의 폰트 데이터에는
// 한글 서브셋이 등록돼 있지 않아서, latin 만 요청하면 한글이 시스템 폰트로
// 떨어진다. 서브셋을 비우면 전체 유니코드 범위를 받아온다(대신 preload 불가).
const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  display: "swap",
  preload: false,
});

const gothic = Gothic_A1({
  variable: "--font-gothic",
  weight: ["400", "500", "700", "800"],
  display: "swap",
  preload: false,
});

// 초대코드처럼 '코드'인 것에만. 장식이 아니라 의미다.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "그린스텝 — 친환경 행동 실천 챌린지",
  description: "매일 작은 실천을 모아 함께 탄소를 줄이는 캠페인 앱",
};

export const viewport = {
  // 대부분 휴대폰에서 열린다. 기본값에 기대지 않고 명시한다.
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dcedf2" },
    { media: "(prefers-color-scheme: dark)", color: "#15272c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${jua.variable} ${gothic.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
