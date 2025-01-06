/* eslint-disable jsx-a11y/alt-text */
import type { MDXComponents } from "mdx/types";
import REPL from "./components/REPL";
import Terminal from "./components/Terminal";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    REPL,
    Terminal,
    Cols: (props: { children: ReactNode; of?: number }) => {
      const columnCount = props.of ?? 2;
      const style: CSSProperties = {
        display: 'grid',
        gridTemplateColumns: (`repeat(${columnCount}, 1fr)`)
      }
      return (
        <div style={style}>
          {props.children}
        </div>
      );
    },
    Warning: () => <span className="warning">&#9888;</span>,
    Procedure: (props) => <div className="procedure">{props.children}</div>,
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
