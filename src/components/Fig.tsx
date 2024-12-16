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
} from "@/liber/main";
import { CSSProperties, useEffect, useState } from "react";
import katex from "katex";

type FigProps = { d: SVG2D };

export const FigTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis2D("x")
    .domain(D)
    .range(R)
    .ticks({
      length: 0.1,
      step: 1,
      tickFn: (t) => {
        t.label.dy(15);
        return t;
      },
    })
    .done();
  const yAxis = axis2D("y")
    .domain(D)
    .range(R)
    .ticks({
      length: 0.1,
      step: 1,
      tickFn: (t) => {
        t.label.dx(15).dy(4);
        return t;
      },
    })
    .done();

  const d = svg2D([
    grid2D().domain(D).range(R).done(),
    xAxis,
    yAxis,
    line2D([2, 2], [1.5, 1.3]).arrowEnd(),
    text(`\\sin(x^2)`).position(2, 3).latex("inline"),
    cplot("fn f(x) = sin(x^2)").stroke("red").domain(D).range(R).done(),
  ])
    .dimensions(600, 600)
    .domain(D)
    .range(R)
    .done();
  return <Fig d={d} />;
};

const Fig = ({ d }: FigProps) => {
  const par = "xMidYMid meet";
  const width = d.$width;
  const height = d.$height;
  const viewbox = `0 0 ${width} ${height}`;
  const paddingBottom = `${100 * (height / width)}%`;
  const boxcss = {
    display: "inline-block",
    position: "relative",
    width: "100%",
    paddingBottom,
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

export default Fig;
