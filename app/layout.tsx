import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

import ConvexClientProvider from "@/providers/convexClientProvider";
import { ModalProvider } from "@/providers/modal-provider";
import { BoardLoadingProvider } from "@/providers/board-loading-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevDraws",
  description: "Collab on an infinite canvas as you go",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ConvexClientProvider>
            <BoardLoadingProvider>
              <Toaster />
              <ModalProvider />
              {children}
            </BoardLoadingProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
