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
  quad,
  curveBlob,
  Function3D,
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

type AxisSpec = {
  on: 'x' | 'y',
  domain: [number, number],
  range: [number, number],
  hideTicks?: boolean,
}

const axis = (spec: AxisSpec) => {
  const out = spec.on === 'x'
    ? haxis(spec.domain, 1)
    : vaxis(spec.range, 1);
  out.stroke('#B2BEB5');
  if (!spec.hideTicks) {
    if (spec.on === 'x') {
      out.ticks(t => {
        t.label.dy(15);
        return t;
      })
    } else {
      out.ticks(t => {
        t.label.dy(5).dx(15);
        return t;
      })
    }
  }
  out.done();
  return out;
};

const FIGURE = ({ children }: { children: ReactNode }) => {
  return <figure className="algebron-fig">{children}</figure>;
};

type FigProps = {
  data: SVGObj;
  width?: number;
  paddingBottom?: number;
  title?: ReactNode;
};

const Fig = ({ data, width = 100, paddingBottom = width, title }: FigProps) => {
  const par = "xMidYMid meet";
  const viewbox = `0 0 ${data.$width} ${data.$height}`;
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
          <g transform={`translate(10,10)`}>
            <Fig2D elements={data.$children} />
          </g>
        </svg>
      </div>
      {title && <figcaption>{title}</figcaption>}
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
      strokeDasharray={data.$strokeDashArray}
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
  const d = svg([
    xAxis,
    yAxis,
    cplot("fn f(x) = (5/4) - x", D, R).stroke("red").done(),
    cplot("fn g(x) = (x/2) - (1/4)", D, R).stroke("blue").done(),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={50} />;
};


export const CoincidentLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({on: 'x', domain: D, range: R, hideTicks: true});
  const yAxis = axis({on: 'y', domain: D, range: R, hideTicks: true});
  const d = svg([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", [-9.5,9.5], R).stroke("red").strokeWidth(3).done(),
    cplot("fn g(x) = (2 - 4x)/6", D, R).stroke("blue").strokeWidth(1).done(),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={70} />;
};

export const ParallelLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({on: 'x', domain: D, range: R, hideTicks: true});
  const yAxis = axis({on: 'y', domain: D, range: R, hideTicks: true});
  const d = svg([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", D, R).stroke("red").done(),
    cplot("fn g(x) = (7 - 2x)/3", D, R).stroke("blue").done(),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={100} />;
};

export const IntersectingLines = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({on: 'x', domain: D, range: R, hideTicks: true});
  const yAxis = axis({on: 'y', domain: D, range: R, hideTicks: true});
  const d = svg([
    xAxis,
    yAxis,
    cplot("fn f(x) = (1 - 2x)/3", D, R).stroke("red").done(),
    cplot("fn g(x) = (8 - x)/(-2)", D, R).stroke("blue").done(),
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
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
          <pointLight position={[0, 250, 0]} color={0xffffff} />
          <primitive object={new AxesHelper(10)} />
          <primitive
            object={new GridHelper(10, 10, d.$gridColor, d.$gridColor)}
          />
          {d.$compiledFunctions.map(f => (
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
    'fn z(x,y) = 5 + 2x + 3y',
    'fn h(x,y) = 2 + 2x + 3y',
    'fn h(x,y) = -3 + 2x + 3y',
  ]).xDomain([-1,1]).yDomain([-1,1]).scale(0.8).done()
  return <PLOT3D data={d}/>
}


export const ParallelPlanes = () => {
  const d = plot3D([
    'fn z(x,y) = 5 + 2x + 3y',
    'fn h(x,y) = 2 + 2x + 3y',
    'fn h(x,y) = -3 + 2x + 3y',
  ]).cameraPosition([-7,12,12]).xDomain([-1,1]).yDomain([-1,1]).scale(0.8).done()
  return <PLOT3D data={d}/>
}


export const PlanesDemo2 = () => {
  const d = plot3D([
    'fn a(x,y) = 2 - x - 2y',
    'fn b(x,y) = -0.25 - x - 2y',
    'fn c(x,y) = 1 - 2x + y',
  ]).xDomain([-1,1]).yDomain([-1,1]).scale(0.8).done()
  return <PLOT3D data={d}/>
}


export const PlanesDemo3 = () => {
  const d = plot3D([
    'fn a(x,y) = 2 - x - 2y',
    'fn b(x,y) = 1 - 2x + y',
  ]).xDomain([-1,1]).yDomain([-1,1]).scale(0.8).done()
  return <PLOT3D data={d}/>
}


export const PlanesDemo4 = () => {
  const d = plot3D([
    'fn a(x,y) = (3x + y)/(-2)',
    'fn b(x,y) = (1 - (-4x + y))/(-3)',
    'fn c(x,y) = 1 + x - y',
  ]).xDomain([-2,2]).yDomain([-2,2]).scale(0.8).done()
  return <PLOT3D data={d}/>
}


export const EchelonPlanes = () => {
  const d = plot3D([
    'fn a(x,y) = (9 - x - y)/2',
    'fn b(x,y) = (1 - 2x - 4y)/(-3)',
    'fn c(x,y) = (3x + 6y)/5',
  ]).xDomain([-3,3]).yDomain([-3,3]).scale(1).done()
  return <PLOT3D data={d}/>
}

export const Calc1 = () => {
  const D = tuple(-5, 5);
  const R = tuple(-5, 5);
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
  const d = svg([
    xAxis,
    yAxis,
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
  const epsilon = 0.1;
  const xs = range(-5, 5, epsilon).map(() => randFloat(-4, 4));
  const ys = range(-5, 5, epsilon).map(() => randFloat(-4, 4));
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
  const d = svg([
    grid(D, R).done(),
    // xAxis,
    // yAxis,
    p,
    ...cs,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={45} />;
};

export const AffineFunctionLab = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const RI = tuple(0, 100);
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
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

  const d = svg([
    xAxis,
    yAxis,
    cplot(`fn ${fn}`, D, R).stroke("red").done(),
    circle(5, [AB().value, 0]).fill("salmon"),
    text(`(${AB().string}, 0)`).position(AB().value, 0.8).fill("firebrick"),
  ])
    .dimensions(500, 500)
    .domain(D)
    .range(R)
    .done();
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
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});

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

  const d = svg([
    xAxis,
    yAxis,
    cplot(`fn ${fn}`, D, R).stroke("teal").done(),
    line([vtx.x, R[0]], [vtx.x, R[1]]).stroke("salmon").strokeDashArray(8),
    circle(5, [vtx.x, vtx.y]).fill("lightblue"),
    text(`(${vtx.x.toPrecision(3)}, ${vtx.y.toPrecision(3)})`)
      .position(vtx.x, vtx.y)
      .dx(50)
      .fill("teal"),
  ])
    .dimensions(500, 500)
    .domain(D)
    .range(R)
    .done();
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
  const circles = pts.map(([x, y]) => circle(5, [x, y]).fill("white"));
  const lc = curveLinear(pts);
  const cbc = curveCubicBezier(pts, 0.4);
  const cc = curveCardinal(pts, tensionValue);
  const ccr = curveCatmullRom(pts, alphaValue);
  const d = svg([
    linearCurveChecked && lc.stroke("red"),
    bezierCurveChecked && cbc.stroke("green"),
    cardinalCurveChecked && cc.stroke("magenta"),
    catmullRomCurveChecked && ccr.stroke("blue"),
    circles,
  ])
    .dimensions(400, 400)
    .domain(D)
    .range(R)
    .done();
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

  const d1 = svg([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^2`, D, R).stroke("red").strokeWidth(2).done(),
  ])
    .dimensions(500, 500)
    .domain(D)
    .range(R)
    .done();

  const d2 = svg([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^4`, D, R).stroke("teal").strokeWidth(2).done(),
  ])
    .dimensions(500, 500)
    .domain(D)
    .range(R)
    .done();

  const d3 = svg([
    vaxis(R, 1).stroke("grey").done(),
    haxis(D, 1).stroke("grey").done(),
    cplot(`fn f(x) = x^16`, D, R).stroke("violet").strokeWidth(2).done(),
  ])
    .dimensions(300, 300)
    .domain(D)
    .range(R)
    .done();
  return (
    <div className="grid grid-cols-3">
      <Fig data={d1} width={100} title={<Tex content="y = x^2" />} />
      <Fig data={d2} width={100} title={<Tex content="y = x^4" />} />
      <Fig data={d3} width={100} title={<Tex content="y = x^{16}" />} />
    </div>
  );
};

export const SubsetFig = () => {
  const D = tuple(-7, 7);
  const R = tuple(-7, 7);
  const d = svg([
    quad(8, 14).at(-4, 7).fill("#FFF2C2").end(),
    text("A").latex("block").width(20).fontSize(18).position(-3.4, 6.5),
    text("B").latex("block").width(20).fontSize(18).position(3, 2.2),
    circle(70, [0, 0]).fill("none").fill("#F39E60"),
    circle(40, [-0.75, 0]).fill("none").fill("#DF6D2D"),
    line([-2.8, 4], [-1.7, 2]).arrowEnd(),
    line([3, 0], [2.1, 0]).arrowEnd(),
  ])
    .dimensions(500, 200)
    .domain(D)
    .range(R)
    .done();
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
  const d = svg([
    quad(8, 14).at(-4, 7).fill("#FFF2C2").end(),
    text("A").latex("block").width(20).fontSize(18).position(-3.4, 6.2),
    text("B").latex("block").width(20).fontSize(18).position(2.8, 5.6),
    circle(70, [1, 0]).fillOpacity(0.5).fill("none").fill("#FF748B"),
    circle(70, [-1, 0]).fillOpacity(0.5).fill("none").fill("#81BFDA"),
  ])
    .dimensions(500, 200)
    .domain(D)
    .range(R)
    .done();
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
  const d = svg([
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
  ])
    .dimensions(500, 500)
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={80} paddingBottom={70} />;
};

export const LinearAxesTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xAxis = axis({on: 'x', domain: D, range: R});
  const yAxis = axis({on: 'y', domain: D, range: R});
  const d = svg([xAxis, yAxis])
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={70} />;
};

export const Figy = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const d = svg([
    grid(D, R).done(),
    axis({on: 'x', domain: D, range: R}),
    axis({on: 'y', domain: D, range: R}),
    circle(50, [0, 0]).stroke("olivedrab").fill("yellowgreen").fillOpacity(0.4),
  ])
    .domain(D)
    .range(R)
    .done();
  return <Fig data={d} width={70} />;
};

export default Fig;
