import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "@/components/StoreProvider";
import SideNav from "@/components/SideNav";
import Signin from "@/modals/Signin";
import Signup from "@/modals/Signup";
import DeleteThread from "@/modals/DeleteThread";
import FullScreenLoader from "@/components/FullScreenLoader";

export const metadata: Metadata = {
  title: "Sera",
  description: "Sera — your AI assistant",
  openGraph: {
    title: "Sera",
    description: "Sera — your AI assistant",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sera",
    description: "Sera — your AI assistant",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
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
            <FullScreenLoader />
            <SideNav />
            <div className="md:pl-50">{children}</div>
            <Signin />
            <Signup />
            <DeleteThread />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
