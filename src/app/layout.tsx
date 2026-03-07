import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import SideNav from "@/components/SideNav";

export const metadata: Metadata = {
  title: "Sera",
  description: "Sera — your AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>
          <SideNav />
          <div className="pl-[200px]">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
