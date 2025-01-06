/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import {
  plot3D,
  svg,
  isGroup,
  Group,
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
  ArrowHead,
  isArrowhead,
  text,
  SVG,
  vector,
  haxis,
  vaxis,
  Plot3D,
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
  interpolator,
  curveCubicBezier,
  curveLinear,
  curveCardinal,
  curveCatmullRom,
  curveBlob,
  Function3D,
  isSafeNumber,
  plotPolar,
  polarAxes,
  Renderable,
  SVGContext,
  angleMarker,
  triangle,
  polarToCartesian,
  toRadians,
  path3D,
  Path3D,
  isPath3D,
  arrowhead,
  arcFromPoints,
  xtick,
  ytick,
  fplot3D,
  Polyline,
  isPolyline,
  Polygon,
  isPolygon,
  plotSeq,
} from "@/algebron/main";

import {
  ChangeEvent,
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import katex from "katex";
import {
  OrbitControls,
  ParametricGeometry,
} from "three/examples/jsm/Addons.js";
import { Canvas, useThree } from "@react-three/fiber";
import { AxesHelper, DoubleSide, GridHelper, Vector3 } from "three";

const cssvar = (varname: string) => `var(--${varname})`;

type AxisSpec = {
  on: "x" | "y";
  domain: [number, number];
  range: [number, number];
  hideTicks?: boolean;
};

const axis = (spec: AxisSpec) => {
  const out = spec.on === "x" ? haxis(spec.domain, 1) : vaxis(spec.range, 1);
  out.stroke(cssvar("lightgrey"));
  if (!spec.hideTicks) {
    if (spec.on === "x") {
      out.ticks((t) => {
        t.label.dy(15);
        return t;
      });
    } else {
      out.ticks((t) => {
        t.label.dy(5).dx(15);
        return t;
      });
    }
  }
  out.done();
  return out;
};

const FIGURE = ({ children }: { children: ReactNode }) => {
  return <figure className="algebron-fig">{children}</figure>;
};

type FigProps = {
  data: SVG;
  width?: number;
  paddingBottom?: number;
  title?: ReactNode;
  translate?: [number, number];
};

const Fig = ({
  data,
  width = 100,
  paddingBottom = width,
  title,
  translate,
}: FigProps) => {
  const par = "xMidYMid meet";
  const tx = translate ? translate[0] : 0;
  const ty = translate ? translate[1] : 0;
  const viewbox = `0 0 ${data._width} ${data._height}`;
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
          <DEF elements={data._markers} />
          <g transform={`translate(${tx},${ty})`}>
            <Fig2D elements={data._children} />
          </g>
        </svg>
      </div>
      {title && <figcaption>{title}</figcaption>}
    </FIGURE>
  );
};

type Fig2DProps = { elements: Renderable[] };

type PathProps = { data: Path | Path3D };

type DEFProps = { elements: ArrowHead[] };
const DEF = ({ elements }: DEFProps) => {
  return (
    <defs>
      {elements.map((e, i) => {
        if (isArrowhead(e)) {
          return (
            <marker
              fillOpacity={e._fillOpacity}
              key={`${e._id}-${e._type}-${i}`}
              id={`${e._id}-${e._type}`}
              markerWidth={e._markerWidth}
              markerHeight={e._markerHeight}
              refX={e._refX}
              refY={e._refY}
              orient={e._orient}
              markerUnits={"strokeWidth"}
              viewBox={"0 -5 10 10"}
            >
              <path d={e._d} fill={e._fill} stroke={e._stroke} />
            </marker>
          );
        }
        return <></>;
      })}
    </defs>
  );
};

const PATH = ({ data }: PathProps) => {
  return (
    <path
      d={data.toString()}
      fill={data._fill}
      fillOpacity={data._fillOpacity}
      stroke={data._stroke}
      strokeWidth={data._strokeWidth}
      strokeDasharray={data._strokeDashArray}
      markerEnd={data._arrowEnd ? `url(#${data._id}-end)` : ""}
      markerStart={data._arrowStart ? `url(#${data._id}-start)` : ""}
    />
  );
};

const Fig2D = ({ elements }: Fig2DProps) => {
  return (
    <>
      {elements.map((data) => {
        if (isGroup(data)) {
          return <GROUP key={data._id} data={data} />;
        }
        if (isPath(data) || isPath3D(data)) {
          return <PATH key={data._id} data={data} />;
        }
        if (isLine(data)) {
          return <LINE key={data._id} data={data} />;
        }
        if (isText(data)) {
          return <TEXT key={data._id} data={data} />;
        }
        if (isCircle(data)) {
          return <CIRCLE key={data._id} data={data} />;
        }
        if (isPolyline(data)) {
          return <POLYLINE key={data._id} data={data} />;
        }
        if (isPolygon(data)) {
          return <POLYGON key={data._id} data={data} />;
        }
      })}
    </>
  );
};

type POLYLINE_PROPS = { data: Polyline };

const POLYLINE = ({ data }: POLYLINE_PROPS) => (
  <polyline points={data.points()} fill={"none"} stroke={"black"} />
);

type POLYGON_PROPS = { data: Polygon };
const POLYGON = ({ data }: POLYGON_PROPS) => (
  <polygon points={data.points()} fill={"none"} stroke={"black"} />
);

type CircleProps = { data: Circle };

const CIRCLE = ({ data }: CircleProps) => {
  return (
    <circle
      cx={data._cx}
      cy={data._cy}
      r={data._radius}
      fill={data._fill}
      fillOpacity={data._fillOpacity}
      strokeWidth={data._strokeWidth}
      stroke={data._stroke}
      strokeDasharray={data._strokeDashArray}
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
        fontStyle={data.$fontStyle ? data.$fontStyle : "inherit"}
      >
        <Tex content={data.$content} block={block} />
      </foreignObject>
    );
  }
  return (
    <text
      textAnchor={data.$textAnchor}
      fontStyle={data.$fontStyle}
      fontSize={data.$fontSize ? data.$fontSize : "inherit"}
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

type GroupProps = { data: Group };
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
      strokeDasharray={data.$strokeDashArray}
      markerEnd={data._arrowEnd ? `url(#${data._id}-end)` : ""}
      markerStart={data._arrowStart ? `url(#${data._id}-start)` : ""}
      strokeOpacity={data.$strokeOpacity}
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
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const j = vector([3, 3]);
  const k = vector([4, 1]);
  const n = j.add(k);
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    line([0, 0], [3, 3]).stroke(cssvar("red")).arrowEnd(),
    line([0, 0], [4, 1]).stroke(cssvar("red")).arrowEnd(),
    line([0, 0], [n.$x, n.$y]).stroke(cssvar("blue")).arrowEnd(),
    text("a").position(2.5, 4).fill(cssvar("red")).latex("inline"),
    text("b").position(3.5, 2).fill(cssvar("red")).latex("inline"),
    text("a + b").position(5, 5.5).fill(cssvar("blue")).latex("inline"),
    xAxis,
    yAxis,
  ]);
  return <Fig data={d} width={60} />;
};

