import { Urbanist } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const urban = Urbanist({ subsets: ["latin"] });

export const metadata = {
  title: "E-Cart",
  description: "e cart app for detecting the product displayed in the camera and confirming barcode integrated with the firebase seamlessly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />      
      </head>
      <body className={urban.className}>
        <main className="h-screen w-full">
          <Navbar />
          {children}
        </main>
      </body> 
    </html>
  );
}
