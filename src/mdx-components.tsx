/* eslint-disable jsx-a11y/alt-text */
import type { MDXComponents } from "mdx/types";
import REPL from "./components/REPL";
import Terminal from "./components/Terminal";
import Image, { ImageProps } from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    REPL,
    Terminal,
    TOC: (props) => (
      <div className="toc">
        <Link href="/">Home</Link>
        <h2>Table of Contents</h2>
        {props.children}
      </div>
    ),
    img: (props) => (
        <Image
          width={200}
          height={200}
          style={{ width: "100%", height: "auto" }}
          {...(props as ImageProps)}
        />
    ),
    ...components,
  };
}
