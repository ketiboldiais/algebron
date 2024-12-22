"use client";

import {
  plot3D,
  svg,
  isGroup,
  GraphicsObj,
  GroupObj,
  cplot,
  Path,
  isPath,
  LineObj,
  isLine,
  line,
  TextObj,
  isText,
  grid,
  Circle,
  isCircle,
  tuple,
  Arrowhead,
  isArrowhead,
  text,
  SVGObj,
  vector,
  haxis,
  vaxis,
  Plot3D,
  Fn3D,
  tree,
  subtree,
  leaf,
  circle,
  range,
  randInt,
  zip,
  forceGraph,
  graph,
  randFloat,
  path,
  convexHull,
} from "@/algebron/main";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import katex from "katex";
import {
  OrbitControls,
  ParametricGeometry,
} from "three/examples/jsm/Addons.js";
import { Canvas, useThree } from "@react-three/fiber";
import { AxesHelper, DoubleSide, GridHelper, Vector3 } from "three";

const axis = (
  on: "x" | "y",
  domain: [number, number],
  range: [number, number]
) => {
  if (on === "x") {
    return haxis(domain, 1)
      .ticks((t) => {
        t.label.dy(15);
        return t;
      })
      .stroke("grey")
      .done();
  } else {
    return vaxis(range, 1)
      .ticks((t) => {
        t.label.dy(5).dx(15);
        return t;
      })
      .stroke("grey")
      .done();
  }
};

type FigProps = { data: SVGObj; width?: number; paddingBottom?: number };

const FIGURE = ({ children }: { children: ReactNode }) => {
  return <figure className="algebron-fig">{children}</figure>;
};

const Fig = ({ data, width = 100, paddingBottom = width }: FigProps) => {
  const par = "xMidYMid meet";
  const w = data.$width;
  const height = data.$height;
  const viewbox = `0 0 ${w} ${height}`;
  const boxcss = {
    display: "block",
    margin: "0 auto",
    position: "relative",
    width: `${width}%`,
    paddingBottom: `${paddingBottom}%`,
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
    <FIGURE>
      <div style={boxcss}>
        <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
          <DEF elements={data.$markers} />
          <Fig2D elements={data.$children} />
        </svg>
      </div>
    </FIGURE>
  );
};

type Fig2DProps = { elements: GraphicsObj[] };

type Path2DProps = { data: Path };

type DEFProps = { elements: Arrowhead[] };
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

const PATH = ({ data }: Path2DProps) => {
  return (
    <path
      d={data.toString()}
      fill={data.$fill}
      fillOpacity={data.$fillOpacity}
      stroke={data.$stroke}
      strokeWidth={data.$strokeWidth}
    />
  );
};

const Fig2D = ({ elements }: Fig2DProps) => {
  return (
    <>
      {elements.map((data) => {
        if (isGroup(data)) {
          return <GROUP key={data.$id} data={data} />;
        }
        if (isPath(data)) {
          return <PATH key={data.$id} data={data} />;
        }
        if (isLine(data)) {
          return <LINE key={data.$id} data={data} />;
        }
        if (isText(data)) {
          return <TEXT key={data.$id} data={data} />;
        }
        if (isCircle(data)) {
          return <CIRCLE key={data.$id} data={data} />;
        }
      })}
    </>
  );
};

type CircleProps = { data: Circle };

const CIRCLE = ({ data }: CircleProps) => {
  return (
    <circle
      cx={data.$position.$x}
      cy={data.$position.$y}
      r={data.$radius}
      fill={data.$fill}
      fillOpacity={data.$fillOpacity}
      strokeWidth={data.$strokeWidth}
      stroke={data.$stroke}
    />
  );
};

type TextProps = { data: TextObj };
const TEXT = ({ data }: TextProps) => {
  if (data.$latex) {
    const block = data.$latex === "block" ? true : false;
    return (
      <foreignObject
        x={data.$position.$x}
        y={data.$position.$y}
        width={data.$width}
        height={data.$height}
        color={data.$fill}
        fontSize={data.$fontSize ? data.$fontSize : "inherit"}
      >
        <Tex content={data.$content} block={block} />
      </foreignObject>
    );
  }
  return (
    <text
      textAnchor={data.$textAnchor}
      x={data.$position.$x}
      y={data.$position.$y}
      dx={data.$dx}
      dy={data.$dy}
      fill={data.$fill}
    >
      {data.$content}
    </text>
  );
};

type GroupProps = { data: GroupObj };
const GROUP = ({ data }: GroupProps) => {
  return (
    <g>
      <Fig2D elements={data.$children} />
    </g>
  );
};

type L2DProps = { data: LineObj };

