import type { Metadata } from "next";
import { Gasoek_One, IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

// 포스터용 디스플레이. 워드마크와 큰 숫자에만 쓴다.
//
// 이 두 서체는 subsets 를 지정하지 않는다. next/font 의 폰트 데이터에는
// 한글 서브셋이 등록돼 있지 않아서, latin 만 요청하면 한글이 시스템 폰트로
// 떨어진다. 서브셋을 비우면 전체 유니코드 범위를 받아온다(대신 preload 불가).
const gasoek = Gasoek_One({
  variable: "--font-gasoek",
  weight: "400",
  display: "swap",
  preload: false,
});

const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  weight: ["400", "500", "600", "700"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edefe6" },
    { media: "(prefers-color-scheme: dark)", color: "#131611" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${gasoek.variable} ${plexKr.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
