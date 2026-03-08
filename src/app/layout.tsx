import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "@/components/StoreProvider";
import SideNav from "@/components/SideNav";
import Signin from "@/modals/Signin";
import Signup from "@/modals/Signup";

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
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <StoreProvider>
            <SideNav />
            <div className="pl-50">{children}</div>
            <Signin />
          <Signup />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