const LINE = ({ data }: L2DProps) => {
  return (
    <line
      x1={data.$start.$x}
      y1={data.$start.$y}
      x2={data.$end.$x}
      y2={data.$end.$y}
      stroke={data.$stroke}
      strokeWidth={data.$strokeWidth}
      markerEnd={data.$arrowEnd ? `url(#${data.$id}-end)` : ""}
      markerStart={data.$arrowEnd ? `url(#${data.$id}-start)` : ""}
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
  }, [mode, content, displayMode]);
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
  const d = svg([
    grid(D, R).done(),
    line([0, 0], [3, 3]).stroke("red").arrowEnd(),
    line([0, 0], [4, 1]).stroke("red").arrowEnd(),
    line([0, 0], [n.$x, n.$y]).stroke("blue").arrowEnd(),
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
  return <Fig data={d} width={60} />;
};

export const LA2 = () => {
  const D = tuple(-3, 8);
  const R = tuple(-3, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    cplot("fn f(x) = 3x^2 + 4x - 1", D, R).stroke("red").done(),
    cplot("fn f(x) = 4x^2 - 2x + 2", D, R).stroke("blue").done(),
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
  return <Fig data={d} width={60} />;
};

export const LA3 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const j = vector([3, 3]);
  const n = j.mul(2);
  const d = svg([
    grid(D, R).done(),
    line([0, 0], [n.$x, n.$y]).stroke("blue").arrowEnd(),
    line([0, 0], [3, 3]).stroke("red").arrowEnd(),
    text("v").position(2.5, 4).latex("inline"),
    text("2v").position(5, 5.5).latex("inline"),
    xAxis,
    yAxis,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={60} />;
};

export const LA4 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    cplot("fn f(x) = sin(x)", D, R).stroke("red").done(),
    cplot("fn g(x) = cos(x)", D, R).stroke("blue").done(),
    cplot("fn h(x) = cos(x) + sin(x)", D, R).stroke("green").done(),
    text("f(x) = \\sin(x)")
      .fill("red")
      .position(-6, 2.5)
      .width(100)
      .latex("inline"),
    text("g(x) = \\cos(x)")
      .fill("blue")
      .position(-4, -2)
      .width(100)
      .latex("inline"),
    text("h(x) = \\cos(x) + \\sin(x)")
      .fill("green")
      .position(1.5, 4)
      .width(150)
      .latex("inline"),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={60} />;
};

export const LA5 = () => {
  const D = tuple(-2, 5);
  const R = tuple(-2, 5);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    cplot("fn f(x) = (5/4) - x", D, R).stroke("red").done(),
    cplot("fn g(x) = (x/2) - (1/4)", D, R).stroke("blue").done(),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={60} />;
};

function CameraController() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

type Plot3DProps = { data: Plot3D };
export function PLOT3D({ data }: Plot3DProps) {
  const d = data;
  const Plot3DPath = ({ zfn }: { zfn: Fn3D }) => {
    const ref = useRef(null);
    const paramFunction = (x: number, y: number, target: Vector3) => {
      const [X, Y, Z] = zfn(x, y);
      if (Number.isNaN(Z)) {
        return target.set(0.001, 0.001, 0.001);
      }
      return target.set(X, Z, Y);
    };
    const graph = new ParametricGeometry(
      paramFunction,
      d.$segments,
      d.$segments
    );
    return (
      <>
        <mesh ref={ref} scale={d.$scale} geometry={graph}>
          <meshNormalMaterial side={DoubleSide} />
        </mesh>
      </>
    );
  };
  const Paths = () => {
    return (
      <>
        {d.$zFunctions.map((zfn, i) => (
          <Plot3DPath key={`${d.$id}-${i}`} zfn={zfn} />
        ))}
      </>
    );
  };
  const containerStyles: CSSProperties = {
    width: d.$width,
    height: d.$height,
    margin: "0 auto",
  };
  return (
    <FIGURE>
      <div style={containerStyles}>
        <Canvas
          camera={{
            fov: d.$fov,
            position: d.$position,
            near: d.$near,
            far: d.$far,
          }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <CameraController />
          <pointLight position={[0, 250, 0]} color={0xffffff} />
          <primitive object={new AxesHelper(10)} />
          <primitive
            object={new GridHelper(10, 10, d.$gridColor, d.$gridColor)}
          />
          <Paths />
        </Canvas>
      </div>
    </FIGURE>
  );
}

export function Plot3DTest() {
  const d = plot3D("fn z(x,y) = sin(x) + cos(y)").paramFn();
  return <PLOT3D data={d} />;
}
export function Plot3DDemo() {
  const d = plot3D("fn z(x,y) = 4 * e^(-1/4 * y^2) * sin(2x - 1)").paramFn();
  return <PLOT3D data={d} />;
}

export const Calc1 = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const xs = range(-5, 5, 0.5).map((_) => randInt(-4, 4));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ys = range(-5, 5, 0.5).map((_) => randInt(-4, 4));
  const xys = zip(xs, ys).filter(
    ([x, y]) =>
      !(
        (x === 2 && y === 2) ||
        (x === 2 && y === -2) ||
        (x === -2 && y === 2) ||
        (x === -2 && y === -2)
      )
  );
  const cs = xys.map(([x, y]) => circle(5, [x, y]).fill("lightblue"));
  const ts = xys.map(([x, y]) => text(`(${x},${y})`).position(x, y).dy(-10));
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    text("I").position(2, 2),
    text("IV").position(2, -2),
    text("II").position(-2, 2),
    text("III").position(-2, -2),
    ...cs,
    ...ts,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={45} />;
};

export const DistanceBetweenPoints = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    line([1, 1], [-3, 4]).stroke("firebrick"),
    circle(5, [1, 1]).fill("salmon"),
    circle(5, [-3, 4]).fill("salmon"),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={45} />;
};

export const MidpointFig = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    line([0, 1], [-3, 4]).stroke("firebrick"),
    circle(5, [0, 1]).fill("lightblue"),
    circle(5, [-3, 4]).fill("lightblue"),
    circle(5, [-1.5, 2.5]).fill("salmon"),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={45} />;
};

