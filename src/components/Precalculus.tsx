"use client";

import { axis, cplot, svg, text, tuple } from "@/algebron/main";
import Fig, { Img } from "./Fig";
import Relations1 from "../../public/diagrams/relations1.svg";
import Q1 from "../../public/diagrams/quadratic.svg";



export const ImageRelations1 = () => (
	<Img url={Relations1} alt={"Function mappings"}/>
)

export const Affine1 = () => {
  const domain = tuple(-5, 5);
  const range = tuple(-5, 5);
  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
  }).children([
    axis({ on: "x", domain, range, color: "slategrey" }),
    axis({ on: "y", domain, range, color: "slategrey" }),
    cplot("fn f(x) = 2x + 1", domain, range)
      .strokeWidth(2)
      .stroke("grey")
      .done(),
    text("y = 2x + 1")
      .latex("block")
      .width(100)
      .fontSize(20)
      .fill("grey")
      .position(1, 2),
  ]);
  return <Fig data={d} width={80} />;
};

export const Affine2 = () => {
  const domain = tuple(-5, 5);
  const range = tuple(-5, 5);
  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
  }).children([
    axis({ on: "x", domain, range, color: "slategrey" }),
    axis({ on: "y", domain, range, color: "slategrey" }),
    cplot("fn f(x) = 2-x/3", domain, range)
      .strokeWidth(2)
      .stroke("grey")
      .done(),
    text("y = 2-\\dfrac{x}{3}")
      .latex("block")
      .width(100)
      .height(60)
      .fontSize(20)
      .fill("grey")
      .position(-3, 1.8),
  ]);
  return <Fig data={d} width={80} />;
};

export const Quadratic1 = () => (
	<Img url={Q1} alt="Quadratic function"/>
)