export const LA2 = () => {
  const D = tuple(-3, 8);
  const R = tuple(-3, 8);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    cplot("fn f(x) = 3x^2 + 4x - 1", D, R).stroke(cssvar("red")).done(),
    cplot("fn f(x) = 4x^2 - 2x + 2", D, R).stroke(cssvar("blue")).done(),
    text("3x^2 + 4x - 1")
      .fill(cssvar("red"))
      .position(1, 2)
      .width(100)
      .latex("inline"),
    text("4x^2 - 2x + 2")
      .position(1.5, 6)
      .fill(cssvar("blue"))
      .width(100)
      .latex("inline"),
    xAxis,
    yAxis,
  ]);
  return <Fig data={d} width={60} />;
};

export const LA3 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const j = vector([3, 3]);
  const n = j.mul(2);
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    line([0, 0], [n.$x, n.$y]).stroke(cssvar("blue")).arrowEnd(),
    line([0, 0], [3, 3]).stroke(cssvar("red")).arrowEnd(),
    text("v").position(2.5, 4).latex("inline"),
    text("2v").position(5, 5.5).latex("inline"),
    xAxis,
    yAxis,
  ]);
  return <Fig data={d} width={60} />;
};

export const LA4 = () => {
  const D = tuple(-8, 8);
  const R = tuple(-8, 8);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    xAxis,
    yAxis,
    cplot("fn f(x) = sin(x)", D, R).stroke(cssvar("red")).done(),
    cplot("fn g(x) = cos(x)", D, R).stroke(cssvar("blue")).done(),
    cplot("fn h(x) = cos(x) + sin(x)", D, R).stroke(cssvar("green")).done(),
    text("f(x) = \\sin(x)")
      .fill(cssvar("red"))
      .position(-6, 3)
      .width(100)
      .latex("inline"),
    text("g(x) = \\cos(x)")
      .fill(cssvar("blue"))
      .position(-4, -2)
      .width(100)
      .latex("inline"),
    text("h(x) = \\cos(x) + \\sin(x)")
      .fill(cssvar("green"))
      .position(1.5, 4)
      .width(150)
      .latex("inline"),
  ]);
  return <Fig data={d} width={60} />;
};

export const LA5 = () => {
  const D = tuple(-2, 5);
  const R = tuple(-2, 5);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot("fn f(x) = (5/4) - x", D, R).stroke(cssvar("red")).done(),
    cplot("fn g(x) = (x/2) - (1/4)", D, R).stroke(cssvar("blue")).done(),
  ]);
  return <Fig data={d} width={50} />;
};

export const CoincidentLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({ on: "x", domain: D, range: R, hideTicks: true });
  const yAxis = axis({ on: "y", domain: D, range: R, hideTicks: true });
  const d = svg({
    height: 400,
    width: 400,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", [-9.5, 9.5], R)
      .stroke(cssvar("red"))
      .strokeWidth(3)
      .done(),
    cplot("fn g(x) = (2 - 4x)/6", D, R)
      .stroke(cssvar("blue"))
      .strokeWidth(1)
      .done(),
  ]);
  return <Fig data={d} width={70} />;
};

export const ParallelLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({ on: "x", domain: D, range: R, hideTicks: true });
  const yAxis = axis({ on: "y", domain: D, range: R, hideTicks: true });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", D, R).stroke(cssvar("red")).done(),
    cplot("fn g(x) = (7 - 2x)/3", D, R).stroke(cssvar("blue")).done(),
  ]);
  return <Fig data={d} width={100} />;
};

export const IntersectingLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({ on: "x", domain: D, range: R, hideTicks: true });
  const yAxis = axis({ on: "y", domain: D, range: R, hideTicks: true });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", D, R).stroke(cssvar("red")).done(),
    cplot("fn g(x) = (8 - x)/(-2)", D, R).stroke(cssvar("blue")).done(),
  ]);
  return <Fig data={d} width={100} />;
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

  const Plot3DPath = ({ zfn }: { zfn: Function3D }) => {
    const ref = useRef(null);
    const paramFunction = (x: number, y: number, target: Vector3) => {
      const [X, Y, Z] = zfn.$compiledFunction(x, y);
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
            position: d.$cameraPosition,
            near: d.$near,
            far: d.$far,
          }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <CameraController />
          {/* <pointLight intensity={20} position={[2,30,4]} color={0xffffff} /> */}
          {/* <ambientLight color={0xffffff} intensity={1}/> */}
          <primitive object={new AxesHelper(10)} />
          <primitive
            object={new GridHelper(10, 10, d.$gridColor, d.$gridColor)}
          />
          {d.$compiledFunctions.map((f) => (
            <Plot3DPath key={`${f.$zFn}`} zfn={f} />
          ))}
        </Canvas>
      </div>
    </FIGURE>
  );
}

export function Plot3DTest() {
  const d = plot3D("fn z(x,y) = sin(x) + cos(y)").done();
  return <PLOT3D data={d} />;
}
export function Plot3DDemo() {
  const d = plot3D("fn z(x,y) = 4 * e^(-1/4 * y^2) * sin(2x - 1)").done();
  return <PLOT3D data={d} />;
}

export const MultiPlot3DDemo = () => {
  const d = plot3D([
    "fn z(x,y) = 5 + 2x + 3y",
    "fn h(x,y) = 2 + 2x + 3y",
    "fn h(x,y) = -3 + 2x + 3y",
  ])
    .xDomain([-1, 1])
    .yDomain([-1, 1])
    .scale(0.8)
    .done();
  return <PLOT3D data={d} />;
};

export const ParallelPlanes = () => {
  const d = plot3D([
    "fn z(x,y) = 5 + 2x + 3y",
    "fn h(x,y) = 2 + 2x + 3y",
    "fn h(x,y) = -3 + 2x + 3y",
  ])
    .cameraPosition([-7, 12, 12])
    .xDomain([-1, 1])
    .yDomain([-1, 1])
    .scale(0.8)
    .done();
  return <PLOT3D data={d} />;
};

export const PlanesDemo2 = () => {
  const d = plot3D([
    "fn a(x,y) = 2 - x - 2y",
    "fn b(x,y) = -0.25 - x - 2y",
    "fn c(x,y) = 1 - 2x + y",
  ])
    .xDomain([-1, 1])
    .yDomain([-1, 1])
    .scale(0.8)
    .done();
  return <PLOT3D data={d} />;
};

export const PlanesDemo3 = () => {
  const d = plot3D(["fn a(x,y) = 2 - x - 2y", "fn b(x,y) = 1 - 2x + y"])
    .xDomain([-1, 1])
    .yDomain([-1, 1])
    .scale(0.8)
    .done();
  return <PLOT3D data={d} />;
};

export const PlanesDemo4 = () => {
  const d = plot3D([
    "fn a(x,y) = (3x + y)/(-2)",
    "fn b(x,y) = (1 - (-4x + y))/(-3)",
    "fn c(x,y) = 1 + x - y",
  ])
    .xDomain([-2, 2])
    .yDomain([-2, 2])
    .scale(0.8)
    .done();
  return <PLOT3D data={d} />;
};

export const EchelonPlanes = () => {
  const d = plot3D([
    "fn a(x,y) = (9 - x - y)/2",
    "fn b(x,y) = (1 - 2x - 4y)/(-3)",
    "fn c(x,y) = (3x + 6y)/5",
  ])
    .xDomain([-3, 3])
    .yDomain([-3, 3])
    .scale(1)
    .done();
  return <PLOT3D data={d} />;
};

