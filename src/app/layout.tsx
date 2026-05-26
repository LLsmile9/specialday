import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const lxgwWenkai = localFont({
  src: [
    {
      path: "../fonts/LXGWWenKai-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/LXGWWenKai-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lxgw-wenkai",
  display: "swap",
  fallback: ["LXGW WenKai Screen", "LXGW WenKai", "serif"],
});

const longCang = localFont({
  src: [
    {
      path: "../fonts/LongCang-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-long-cang",
  display: "swap",
  fallback: ["Long Cang", "LXGW WenKai Screen", "LXGW WenKai", "serif"],
});

export const metadata: Metadata = {
  title: "送你一份祝福 | A Blessing For You",
  description:
    "回答几个小问题，为你生成专属的生日祝福 | Answer a few questions to create your personalized birthday blessing",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* CDN fonts as fallback for characters not in local subset */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/long-cang@2.0.0/font.css"
        />
      </head>
      <body
        className={`${lxgwWenkai.variable} ${longCang.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
