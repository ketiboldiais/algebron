"use client";

import { axis, circle, cplot, interpolator, line, svg, text, tuple } from "@/algebron/main";
import Fig, { cssvar, Img, Tex } from "./Fig";
import Relations1 from "../../public/diagrams/relations1.svg";
import vertical_symmetry from "../../public/diagrams/vertical_symmetry.svg"
import Q1 from "../../public/diagrams/quadratic.svg";
import { useState, ChangeEvent, useEffect } from "react";



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

export const QuadraticFunctionLab = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const RI = tuple(0, 100);
  const xAxis = axis({ on: "x", domain: D, range: R, color: 'grey' });
  const yAxis = axis({ on: "y", domain: D, range: R, color: 'grey' });

  const [AValue, setAValue] = useState(2);
  const [BValue, setBValue] = useState(-2);
  const [CValue, setCValue] = useState(-5);
  const [vtx, setVTX] = useState({
    x: -BValue / (2 * AValue),
    y: (4 * AValue * CValue - BValue ** 2) / (4 * AValue),
  });
  const [fn, setFn] = useState(
    `f(x) = (${AValue} * x^2) + (${BValue} * x) + ${CValue}`
  );
  const [latex, setLatex] = useState(`f(x) = ${AValue}x + ${BValue}`);
  const X = interpolator(RI, D);

  const handleARangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setAValue(+X(value).toPrecision(3));
  };
  const handleBRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setBValue(+X(value).toPrecision(3));
  };
  const handleCRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setCValue(+X(value).toPrecision(3));
  };
  useEffect(() => {
    setFn(`f(x) = (${AValue} * x^2) + (${BValue} * x) + ${CValue}`);
    setLatex(
      `f(x) = ${AValue}x^2 ${BValue < 0 ? "-" : "+"} ${Math.abs(BValue)}x ${
        CValue < 0 ? "-" : "+"
      } ${Math.abs(CValue)}`
    );
    setVTX({
      x: -BValue / (2 * AValue),
      y: (4 * AValue * CValue - BValue ** 2) / (4 * AValue),
    });
  }, [AValue, BValue, CValue]);

  const d = svg({
    width: 500,
    height: 500,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot(`fn ${fn}`, D, R).stroke('black').done(),
    line([vtx.x, R[0]], [vtx.x, R[1]]).stroke('black').strokeDashArray(8),
    circle(5, [vtx.x, vtx.y]).fill('black'),
    text(`(${vtx.x.toPrecision(3)}, ${vtx.y.toPrecision(3)})`)
      .position(vtx.x, vtx.y)
      .dx(50)
      .fill(cssvar("foreground")),
  ]);

  return (
    <div className="live-demo">
      <div className="flex flex-col demo-control">
        <Tex content={`${latex}`} />
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-3"
            type="range"
            onChange={handleARangeChange}
          />
          <Tex content={`a = ${AValue}`} />
        </div>
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-3"
            type="range"
            onChange={handleBRangeChange}
          />
          <Tex content={`b = ${BValue}`}/>
        </div>
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-3"
            type="range"
            onChange={handleCRangeChange}
          />
          <Tex content={`c = ${CValue}`}/>
        </div>
      </div>
      <Fig data={d} width={70} />
    </div>
  );
};

export const VerticalSymmetry = () => (
  <Img width={250} url={vertical_symmetry} alt="vertical symmetry function"/>
)