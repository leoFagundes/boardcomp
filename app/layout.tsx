import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BoardComp — Competição de Jogos de Tabuleiro",
  description: "Plataforma de competição entre Funcionários Antigos e Atuais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1A1A1A",
                color: "#E5E5E5",
                border: "1px solid #2A2A2A",
                borderRadius: "10px",
                fontFamily: "'DM Sans', sans-serif",
              },
              success: {
                iconTheme: { primary: "#F59E0B", secondary: "#0A0A0A" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#0A0A0A" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