export const DistanceBetweenPoints2 = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  const d = svg([
    grid(D, R).done(),
    xAxis,
    yAxis,
    line([1, 1], [-3, 4]).stroke("firebrick"),
    line([-3, 1], [-3, 4]).stroke("firebrick"),
    line([-3, 1], [1, 1]).stroke("firebrick"),
    circle(5, [1, 1]).fill("salmon"),
    circle(5, [-3, 4]).fill("salmon"),
    circle(5, [-3, 1]).fill("salmon"),
    text("(x_P, y_P)").latex("inline").position(-2.9, 4.7),
    text("(x_Q, y_Q)").latex("inline").position(1, 1.2),
    text("(x_P, y_Q)").latex("inline").position(-4, 1.2),
    text("c").latex("inline").position(-1.5, 3.4).fontSize("16px"),
    text("\\vert y_P - y_Q \\vert")
      .latex("inline")
      .position(-5.2, 3.4)
      .width(100)
      .fontSize("15px"),
    text("\\vert x_P - x_Q \\vert")
      .latex("inline")
      .position(-2.1, 1.2)
      .width(100)
      .fontSize("15px"),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={60} />;
};

export const TreeTest = () => {
  const d = svg([
    tree(
      subtree("a").nodes([
        subtree("b").nodes([leaf("c"), leaf("d")]),
        subtree("e").nodes([
          leaf("j"),
          subtree("f").nodes([subtree("g").nodes([leaf("h"), leaf("i")])]),
        ]),
      ])
    )
      .nodeFn((node) => circle(5, [node.$x, node.$y]).fill("salmon"))
      .labelFn((node) =>
        text(node.$name).position(node.$x, node.$y).dx(-10).dy(0)
      )
      .layout("reingold-tilford")
      .done(),
  ])
    .dimensions(400, 300)
    .domain([-10, 10])
    .range([-3, 3])
    .done();
  return (
    <div>
      <Fig data={d} width={70} paddingBottom={43} />
    </div>
  );
};

export const PlotTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xaxis = axis("x", D, R);
  const yaxis = axis("y", D, R);
  const d = svg([
    xaxis,
    yaxis,
    cplot("fn f(x) = sin(x)", D, R).stroke("red").done(),
    cplot("fn g(x) = cos(x)", D, R).stroke("blue").done(),
    cplot("fn h(x) = cos(x) + sin(x)", D, R).stroke("green").done(),
    cplot("fn n(x) = 2cos(x)", D, R).stroke("purple").done(),
  ])
    .dimensions(600, 600)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={70} />;
};

export const GraphDemo = () => {
  const N = 90;
  const D = tuple(-N, N);
  const R = tuple(-N, N);
  const d = svg([
    forceGraph(
      graph({
        a: ["b", "x", "n"],
        b: ["c", "d", "g", "n"],
        c: ["e", "g"],
        d: ["j", "k", "e"],
        e: ["k"],
        j: ["x", "s", "a"],
        k: ["j", "s"],
        n: ["g", "x"],
        x: ["s"],
      })
    )
      .domain(D)
      .range(R)
      .nodeColor("lightblue")
      .edgeColor("teal")
      .nodeRadius(3)
      .done(),
  ])
    .dimensions(300, 300)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={60} paddingBottom={60} />;
};

export const ConvexHullDemo = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const epsilon = 0.2;
  const xAxis = axis("x", D, R);
  const yAxis = axis("y", D, R);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const xs = range(-5, 5, epsilon).map((_) => randFloat(-4, 4));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ys = range(-5, 5, epsilon).map((_) => randFloat(-4, 4));
  const points = zip(xs, ys).map(([x, y]) => vector([x, y]));
  const chull = convexHull(points);
  let p = path();
  chull.hull.forEach((v, i) => {
    if (i === 0) {
      p = path(v.$x, v.$y);
    } else {
      p.L(v.$x, v.$y);
    }
  });
  p.L(chull.leftmost.$x, chull.leftmost.$y);
  p.stroke("olivedrab").strokeWidth(1).fill("lightgreen").fillOpacity("20%");
  const cs = points.map((v) => {
    return circle(5, [v.$x, v.$y]).fill("olivedrab").fillOpacity("50%");
  });
  const d = svg([grid(D, R).done(), xAxis, yAxis, p, ...cs])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={45} />;
};

export default Fig;
