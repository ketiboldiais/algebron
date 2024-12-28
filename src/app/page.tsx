import Link from "next/link";
import { links } from "./links";
import { Plot3DTest } from "@/components/Fig";

export default function Home() {
  return (
    <div>
      <main>
        <h1>Algebron</h1>
        <div className="main-gallery">
          <Plot3DTest />
        </div>
        <article>
          <p>
            Algebron is a JavaScript math library written in TypeScript. The
            library provides:
          </p>
          <ol>
            <li>implementations of common data structures; </li>
            <li>
              APIs for scientific computation, numeric analysis, and statistics;
            </li>
            <li>CAS (Computer Algebra System) functions; </li>
            <li>an API for 2D and 3D graphics processing; and</li>
            <li>a scripting language called Praxis.</li>
          </ol>
          <p>
            Largely motivated by necessity, I began writing Algebron as an
            undergraduate studying math and philosophy. Writing notes by hand
            and rewriting them in LaTeX takes a lot of time. With enough
            practice and a few shortcuts in vim and emacs, I learned to quickly
            type in LaTeX. Unfortunately, I still spent hours in Inkscape
            generating SVGs of my hand-drawn diagrams.
          </p>
          <p>
            My solution to cutting down that time: Generate the diagrams by
            code. Thus began Algebron&apos;s nascency–a smorgasbord of graphics
            modules. Over time, I wanted more features–a class in statistics led
            to a statistics package, a class in algebra led to an automatic
            simplification function, and so on.
          </p>
          <p>
            Because of the technical background required to understanding
            Algebron&apos;s implementation and API, this site also serves as a
            repository of my notes from undergrad, many of which are generated
            with Algebron.
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
