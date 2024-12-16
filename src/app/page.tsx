import Link from "next/link";
import { links } from "./links";


export default function Home() {
  return (
    <div>
      <main>
        <div>
          <h1>Liber</h1>
          <p>
            Liber is a scripting language designed for numerical analysis,
            symbolic computation, and statistical analysis, written in
            TypeScript. The language is so named from the Latin root for "liberty" ("liber"). The pages below provide the language's documentation.
          </p>
          <p>
            Liber was largely motivated by necessity. As an undergraduate
            studying math and philosophy, I spent a great deal of time writing
            notes by hand and rewriting them in LaTeX. With enough practice and
            a few shortcuts in vim and emacs, I learned to quickly type in
            LaTeX. Unfortunately, I still spent an inordinate amount of time in
            Inkscape generating SVGs of my hand-drawn diagrams.
          </p>
          <p>
            My solution to cutting down that time: Write a program that
            generates the diagrams by code. Thus began Liber's nascency–a
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
        </div>
      </main>
      <footer></footer>
    </div>
  );
}
