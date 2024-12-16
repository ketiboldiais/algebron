"use client";

import {
  svg2D,
  group2D,
  isGroup2D,
  Graphics2DObj,
  Group2D,
  cplot,
  Path,
  isPath,
  Line2D,
  isLine2D,
  line2D,
  axis2D,
  Text2D,
  isText2D,
  grid2D,
  circle,
  Circle2D,
  isCircle,
  tuple,
  ArrowHead2D,
  isArrowhead,
  text,
  SVG2D,
  vector,
} from "@/liber/main";
import { CSSProperties, useEffect, useState } from "react";
import katex from "katex";

const axis = (
  on: "x" | "y",
  domain: [number, number],
  range: [number, number]
) => {
  return axis2D(on)
    .stroke("grey")
    .domain(domain)
    .range(range)
    .ticks({
      length: 0.1,
      step: 1,
      tickFn: (t) => {
        if (on === "x") {
          t.label.dy(15);
        } else {
          t.label.dy(5).dx(15);
        }
        return t;
      },
    })
    .done();
};

export const FigTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const angle = Math.PI/2;
  const xmin = D[0];
  const xmax = D[1];
  const ymin = R[0]
  const ymax = R[1];
  const xaxis = line2D([xmin,0], [xmax,0]).stroke('green');
  const yaxis = line2D([0,ymin], [0,ymax]).stroke('red');
  const zaxis = line2D([0,ymin], [0,ymax]);
  const d = svg2D([
    xaxis, 
    yaxis, 
    // zaxis
])
    .dimensions(600, 600)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} />;
};

type FigProps = { d: SVG2D; w?: number; p?: number };

const Fig = ({ d, w = 100 }: FigProps) => {
  const par = "xMidYMid meet";
  const width = d.$width;
  const height = d.$height;
  const viewbox = `0 0 ${width} ${height}`;
  const paddingBottom = `${100 * (height / width)}%`;
  const boxcss = {
    display: "block",
    margin: "1vh auto",
    position: "relative",
    width: `${w}%`,
    paddingBottom: `${w}%`,
    overflow: "hidden",
  } as const;
  const svgcss = {
    display: "inline-block",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  } as const;

  return (
    <div style={boxcss}>
      <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
        <DEF elements={d.$markers} />
        <Fig2D elements={d.$children} />
      </svg>
    </div>
  );
};

type Fig2DProps = { elements: Graphics2DObj[] };

type Path2DProps = { element: Path };

type DEFProps = { elements: ArrowHead2D[] };
const DEF = ({ elements }: DEFProps) => {
  return (
    <defs>
      {elements.map((e, i) => {
        if (isArrowhead(e)) {
          return (
            <marker
              key={`${e.$id}-${e.$type}-${i}`}
              id={`${e.$id}-${e.$type}`}
              markerWidth={e.$markerWidth}
              markerHeight={e.$markerHeight}
              refX={e.$refX}
              refY={e.$refY}
              orient={e.$orient}
              markerUnits={"strokeWidth"}
              viewBox={"0 -5 10 10"}
            >
              <path d={e.$d} fill={e.$fill} stroke={e.$stroke} />
            </marker>
          );
        }
        return <></>;
      })}
    </defs>
  );
};

const Path2D = ({ element }: Path2DProps) => {
  return (
    <path
      d={element.toString()}
      fill={element.$fill}
      stroke={element.$stroke}
      strokeWidth={element.$strokeWidth}
    />
  );
};

const Fig2D = ({ elements }: Fig2DProps) => {
  return (
    <>
      {elements.map((element) => {
        if (isGroup2D(element)) {
          return <G2D key={element.$id} element={element} />;
        }
        if (isPath(element)) {
          return <Path2D key={element.$id} element={element} />;
        }
        if (isLine2D(element)) {
          return <L2D key={element.$id} element={element} />;
        }
        if (isText2D(element)) {
          return <Txt key={element.$id} element={element} />;
        }
        if (isCircle(element)) {
          return <Circ key={element.$id} element={element} />;
        }
      })}
    </>
  );
};

type CircleProps = { element: Circle2D };
const Circ = ({ element }: CircleProps) => {
  return (
    <circle
      cx={element.$position.$x}
      cy={element.$position.$y}
      r={element.$radius}
      fill={element.$fill}
      strokeWidth={element.$strokeWidth}
      stroke={element.$stroke}
    />
  );
};

