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
      <body
        className={`${lxgwWenkai.variable} ${longCang.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
