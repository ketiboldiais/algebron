import Link from "next/link";
import { links } from "./links";
import { Plot3DTest, TreeTest, PlotTest } from "@/components/Fig";

export default function Home() {
  return (
    <div>
      <main>
        <h1>Liber</h1>
        <div className="main-gallery">
          {/* <TreeTest /> */}
          {/* <PlotTest/> */}
          <Plot3DTest />
        </div>
        <article>
          <p>
            Liber (from the Latin <i>liber</i>, the root of <i>liberty</i>) is a JavaScript math library written in TypeScript. Largely
            motivated by necessity, I began writing Liber as an undergraduate
            studying math and philosophy. Writing notes by hand and rewriting
            them in LaTeX takes a lot of time. With enough practice and a few
            shortcuts in vim and emacs, I learned to quickly type in LaTeX.
            Unfortunately, I still spent hours in
            Inkscape generating SVGs of my hand-drawn diagrams.
          </p>
          <p>
            My solution to cutting down that time: Generate the diagrams by code. Thus began Liber's nascency–a
            smorgasbord of graphics modules. Over time, I wanted more features–a
            class in statistics led to a statistics package, a class in algebra
            led to an automatic simplification function, and so on.
          </p>
          <p>
            Because of the technical background required to understanding
            Liber's implementation and API, this site also serves as a
            repository of my notes from undergrad, many of which are generated
            with Liber.
          </p>
          <ol>
            {links.map((entry) => (
              <li key={entry.url}>
                <Link href={entry.url}>{entry.title}</Link>
              </li>
            ))}
          </ol>
        </article>
      </main>
      <footer>Ketib Oldiais © 2024</footer>
    </div>
  );
}
