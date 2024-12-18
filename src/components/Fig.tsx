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
  line3D,
  haxis,
  vaxis,
  Plot3D,
  Fn3D,
  tree,
  subtree,
  leaf,
} from "@/liber/main";

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

type FigProps = { d: SVGObj; w?: number; p?: number };

const FIGURE = ({ children }: { children: ReactNode }) => {
  return <figure>{children}</figure>;
};

const Fig = ({ d, w = 100, p = w }: FigProps) => {
  const par = "xMidYMid meet";
  const width = d.$width;
  const height = d.$height;
  const viewbox = `0 0 ${width} ${height}`;
  const boxcss = {
    display: "block",
    margin: "0 auto",
    position: "relative",
    width: `${w}%`,
    paddingBottom: `${p}%`,
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
          <DEF elements={d.$markers} />
          <Fig2D elements={d.$children} />
        </svg>
      </div>
    </FIGURE>
  );
};

type Fig2DProps = { elements: GraphicsObj[] };

type Path2DProps = { element: Path };

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
        if (isGroup(element)) {
          return <G2D key={element.$id} element={element} />;
        }
        if (isPath(element)) {
          return <Path2D key={element.$id} element={element} />;
        }
        if (isLine(element)) {
          return <L2D key={element.$id} element={element} />;
        }
        if (isText(element)) {
          return <Txt key={element.$id} element={element} />;
        }
        if (isCircle(element)) {
          return <Circ key={element.$id} element={element} />;
        }
      })}
    </>
  );
};

type CircleProps = { element: Circle };
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

type TxtProps = { element: TextObj };
const Txt = ({ element }: TxtProps) => {
  if (element.$latex) {
    const block = element.$latex === "block" ? true : false;
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

type G2DProps = { element: GroupObj };
const G2D = ({ element }: G2DProps) => {
  return (
    <g>
      <Fig2D elements={element.$children} />
    </g>
  );
};

type L2DProps = { element: LineObj };

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
  return <Fig d={d} w={60} />;
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
  return <Fig d={d} w={60} />;
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
  return <Fig d={d} w={60} />;
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
  return <Fig d={d} w={60} />;
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
  return <Fig d={d} w={60} />;
};

export default Fig;

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

type Plot3DProps = { element: Plot3D };
export function PLOT3D({ element }: Plot3DProps) {
  const d = element;
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
          <>
            <Plot3DPath key={`${d.id}-${i}`} zfn={zfn} />
          </>
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
  return <PLOT3D element={d} />;
}

export function TreeTest() {
  const d = svg([
    tree(
      subtree("a").nodes([
        subtree("b").nodes([leaf("c"), leaf("d")]),
        subtree("e").nodes([
          leaf("f"),
          subtree("g").nodes([
            subtree("h").nodes([leaf("j"), leaf("k")]),
            leaf("o"),
          ]),
        ]),
      ])
    )
      .nodeRadius(5)
      .layout('reingold-tilford')
      .done(),
  ])
    .domain([-10,10])
    .range([-10,10])
    .done();
  return <Fig d={d} />;
}

export const PlotTest = () => {
  const D = tuple(-10, 10);
  const R = tuple(-10, 10);
  const xmin = D[0];
  const xmax = D[1];
  const ymin = R[0];
  const ymax = R[1];
  const xaxis = line3D([xmin, 0, 1], [xmax, 0, 1]).stroke("grey");
  const yaxis = line3D([0, ymin, 1], [0, ymax, 1]).stroke("grey");
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
  return <Fig d={d} />;
};
