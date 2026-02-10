import {NextIntlClientProvider, useMessages} from 'next-intl';
import { cairo } from '@/lib/fonts';
import "../globals.css";
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = useMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={cairo.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
