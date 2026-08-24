import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "@/context/ThemeContext";
import { getFrontendBaseUrl } from "@/lib/frontendBaseUrl";

const baseUrl = getFrontendBaseUrl();
const siteName = "myNachiketa";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Minimal app template with authentication.",
  robots: { index: false, follow: false },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('finds-theme');
    var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f6f8fc] text-slate-900 transition-colors duration-200 dark:bg-[#0b1120] dark:text-slate-100">
        <SessionWrapper>
          <ThemeProvider>
            <div className="flex-1">{children}</div>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
