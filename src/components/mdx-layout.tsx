import Link from "next/link";
import { ReactNode } from "react";

export default function MdxLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Link href="/">Home</Link>
      <article>{children}</article>
    </>
  );
}
