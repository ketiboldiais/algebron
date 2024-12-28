/* eslint-disable jsx-a11y/alt-text */
import type { MDXComponents } from "mdx/types";
import REPL from "./components/REPL";
import Terminal from "./components/Terminal";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    REPL,
    Terminal,
    Cols: (props: { children: ReactNode, of?: number}) => (
      <div className={`grid grid-cols-${props.of ?? 2}`}>
        {props.children}
      </div>
    ),
    Procedure: (props) => (
      <div className="procedure">
        {props.children}
      </div>
    ),
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
