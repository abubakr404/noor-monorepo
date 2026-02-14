import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { tajawal } from "@/lib/fonts";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BottomNav } from "@/components/bottom-nav";

export const metadata = {
  title: "ذِكر | Zikr",
  description:
    "تطبيق الأذكار والتسبيح — Morning, Evening & Night Azkar with Counter",
  manifest: "/manifest.json",
  themeColor: "#F59E0B",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={tajawal.variable}
      suppressHydrationWarning
    >
      <body className={`${tajawal.className} bg-texture`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <main className="min-h-screen pb-20">{children}</main>
                <BottomNav />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
