import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SecurePass: Secure Password Generator",
  description: "SecurePass is a simple and secure password generator built with Next.js. This application helps users create strong passwords by allowing them to specify the password length and include/exclude numbers and symbols",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