export const Calc1 = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
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
  const cs = xys.map(([x, y]) => circle(5, [x, y]).fill(cssvar("blue")));
  const ts = xys.map(([x, y]) =>
    text(`(${x},${y})`).fill(cssvar("foreground")).position(x, y).dy(-10)
  );
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    xAxis,
    yAxis,
    text("I").fill(cssvar("foreground")).position(2, 2),
    text("IV").fill(cssvar("foreground")).position(2, -2),
    text("II").fill(cssvar("foreground")).position(-2, 2),
    text("III").fill(cssvar("foreground")).position(-2, -2),
    ...cs,
    ...ts,
  ]);
  return <Fig data={d} width={45} />;
};

export const DistanceBetweenPoints = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    xAxis,
    yAxis,
    line([1, 1], [-3, 4]).stroke(cssvar("red")),
    circle(5, [1, 1]).fill(cssvar("red")),
    circle(5, [-3, 4]).fill(cssvar("red")),
  ]);
  return <Fig data={d} width={45} />;
};

export const MidpointFig = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    xAxis,
    yAxis,
    line([0, 1], [-3, 4]).stroke(cssvar("red")),
    circle(5, [0, 1]).fill(cssvar("blue")),
    circle(5, [-3, 4]).fill(cssvar("blue")),
    circle(5, [-1.5, 2.5]).fill(cssvar("red")),
  ]);
  return <Fig data={d} width={45} />;
};

export const DistanceBetweenPoints2 = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    xAxis,
    yAxis,
    line([1, 1], [-3, 4]).stroke(cssvar("red")),
    line([-3, 1], [-3, 4]).stroke(cssvar("red")),
    line([-3, 1], [1, 1]).stroke(cssvar("red")),
    circle(5, [1, 1]).fill(cssvar("red")),
    circle(5, [-3, 4]).fill(cssvar("red")),
    circle(5, [-3, 1]).fill(cssvar("red")),
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
  ]);
  return <Fig data={d} width={60} />;
};

export const TreeTest = () => {
  const d = svg({
    width: 400,
    height: 300,
    domain: [-5, 5],
    range: [-3, 3],
  }).children([
    tree(
      subtree("a").nodes([
        subtree("b").nodes([leaf("c"), leaf("d")]),
        subtree("e").nodes([
          leaf("j"),
          subtree("f").nodes([subtree("g").nodes([leaf("h"), leaf("i")])]),
        ]),
      ])
    )
      .nodeFn((node) => circle(5, [node.$x, node.$y]).stroke(cssvar("red")))
      .edgeColor(cssvar("red"))
      .labelFn((node) =>
        text(node.$name)
          .fill(cssvar("foreground"))
          .position(node.$x, node.$y)
          .dx(-10)
          .dy(0)
      )
      .layout("reingold-tilford")
      .done(),
  ]);
  return (
    <div>
      <Fig data={d} width={70} paddingBottom={43} />
    </div>
  );
};

export const PlotTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    width: 600,
    height: 600,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot("fn f(x) = sin(x)", D, R).stroke(cssvar("red")).done(),
    cplot("fn g(x) = cos(x)", D, R).stroke(cssvar("blue")).done(),
    cplot("fn h(x) = cos(x) + sin(x)", D, R).stroke(cssvar("green")).done(),
    cplot("fn n(x) = 2cos(x)", D, R).stroke(cssvar("purple")).done(),
  ]);
  return <Fig data={d} width={70} />;
};

export const GraphDemo = () => {
  const N = 90;
  const D = tuple(-N, N);
  const R = tuple(-N, N);
  const d = svg({
    width: 300,
    height: 300,
    domain: D,
    range: R,
  }).children([
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
      .nodeColor(cssvar("blue"))
      .edgeColor(cssvar("blue"))
      .nodeRadius(3)
      .done(),
  ]);
  return <Fig data={d} width={60} paddingBottom={60} />;
};

export const ConvexHullDemo = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const epsilon = 0.1;
  const xs = range(-5, 5, epsilon).map(() => randFloat(-4, 4));
  const ys = range(-5, 5, epsilon).map(() => randFloat(-4, 4));
  const points = zip(xs, ys).map(([x, y]) => vector([x, y]));
  const chull = convexHull(points);
  const p = path();
  chull.hull.forEach((v, i) => {
    if (i === 0) {
      p.moveTo(v.$x, v.$y);
    } else {
      p.lineTo(v.$x, v.$y);
    }
  });
  p.lineTo(chull.leftmost.$x, chull.leftmost.$y);
  p.stroke(cssvar("green"))
    .strokeWidth(1)
    .fill(cssvar("green"))
    .fillOpacity("20%");
  const cs = points.map((v) =>
    circle(5, [v.$x, v.$y])
      .fill(cssvar("green"))
      .stroke(cssvar("green"))
      .fillOpacity(0.7)
  );
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([grid(D, R).stroke(cssvar("dimgrey")).done(), p, cs]);
  return <Fig data={d} width={45} />;
};

export const AffineFunctionLab = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const RI = tuple(0, 100);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const [AValue, setAValue] = useState(2);
  const [BValue, setBValue] = useState(1);
  const [fn, setFn] = useState(`f(x) = ${AValue}x + ${BValue}`);
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
  useEffect(() => {
    setFn(`f(x) = ${AValue} * x + ${BValue}`);
    if (BValue < 0) {
      setLatex(`f(x) = ${AValue}x - ${Math.abs(BValue)}`);
    } else {
      setLatex(`f(x) = ${AValue}x + ${BValue}`);
    }
  }, [AValue, BValue]);

  const AB = () => {
    const value = -BValue / AValue;
    const string = value.toPrecision(3);
    let latex = string;
    if (!Number.isFinite(value)) {
      latex = "\\infty";
    }
    return { value, string, latex };
  };

  const d = svg({
    width: 500,
    height: 500,
    domain: D,
    range: R,
  }).children([
    xAxis,
    yAxis,
    cplot(`fn ${fn}`, D, R).stroke(cssvar("red")).done(),
    circle(5, [AB().value, 0]).fill(cssvar("red")),
    text(`(${AB().string}, 0)`).position(AB().value, 0.8).fill(cssvar("red")),
  ]);

  return (
    <div>
      <div className="flex flex-col">
        <Tex content={`${latex}`} block />
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-5"
            type="range"
            onChange={handleARangeChange}
          />
          <Tex content={`a = ${AValue}`} block />
        </div>
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-5"
            type="range"
            onChange={handleBRangeChange}
          />
          <Tex content={`b = ${BValue}`} block />
        </div>
        <div>
          <Tex content={`\\dfrac{b}{a} = ${AB().latex}`} />
        </div>
      </div>
      <Fig data={d} width={70} />
    </div>
  );
};

export const QuadraticFunctionLab = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const RI = tuple(0, 100);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });

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
    cplot(`fn ${fn}`, D, R).stroke(cssvar("blue")).done(),
    line([vtx.x, R[0]], [vtx.x, R[1]]).stroke(cssvar("red")).strokeDashArray(8),
    circle(5, [vtx.x, vtx.y]).fill(cssvar("blue")),
    text(`(${vtx.x.toPrecision(3)}, ${vtx.y.toPrecision(3)})`)
      .position(vtx.x, vtx.y)
      .dx(50)
      .fill(cssvar("foreground")),
  ]);

  return (
    <div>
      <div className="flex flex-col">
        <Tex content={`${latex}`} block />
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-5"
            type="range"
            onChange={handleARangeChange}
          />
          <Tex content={`a = ${AValue}`} block />
        </div>
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-5"
            type="range"
            onChange={handleBRangeChange}
          />
          <Tex content={`b = ${BValue}`} block />
        </div>
        <div className="flex items-center">
          <input
            step={0.1}
            className="mr-5"
            type="range"
            onChange={handleCRangeChange}
          />
          <Tex content={`c = ${CValue}`} block />
        </div>
      </div>
      <Fig data={d} width={70} />
    </div>
  );
};

