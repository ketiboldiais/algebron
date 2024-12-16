import type { MDXComponents } from "mdx/types";
import REPL from "./components/REPL";
import Terminal from "./components/Terminal";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    REPL,
    Terminal,
    ...components,
  };
}