type TxtProps = { element: Text2D };
const Txt = ({ element }: TxtProps) => {
  if (element.$latex) {
    let block = element.$latex === "block" ? true : false;
    return (
      <foreignObject
        x={element.$position.$x}
        y={element.$position.$y}
        width={element.$width}
        height={element.$height}
        color={element.$fill}
      >
        <Tex content={element.$content} block={block} />
      </foreignObject>
    );
  }
  return (
    <text
      textAnchor={element.$textAnchor}
      x={element.$position.$x}
      y={element.$position.$y}
      dx={element.$dx}
      dy={element.$dy}
      fill={element.$fill}
    >
      {element.$content}
    </text>
  );
};

type G2DProps = { element: Group2D };
const G2D = ({ element }: G2DProps) => {
  return (
    <g>
      <Fig2D elements={element.$children} />
    </g>
  );
};

type L2DProps = { element: Line2D };

const L2D = ({ element }: L2DProps) => {
  return (
    <line
      x1={element.$start.$x}
      y1={element.$start.$y}
      x2={element.$end.$x}
      y2={element.$end.$y}
      stroke={element.$stroke}
      strokeWidth={element.$strokeWidth}
      markerEnd={element.$arrowEnd ? `url(#${element.$id}-end)` : ""}
      markerStart={element.$arrowEnd ? `url(#${element.$id}-start)` : ""}
    />
  );
};

type TexProps = {
  content: string | number;
  block?: boolean;
  style?: CSSProperties;
};

type Html = { __html: string };

const html = (__html: string): Html => ({ __html });

export const Tex = ({ content, block, style }: TexProps) => {
  const mode = block;
  const Component = block ? "div" : "span";
  const displayMode = mode !== undefined;
  const [state, enstate] = useState(html(""));
  useEffect(() => {
    try {
      const data = katex.renderToString(`${content}`, {
        displayMode,
        throwOnError: false,
        output: "html",
        errorColor: "tomato",
      });
      enstate(html(data));
    } catch (error) {
      if (error instanceof Error) {
        enstate(html(error.message));
      } else {
        enstate(html(""));
      }
    }
  }, [mode, content]);
  return <Component style={style} dangerouslySetInnerHTML={state} />;
};

export const LA1 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const j = vector([3, 3]);
  const k = vector([4, 1]);
  const n = j.add(k);
  const d = svg2D([
    grid2D().domain(D).range(R).done(),
    line2D([0, 0], [3, 3]).stroke("red").arrowEnd(),
    line2D([0, 0], [4, 1]).stroke("red").arrowEnd(),
    line2D([0, 0], [n.$x, n.$y]).stroke("blue").arrowEnd(),
    text("a").position(2.5, 4).fill("red").latex("inline"),
    text("b").position(3.5, 2).fill("red").latex("inline"),
    text("a + b").position(5, 5.5).fill("blue").latex("inline"),
    xAxis,
    yAxis,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} w={60} />;
};

export const LA2 = () => {
  const D = tuple(-3, 8);
  const R = tuple(-3, 8);
  const xAxis = axis('x', D, R);
  const yAxis = axis('y', D, R);
  const d = svg2D([
    grid2D().domain(D).range(R).done(),
    cplot("fn f(x) = 3x^2 + 4x - 1").domain(D).range(R).stroke("red").done(),
    cplot("fn f(x) = 4x^2 - 2x + 2").domain(D).range(R).stroke("blue").done(),
    text("3x^2 + 4x - 1").fill("red").position(1, 2).width(100).latex("inline"),
    text("4x^2 - 2x + 2")
      .position(1.5, 6)
      .fill("blue")
      .width(100)
      .latex("inline"),
    xAxis,
    yAxis,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} w={60} />;
};

export const LA3 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const j = vector([3, 3]);
  const n = j.mul(2);
  const d = svg2D([
    grid2D().domain(D).range(R).done(),
    line2D([0, 0], [n.$x, n.$y]).stroke("blue").arrowEnd(),
    line2D([0, 0], [3, 3]).stroke("red").arrowEnd(),
    text("v").position(2.5, 4).latex("inline"),
    text("2v").position(5, 5.5).latex("inline"),
    xAxis,
    yAxis,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} w={60} />;
};

export const LA4 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const j = vector([3, 3]);
  const n = j.mul(2);
  const d = svg2D([
    grid2D().domain(D).range(R).done(),
    xAxis,
    yAxis,
    cplot('fn f(x) = sin(x)').stroke('red').done(),
    cplot('fn g(x) = cos(x)').stroke('blue').done(),
    cplot('fn h(x) = cos(x) + sin(x)').stroke('green').done(),
    text("f(x) = \\sin(x)").fill("red").position(-6,2.5).width(100).latex("inline"),
    text("g(x) = \\cos(x)").fill("blue").position(-4,-2).width(100).latex("inline"),
    text("h(x) = \\cos(x) + \\sin(x)").fill("green").position(1.5,4).width(150).latex("inline"),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} w={60} />;
};

export default Fig;
