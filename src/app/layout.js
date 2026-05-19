import "./globals.css";

export const metadata = {
  title: "Bit Heroes Familiar Fusion Atlas",
  description:
    "Static Bit Heroes familiar and fusion lookup built from archived wiki pages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