export const SplineLab = () => {
  const [linearCurveChecked, setLinearCurveChecked] = useState(true);
  const [bezierCurveChecked, setBezierCurveChecked] = useState(false);
  const [cardinalCurveChecked, setCardinalCurveChecked] = useState(false);
  const [catmullRomCurveChecked, setCatmullRomCurveChecked] = useState(false);
  const [alphaValue, setAlphaValue] = useState(0.5);
  const [tensionValue, setTensionValue] = useState(0.5);
  const alphaInterp = interpolator([0, 10], [0, 1]);
  const handleTensionChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setTensionValue(alphaInterp(value));
  };
  const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setAlphaValue(alphaInterp(value));
  };
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const pts = [
    tuple(-4, -3),
    tuple(-3, 1),
    tuple(-1, 1),
    tuple(1, 2),
    tuple(3, 1),
    tuple(4, 3),
  ];
  const circles = pts.map(([x, y]) =>
    circle(5, [x, y]).fill("white").stroke("black")
  );
  const lc = curveLinear(pts);
  const cbc = curveCubicBezier(pts, 0.4);
  const cc = curveCardinal(pts, tensionValue);
  const ccr = curveCatmullRom(pts, alphaValue);
  const d = svg({
    width: 400,
    height: 400,
    domain: D,
    range: R,
  }).children([
    linearCurveChecked && lc.stroke(cssvar("red")),
    bezierCurveChecked && cbc.stroke(cssvar("green")),
    cardinalCurveChecked && cc.stroke(cssvar("purple")),
    catmullRomCurveChecked && ccr.stroke(cssvar("blue")),
    circles,
  ]);
  return (
    <div>
      <div className="m-2 font-mono text-sm p-4 py-2 w-6/12 rounded">
        <span>Curve:</span>
        <div className="flex">
          <input
            type="checkbox"
            checked={linearCurveChecked}
            onChange={() => setLinearCurveChecked(!linearCurveChecked)}
          />
          <label className="ml-2">Linear</label>
        </div>
        <div className="flex">
          <input
            type="checkbox"
            checked={bezierCurveChecked}
            onChange={() => setBezierCurveChecked(!bezierCurveChecked)}
          />
          <label className="ml-2">Cubic Bezier</label>
        </div>
        <div className="flex">
          <input
            type="checkbox"
            checked={cardinalCurveChecked}
            onChange={() => setCardinalCurveChecked(!cardinalCurveChecked)}
          />
          <label className="ml-2">Cardinal</label>
        </div>
        <div>
          {cardinalCurveChecked && (
            <div className="ml-5 flex items-center">
              <Tex content="\tau" />
              <input
                min={0}
                max={10}
                step={0.1}
                className="ml-2"
                type="range"
                onChange={handleTensionChange}
              />
              <div>{tensionValue.toPrecision(2)}</div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={catmullRomCurveChecked}
              onChange={() =>
                setCatmullRomCurveChecked(!catmullRomCurveChecked)
              }
            />
            <label className="ml-2">Catmull-Rom</label>
          </div>
          {catmullRomCurveChecked && (
            <div className="ml-5 flex items-center">
              <Tex content="\alpha" />
              <input
                min={0}
                max={10}
                step={0.1}
                className="ml-2"
                type="range"
                onChange={handleAlphaChange}
              />
              <div>{alphaValue.toPrecision(2)}</div>
            </div>
          )}
        </div>
      </div>
      <Fig data={d} width={60} />
    </div>
  );
};

export const Pow2FuncLab = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const ctx: SVGContext = {
    width: 500,
    height: 500,
    domain: D,
    range: R,
  };

  const d1 = svg(ctx).children([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^2`, D, R).stroke(cssvar("red")).strokeWidth(2).done(),
  ]);

  const d2 = svg(ctx).children([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^4`, D, R).stroke(cssvar("blue")).strokeWidth(2).done(),
  ]);

  const d3 = svg(ctx).children([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^16`, D, R)
      .stroke(cssvar("purple"))
      .strokeWidth(2)
      .done(),
  ]);

  return (
    <div className="grid grid-cols-3">
      <Fig data={d1} width={100} title={<Tex content="y = x^2" />} />
      <Fig data={d2} width={100} title={<Tex content="y = x^4" />} />
      <Fig data={d3} width={100} title={<Tex content="y = x^{16}" />} />
    </div>
  );
};

export const Rat1 = () => {
  const domain = tuple(-10, 10);
  const range = tuple(-10, 10);
  const c = cplot("fn f(x) = 1/x", domain, range)
    .stroke(cssvar("green"))
    .strokeWidth(1)
    .done();
  const xInterp = interpolator([0, 100], domain);
  const [xValue, setXValue] = useState(-10);
  const [yValue, setYValue] = useState(0);
  const handleXValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(event.target.value);
    setXValue(xInterp(value));
  };
  useEffect(() => {
    if (c.$compiledFunction) {
      const y = c.$compiledFunction.call(c.$engine.compiler, [xValue]);
      if (isSafeNumber(y)) {
        setYValue(y);
      }
    }
  }, [xValue, c.$compiledFunction, c.$engine]);
  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
  }).children([
    axis({ on: "x", domain, range }).done(),
    axis({ on: "y", domain, range }).done(),
    cplot("fn f(x) = 1/x", domain, range)
      .stroke(cssvar("green"))
      .strokeWidth(1)
      .done(),
    circle(3, [xValue, yValue]).fill(cssvar("green")),
    text(`(${xValue.toPrecision(2)}, ${yValue.toPrecision(2)})`)
      .position(xValue, yValue)
      .dy(-10)
      .fill(cssvar("foreground")),
  ]);

  return (
    <div>
      <Fig data={d} width={70} />
      <div className="flex items-center">
        <input
          step={0.1}
          className="mr-5"
          type="range"
          onChange={handleXValueChange}
        />
        <Tex content={`x = ${xValue.toPrecision(2)}`} block />
      </div>
    </div>
  );
};

export const Rat2 = () => {
  const domain = tuple(-10, 10);
  const range = tuple(-3, 10);
  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
  }).children([
    axis({ on: "x", domain, range }),
    axis({ on: "y", domain, range }),
    cplot("fn f(x) = 1/x^2", domain, range)
      .samples(600)
      .stroke(cssvar("purple"))
      .strokeWidth(1.5)
      .done(),
  ]);
  return <Fig data={d} width={60} />;
};

export const Exp1 = () => {
  const domain = tuple(-3, 4);
  const range = tuple(-2, 9);
  const d = svg({
    domain,
    range,
    width: 500,
    height: 500,
  }).children([
    cplot("fn f(x) = 2^x", domain, range)
      .stroke(cssvar("red"))
      .strokeWidth(2)
      .done(),
    axis({ on: "x", domain, range }),
    axis({ on: "y", domain, range }),
  ]);

  return <Fig data={d} width={60} />;
};

export const Exp2 = () => {
  const domain = tuple(-3, 4);
  const range = tuple(-2, 9);
  const d = svg({
    domain,
    range,
    width: 500,
    height: 500,
  }).children([
    cplot("fn f(x) = e^x", domain, range)
      .stroke(cssvar("blue"))
      .strokeWidth(2)
      .done(),
    axis({ on: "x", domain, range }),
    axis({ on: "y", domain, range }),
  ]);

  return <Fig data={d} width={60} />;
};

export const LogFig1 = () => {
  const domain = tuple(-1, 15);
  const range = tuple(-2, 8);
  const d = svg({
    domain,
    range,
    width: 500,
    height: 500,
  }).children([
    axis({ on: "x", domain, range }),
    axis({ on: "y", domain, range }),
    cplot("fn f(x) = log(x)", domain, range)
      .samples(900)
      .stroke(cssvar("green"))
      .strokeWidth(2)
      .done(),
    cplot("fn f(x) = lg(x)", domain, range)
      .samples(900)
      .stroke(cssvar("red"))
      .strokeWidth(2)
      .done(),
    cplot("fn f(x) = ln(x)", domain, range)
      .samples(900)
      .stroke(cssvar("blue"))
      .strokeWidth(2)
      .done(),
    text("\\ln x")
      .latex("block")
      .fontSize(20)
      .position(7, 3)
      .fill(cssvar("blue")),
    text("\\lg x")
      .latex("block")
      .fontSize(20)
      .position(5, 3.5)
      .fill(cssvar("red")),
    text("\\log x")
      .latex("block")
      .fontSize(20)
      .position(5, 1.7)
      .fill(cssvar("green")),
  ]);

  return <Fig data={d} width={60} />;
};

export const SubsetFig = () => {
  const D = tuple(-7, 7);
  const R = tuple(-7, 7);
  const d = svg({
    width: 500,
    height: 200,
    domain: D,
    range: R,
  }).children([
    // quad(8, 14).at(-4, 7).fill("silver").end(),
    text("A").latex("block").width(20).fontSize(18).position(-3.4, 6.5),
    text("B").latex("block").width(20).fontSize(18).position(3, 2.2),
    circle(70, [0, 0]).fill("none").fill("gainsboro"),
    circle(40, [-0.75, 0]).fill("none").fill("darkgray"),
    line([-2.8, 4], [-1.7, 2]).arrowEnd(),
    line([3, 0], [2.1, 0]).arrowEnd(),
  ]);
  return (
    <Fig
      data={d}
      width={60}
      paddingBottom={25}
      title={<Tex content="A \subset B" />}
    />
  );
};

export const IntersectionFig = () => {
  const D = tuple(-7, 7);
  const R = tuple(-7, 7);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 200,
  }).children([
    // quad(8, 14).at(-4, 7).fill("lightgrey").end(),
    text("A").latex("block").width(20).fontSize(18).position(-3.4, 6.2),
    text("B").latex("block").width(20).fontSize(18).position(2.8, 5.6),
    circle(70, [1, 0]).fillOpacity(0.5).fill("none").fill("#FF748B"),
    circle(70, [-1, 0]).fillOpacity(0.5).fill("none").fill("#81BFDA"),
  ]);

  return (
    <Fig
      data={d}
      width={60}
      paddingBottom={25}
      title={<Tex content="A \cap B" />}
    />
  );
};

export const FnDefFig = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);

  const pts1: [number, number][] = [
    [-1, 1],
    [-3, 2],
    [-5, 3],
    [-6, 0],
    [-4, -2],
  ];
  const pts2: [number, number][] = [
    [2, 1],
    [3, 3],
    [5, 4],
    [7, 3],
    [6, 2],
    [7, 0],
    [6, -2],
    [4, -3],
    [3, -1],
  ];
  const pts3: [number, number][] = [
    [4, 3],
    [3, 2],
    [2.4, 1],
    [3, 0],
    [4, -1],
    [5, -2],
    [6, 0],
  ];
  const d = svg({
    width: 500,
    height: 500,
    domain: D,
    range: R,
  }).children([
    curveBlob(pts1).fill("lightblue").stroke("teal").fillOpacity(0.5),
    curveBlob(pts2).fill("tomato").stroke("tomato").fillOpacity(0.5),
    curveBlob(pts3).fill("firebrick").stroke("firebrick").fillOpacity(0.4),
    circle(2, [-4, 2]),
    circle(2, [-4, 1]),
    circle(2, [-4, 0]),
    circle(2, [-4, -1]),
    line([-4, 2], [4, 2]).arrowEnd(),
    line([-4, 1], [3, 1]).arrowEnd(),
    line([-4, 0], [4, 0]).arrowEnd(),
    line([-4, -1], [5, -1]).arrowEnd(),
    text("\\text{Im}(f)").latex("block").position(3.5, 1.5),
    text("\\text{ran}(f)").latex("block").position(7, 4),
    text("\\text{dom}(f)").latex("block").position(-4.8, -2),
    text("f").latex("block").fontSize(16).position(-1, 3.6),
  ]);

  return <Fig data={d} width={80} paddingBottom={70} />;
};

export const LinearAxesTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({ on: "x", domain: D, range: R });
  const yAxis = axis({ on: "y", domain: D, range: R });
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([xAxis, yAxis]);
  return <Fig data={d} width={70} />;
};

export const Figy = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const d = svg({
    width: 500,
    height: 500,
    domain: D,
    range: R,
  }).children([
    grid(D, R).done(),
    axis({ on: "x", domain: D, range: R }),
    axis({ on: "y", domain: D, range: R }),
    circle(50, [0, 0]).stroke("olivedrab").fill("yellowgreen").fillOpacity(0.4),
  ]);
  return <Fig data={d} width={70} />;
};

export const Line1 = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    axis({ on: "x", domain: D, range: R }),
    axis({ on: "y", domain: D, range: R }),
    line([7, 7], [-7, -7]).stroke(cssvar("red")).arrowEnd().arrowStart(),
    circle(4, [0, 0]).fill(cssvar("red")),
    circle(4, [2, 2]).fill(cssvar("red")),
    circle(4, [-4, -4]).fill(cssvar("red")),
    circle(4, [6, 6]).fill(cssvar("red")),
    text("A").latex("block").position(6, 6).fill(cssvar("foreground")),
    text("B").latex("block").position(2, 2).fill(cssvar("foreground")),
    text("C").latex("block").position(0, 0).fill(cssvar("foreground")),
    text("D").latex("block").position(-4, -4).fill(cssvar("foreground")),
  ]);

  return (
    <div>
      <Fig data={d} width={70} />
    </div>
  );
};

export const LineSegment1 = () => {
  const D = tuple(-10, 10);
  const R = tuple(-5, 5);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 200,
  }).children([
    // grid(D, R).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain: D, range: R }),
    // axis({ on: "y", domain: D, range: R }),
    line([8, 0], [-8, 0])
      .strokeOpacity(0.3)
      .stroke(cssvar("blue"))
      .arrowEnd()
      .arrowStart(),
    line([4, 0], [-4, 0]).stroke(cssvar("blue")),
    circle(4, [0, 0]).fill(cssvar("blue")),
    circle(4, [-4, 0]).fill(cssvar("blue")),
    circle(4, [4, 0]).fill(cssvar("blue")),
    circle(4, [6, 6]).fill(cssvar("blue")),
    text("A").latex("block").position(-5, 0).fill(cssvar("foreground")),
    text("B").latex("block").position(-1, 0).fill(cssvar("foreground")),
    text("C").latex("block").position(3, 0).fill(cssvar("foreground")),
  ]);

  return (
    <div>
      <Fig data={d} width={70} paddingBottom={20} />
    </div>
  );
};

export const AngleLab = () => {
  const D = tuple(-2, 6);
  const R = tuple(-5, 5);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([
    // grid(D, R).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain: D, range: R }),
    // axis({ on: "y", domain: D, range: R }),
    angleMarker([5, 0], [0, 0], [2.5, 4], 30)
      .stroke(cssvar("red"))
      .fill(cssvar("red"))
      .fillOpacity(0.3),
    line([0, 0], [5, 0]).stroke(cssvar("red")).arrowEnd(),
    line([0, 0], [2, 4]).stroke(cssvar("red")).arrowEnd(),
    circle(4, [0, 0]).fill(cssvar("red")),
    circle(4, [1, 2]).fill(cssvar("red")),
    circle(4, [3, 0]).fill(cssvar("red")),
    text("A").fontStyle("italic").position(1.3, 2).fill(cssvar("foreground")),
    text("B").fontStyle("italic").position(-0.3, 0).fill(cssvar("foreground")),
    text("C").fontStyle("italic").position(3, -0.5).fill(cssvar("foreground")),
  ]);

  return (
    <div>
      <Fig data={d} width={60} paddingBottom={40} />
    </div>
  );
};

export const TriangleLab = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([
    // grid(D, R).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain: D, range: R }),
    // axis({ on: "y", domain: D, range: R }),
    [
      angleMarker([1, 0], [0, 0], [0, 1], 20),
      angleMarker([0, 0], [0, 4], [3, 0], 20),
      angleMarker([0, 4], [3, 0], [0, 0], 20),
    ].map((a) => a.stroke(cssvar("red")).fill(cssvar("red")).fillOpacity(0.3)),

    triangle([0, 0], [3, 0], [0, 4]).stroke(cssvar("foreground")).fill("none"),
    [
      text("A").position(-0.3, 1.5),
      text("B").position(1.5, -0.3),
      text("C").position(1.7, 2),
      text("α").position(0.2, 3.3),
      text("β").position(0.4, 0.4),
      text("θ").position(2.4, 0.3),
    ].map((t) => t.fontStyle("italic").fill(cssvar("foreground"))),
  ]);

  return (
    <div>
      <Fig data={d} width={75} paddingBottom={50} translate={[-40, 0]} />
    </div>
  );
};

export const CongruentTriangles = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([
    grid(D, R).stroke(cssvar("dimgrey")).done(),
    axis({ on: "x", domain: D, range: R }),
    axis({ on: "y", domain: D, range: R }),
    [
      angleMarker([1, 0], [0, 0], [0, 1], 20),
      angleMarker([0, 0], [0, 4], [3, 0], 20),
      angleMarker([0, 4], [3, 0], [0, 0], 20),
      angleMarker([2, -4], [-1, -4], [-1, 0], 20),
      angleMarker([-1, -4], [-1, 0], [2, -4], 20),
      angleMarker([-1, 0], [2, -4], [-1, -4], 20),
    ].map((a) => a.stroke(cssvar("red")).fill(cssvar("red")).fillOpacity(0.3)),
    triangle([0, 0], [3, 0], [0, 4]).stroke(cssvar("foreground")).fill("none"),
    triangle([-1, 0], [-1, -4], [2, -4])
      .stroke(cssvar("foreground"))
      .fill("none"),
    [
      [0, 4],
      [3, 0],
      [0, 0],
      [-1, 0],
      [-1, -4],
      [2, -4],
    ].map((c) => circle(5, c as [number, number]).fill(cssvar("red"))),
    [
      text("A").position(0, 4.3),
      text("B").position(-0.3, 0),
      text("C").position(3, -0.5),
      text("D").position(-1, 0.25),
      text("E").position(-1.3, -4),
      text("F").position(2.3, -4),
    ].map((t) => t.fontStyle("italic").fill(cssvar("foreground"))),
  ]);

  return (
    <div>
      <Fig data={d} width={75} paddingBottom={80} translate={[0, 0]} />
    </div>
  );
};

export const PolarPlotTest = () => {
  const f = "fn f(x) = e^(sin(x)) - 2cos(4x) + (sin((2x - pi)/24))^5";
  const d = svg({
    domain: [-5, 5],
    range: [-5, 5],
    width: 500,
    height: 500,
  }).children([
    polarAxes([-1, 1]).axisColor(cssvar("dimgrey")).done(),
    plotPolar(f)
      .strokeWidth(1.5)
      .stroke(cssvar("purple"))
      .cycles(24 * Math.PI)
      .done(),
  ]);
  return <Fig data={d} width={70} />;
};

export const TrigFnAngles = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const l1 = polarToCartesian(0, 0, 2, 120);
  const d = svg({
    domain: D,
    range: R,
    width: 500,
    height: 500,
  }).children([
    // grid(D, R).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain: D, range: R }),
    // axis({ on: "y", domain: D, range: R }),
    circle(100, [0, 0]).fill("none").stroke(cssvar("dimgrey")),
    path()
      .arc(0, 0, 50, 0, -toRadians(120), true)
      .stroke(cssvar("foreground"))
      .strokeDashArray(3)
      .arrowEnd(),

    [line([4, 0], [-4, 0]), line([0, 4], [0, -4])].map((l) =>
      l.stroke(cssvar("dimgrey"))
    ),

    line([0, 0], [2, 0]).stroke(cssvar("foreground")),
    line([0, 0], [l1.$x, l1.$y]).stroke(cssvar("foreground")),
    [
      text("θ").position(0.2, 0.2).fontSize("18px"),
      text("𝑃(𝑥, 𝑦)").position(l1.$x, l1.$y).fontSize("18px").dy(-15).dx(-20),
      text("𝑥").position(4.2, 0).dy(5),
      text("𝑦").position(0, 4.2).dy(-1),
    ].map((t) => t.fill(cssvar("foreground"))),
    circle(3, [l1.$x, l1.$y]).fill(cssvar("foreground")),
    circle(3, [2, 0]).fill(cssvar("foreground")),
    circle(3, [0, 0]).fill(cssvar("foreground")),
  ]);
  return <Fig data={d} width={100} />;
};

export const UnitCircleTrig = () => {
  const domain = tuple(-5, 5);
  const range = tuple(-5, 5);
  const a1 = polarToCartesian(0, 0, 2, 45);
  const d = svg({
    domain,
    range,
    width: 500,
    height: 500,
  }).children([
    // grid(domain, range).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain, range }),
    // axis({ on: "y", domain, range }),
    triangle([0, 0], [a1.$x, a1.$y], [a1.$x, 0])
      .fill(cssvar("dimgrey"))
      .fillOpacity(0.5)
      .stroke("none"),
    line([-3, 0], [3, 0]).stroke(cssvar("dimgrey")).arrowed(),
    line([0, -3], [0, 3]).stroke(cssvar("dimgrey")).arrowed(),
    line([0, 0], [2, 0]).stroke(cssvar("pencil")),
    line([0, 0], [a1.$x, a1.$y]).strokeDashArray(2).stroke(cssvar("pencil")),
    line([a1.$x, a1.$y], [a1.$x, 0])
      .stroke(cssvar("pencil"))
      .strokeDashArray(2),
    line([a1.$x + 0.8, a1.$y], [a1.$x + 0.8, 0]).stroke(cssvar("pencil")),
    line([0, -0.3], [a1.$x, -0.3]).stroke(cssvar("pencil")),
    [
      text("𝑎").position(0.5, 0.8),
      text("𝑏").position(1.6, 0.6),
      text("𝑐").position(0.8, -0.2),
      text("𝑦").position(a1.$x + 1.2, a1.$y / 2),
      text("𝑥").position(a1.$x / 2, -0.5),
      text("θ").position(0.35, 0.05),
      text("𝑃(𝑥, 𝑦)").position(a1.$x, a1.$y).dy(-10).dx(15),
      text("𝑥² + 𝑦² = 1").position(-2, 2),
    ].map((t) => t.fill(cssvar("foreground"))),
    path()
      .arc(0, 0, 40, 0, -Math.PI / 4, true)
      .stroke(cssvar("pencil"))
      .arrowEnd(),
    circle(100, [0, 0])
      .fill("none")
      .stroke(cssvar("dimgrey"))
      .strokeDashArray(5),
    circle(3, [0, 0]).fill(cssvar("foreground")),
    circle(3, [2, 0]).fill(cssvar("foreground")),
    circle(3, [a1.$x, a1.$y]).fill(cssvar("foreground")),
  ]);
  return <Fig data={d} width={80} paddingBottom={50} translate={[0, -100]} />;
};

function lineFromAngle(
  origin: [number, number],
  radius: number,
  angle: number
) {
  const [x, y] = origin;
  const p = path();
  p.moveTo(x, y);
  p.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  return p;
}

export const RadianFig = () => {
  const domain = tuple(-5, 5);
  const range = tuple(-5, 5);
  const a = lineFromAngle([0, 0], 2, Math.PI / 4);
  const b = lineFromAngle([0, 0], 2, -Math.PI / 4);
  const aEnd = a._endpoint;
  const bEnd = b._endpoint;
  const d = svg({
    domain,
    range,
    width: 500,
    height: 500,
  }).children([
    // grid(domain, range).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain, range }),
    // axis({ on: "y", domain, range }),
    line([0, -3], [0, 3]).stroke(cssvar("dimgrey")),
    line([-3, 0], [3, 0]).stroke(cssvar("dimgrey")),
    circle(100, [0, 0]).fill("none").stroke(cssvar("pencil")),
    text("𝑠").position(2, 0).dx(20).dy(2.5),
    text("θ").position(0.5, 0).dx(15).dy(5),
    text("𝑟").position(1, 1).dx(-20).dy(10),
    text("𝑦").position(0, 3).dy(-10),
    text("𝑥").position(3, 0).dx(10).dy(4),
    angleMarker([aEnd.$x, aEnd.$y], [0, 0], [bEnd.$x, bEnd.$y], 30, false)
      .fill(cssvar("dimgrey"))
      .strokeDashArray(3),
    arcFromPoints([aEnd.$x, aEnd.$y], [0, 0], [bEnd.$x, bEnd.$y], 110, false)
      .id("am")
      .stroke(cssvar("pencil"))
      .strokeDashArray(2)
      .arrowed(arrowhead("am").refX(0), arrowhead("am").refX(11)),
    a.stroke(cssvar("foreground")).arrowEnd(),
    b.stroke(cssvar("foreground")).arrowEnd(),
  ]);
  return <Fig data={d} width={80} translate={[0, -70]} paddingBottom={55} />;
};

export const Path3DTest = () => {
  const domain = tuple(-10, 10);
  const range = tuple(-10, 10);
  const [a_value, set_a_value] = useState(-2.4);
  const [b_value, set_b_value] = useState(0.6);
  const [c_value, set_c_value] = useState(0);
  const [n_value, set_n_value] = useState(20);
  const [s_value, set_s_value] = useState(2);

  const scale = interpolator([0, 10], [-10, 10]);
  const nscale = interpolator([0, 10], [-10, 40]);

  const handle_a_value_change = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = scale(Number.parseFloat(event.target.value));
    set_a_value(value);
  };

  const handle_b_value_change = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = scale(Number.parseFloat(event.target.value));
    set_b_value(value);
  };

  const handle_c_value_change = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = scale(Number.parseFloat(event.target.value));
    set_c_value(value);
  };

  const handle_n_value_change = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = nscale(Number.parseFloat(event.target.value));
    set_n_value(Math.floor(value));
  };

  const handle_s_value_change = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = scale(Number.parseFloat(event.target.value));
    set_s_value(value);
  };

  const d = svg({
    width: 600,
    height: 600,
    domain,
    range,
  }).children([
    fplot3D({
      fn: "fn z(x,y) = x^2 + y^2",
      a: a_value,
      b: b_value,
      c: c_value,
      n: n_value,
      s: s_value,
    }),
  ]);
  return (
    <div>
      <div className="flex items-center">
        <input
          step={0.1}
          min={0}
          max={10}
          className="mr-5"
          type="range"
          onChange={handle_a_value_change}
        />
        <Tex content={`a = ${a_value}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          min={0}
          max={10}
          className="mr-5"
          type="range"
          onChange={handle_b_value_change}
        />
        <Tex content={`b = ${b_value}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          min={0}
          max={10}
          className="mr-5"
          type="range"
          onChange={handle_c_value_change}
        />
        <Tex content={`c = ${c_value}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          min={0}
          max={10}
          className="mr-5"
          type="range"
          onChange={handle_n_value_change}
        />
        <Tex content={`n = ${n_value}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          min={0}
          max={10}
          className="mr-5"
          type="range"
          onChange={handle_s_value_change}
        />
        <Tex content={`s = ${s_value}`} block />
      </div>
      <Fig data={d} />
    </div>
  );
};

export const CubeTest = () => {
  const domain = tuple(-10, 10);
  const range = tuple(-10, 10);
  const camera = vector([1.5, 0, 4]);
  const [zRotation, setZRotation] = useState(0);
  const [yRotation, setYRotation] = useState(0);
  const [xRotation, setXRotation] = useState(0);
  const degify = interpolator([0, 100], [0, 360]);
  const handleZRotationChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = +Number.parseFloat(event.target.value).toPrecision(3);
    const deg = toRadians(degify(value));
    setZRotation(deg);
  };
  const handleXRotationChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = +Number.parseFloat(event.target.value).toPrecision(3);
    const deg = toRadians(degify(value));
    setXRotation(deg);
  };
  const handleYRotationChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = +Number.parseFloat(event.target.value).toPrecision(3);
    const deg = toRadians(degify(value));
    setYRotation(deg);
  };
  const vertices = {
    A: vector([1, 1, 1]),
    B: vector([-1, 1, 1]),
    C: vector([1, -1, 1]),
    D: vector([-1, -1, 1]),
    E: vector([1, 1, -1]),
    F: vector([-1, 1, -1]),
    G: vector([1, -1, -1]),
    H: vector([-1, -1, -1]),
  };
  const edges: [keyof typeof vertices, keyof typeof vertices][] = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["A", "C"],
    ["B", "D"],
    ["E", "G"],
    ["F", "H"],
    ["A", "E"],
    ["C", "G"],
    ["B", "F"],
    ["D", "H"],
  ];
  const p = path3D(0, 0, 1);
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const e1 = vertices[edge[0]];
    const e2 = vertices[edge[1]];
    const e1uv = e1.sub(camera);
    const e1uv2 = e1uv.map((n, i) => (i === 2 ? n : n / e1uv.$z));
    const e2uv = e2.sub(camera);
    const e2uv2 = e2uv.map((n, i) => (i === 2 ? n : n / e2uv.$z));
    p.moveTo(e1uv2.$x, e1uv2.$y, e1uv2.$z).lineTo(e2uv2.$x, e2uv2.$y, e2uv2.$z);
  }

  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
    zDomain: domain,
  }).children([
    grid(domain, range).stroke(cssvar("dimgrey")).done(),
    axis({ on: "x", domain, range }),
    axis({ on: "y", domain, range }),
    p.rotateZ(zRotation).rotateY(yRotation).rotateX(xRotation).scale(6, 6),
  ]);
  return (
    <div>
      <div className="flex items-center">
        <input
          step={0.1}
          className="mr-5"
          type="range"
          onChange={handleXRotationChange}
        />
        <Tex content={`x\\text{-rotation} = ${xRotation}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          className="mr-5"
          type="range"
          onChange={handleYRotationChange}
        />
        <Tex content={`y\\text{-rotation} = ${yRotation}`} block />
      </div>
      <div className="flex items-center">
        <input
          step={0.1}
          className="mr-5"
          type="range"
          onChange={handleZRotationChange}
        />
        <Tex content={`z\\text{-rotation} = ${zRotation}`} block />
      </div>
      <Fig data={d} />
    </div>
  );
};

export const BasicSineWave = () => {
  const domain = tuple(-1.5, 7.5);
  const range = tuple(-2.5, 2.5);
  const ytick = (y: number, length: number = 0.05) =>
    line([-length, y], [length, y]);
  const xtick = (x: number, length: number = 0.05) =>
    line([x, -length], [x, length]);
  const d = svg({
    width: 500,
    height: 300,
    domain,
    range,
  }).children([
    // grid(domain, range).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain, range }),
    // axis({ on: "y", domain, range }),
    text("𝑥").fill(cssvar("dimgrey")).position(7, 0).dy(5).dx(10),
    text("𝑦").fill(cssvar("dimgrey")).position(0, 2).dy(-15),
    [
      ytick(1),
      ytick(-1),
      xtick(Math.PI / 2),
      xtick(Math.PI),
      xtick((3 * Math.PI) / 2),
      xtick(2 * Math.PI),
    ].map((l) => l.stroke(cssvar("dimgrey"))),
    [
      text("1").position(0, 1).dy(5).dx(-10),
      text("-1").position(0, -1).dy(5).dx(-10),
      text("π/2")
        .position(Math.PI / 2, 0)
        .dy(20),
      text("π").position(Math.PI, 0).dy(20),
      text("3π/2")
        .position((3 * Math.PI) / 2, 0)
        .dy(20),
      text("2π")
        .position(2 * Math.PI, 0)
        .dy(20),
    ].map((t) => t.fill(cssvar("pencil"))),
    line([0, 2], [0, -2]).stroke(cssvar("dimgrey")).arrowed(),
    line([-1, 0], [7, 0]).stroke(cssvar("dimgrey")).arrowed(),
    cplot("fn f(x) = sin(x)", [0, 2 * Math.PI], [-2, 2])
      .stroke(cssvar("green"))
      .samples(600)
      .done(),
  ]);
  return <Fig data={d} width={70} paddingBottom={40} />;
};

export const BasicCosineWave = () => {
  const domain = tuple(-1.5, 7.5);
  const range = tuple(-2.5, 2.5);

  const d = svg({
    width: 500,
    height: 300,
    domain,
    range,
  }).children([
    // grid(domain, range).stroke(cssvar("dimgrey")).done(),
    // axis({ on: "x", domain, range }),
    // axis({ on: "y", domain, range }),
    text("𝑥").fill(cssvar("dimgrey")).position(7, 0).dy(5).dx(10),
    text("𝑦").fill(cssvar("dimgrey")).position(0, 2).dy(-15),
    [
      ytick(1),
      ytick(-1),
      xtick(Math.PI / 2),
      xtick(Math.PI),
      xtick((3 * Math.PI) / 2),
      xtick(2 * Math.PI),
    ].map((l) => l.stroke(cssvar("dimgrey"))),
    [
      text("1").position(0, 1).dy(5).dx(-10),
      text("-1").position(0, -1).dy(5).dx(-10),
      text("π/2")
        .position(Math.PI / 2, 0)
        .dy(20),
      text("π").position(Math.PI, 0).dy(20),
      text("3π/2")
        .position((3 * Math.PI) / 2, 0)
        .dy(20),
      text("2π")
        .position(2 * Math.PI, 0)
        .dy(20),
    ].map((t) => t.fill(cssvar("pencil"))),
    line([0, 2], [0, -2]).stroke(cssvar("dimgrey")).arrowed(),
    line([-1, 0], [7, 0]).stroke(cssvar("dimgrey")).arrowed(),
    cplot("fn f(x) = cos(x)", [0, 2 * Math.PI], [-2, 2])
      .stroke(cssvar("blue"))
      .samples(600)
      .done(),
  ]);
  return <Fig data={d} width={70} paddingBottom={40} />;
};

export const ArcsinePlot = () => {
  const domain = tuple(-2, 2);
  const range = tuple(-2, 2);
  const d = svg({
    width: 500,
    height: 500,
    domain,
    range,
  }).children([
    [line([-2, 0], [2, 0]), line([0, -2], [0, 2])].map((l) =>
      l.stroke(cssvar("grey"))
    ),
    [
      line([-2, Math.PI / 2], [2, Math.PI / 2]),
      line([-2, -Math.PI / 2], [2, -Math.PI / 2]),
      line([1, -2], [1, 2]),
      line([-1, -2], [-1, 2]),
    ].map((l) => l.strokeDashArray(6).stroke(cssvar("dimgrey"))),
    [xtick(1), xtick(-1), ytick(Math.PI / 2), ytick(-Math.PI / 2)].map((t) =>
      t.stroke(cssvar("grey"))
    ),
    [
      text("π/2")
        .position(0, Math.PI / 2)
        .dx(-25)
        .dy(5),
      text("-π/2")
        .position(0, -Math.PI / 2)
        .dx(-25)
        .dy(5),
      text("1").position(1, 0).dy(20),
      text("-1").position(-1, 0).dy(20),
    ].map((t) => t.fill(cssvar("pencil"))),
    [circle(4, [1, Math.PI / 2]), circle(4, [-1, -Math.PI / 2])].map((c) =>
      c.fill(cssvar("red"))
    ),
    cplot("fn f(x) = arcsin(x)", [-1, 1], range)
      .stroke(cssvar("red"))
      .samples(1200)
      .strokeWidth(1.5)
      .done(),
  ]);
  return <Fig data={d} width={70} />;
};

export const SeqPlot1 = () => {
  const domain = tuple(-10, 85);
  const range = tuple(-1, 1.05);
  const d = svg({
    width: 600,
    height: 500,
    domain,
    range,
  }).children([
    plotSeq("fn f(x) = 1/x", 80, [0, 1])
      .axisColor(cssvar('pencil'))
      .pointMarker((p) => circle(1, p).fill(cssvar("red")))
      .done(),
  ]);
  return <Fig data={d} paddingBottom={50}/>;
};

export default Fig;
