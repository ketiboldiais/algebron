import { interpolator } from "@/algebron/main";

abstract class Renderable {
  abstract render(fx: (x: number) => number, fy: (y: number) => number): this;
}

type SVGContext = {
  domain: [number, number];
  range: [number, number];
  width: number;
  height: number;
};

class SVG {
  _children: Renderable[] = [];
  _domain: [number, number];
  _range: [number, number];
  _width: number;
  _height: number;
  _fx: (x: number) => number;
  _fy: (y: number) => number;
  constructor(context: SVGContext) {
    this._domain = context.domain;
    this._range = context.range;
    this._width = context.width;
    this._height = context.height;
    this._fx = interpolator(this._domain, [0, this._width]);
    this._fy = interpolator(this._range, [this._height, 0]);
  }
  children(objects: Renderable[]) {
    objects.forEach((obj) => {
      this._children.push(obj.render(this._fx, this._fy));
    });
    return this;
  }
}

const svg = (context: SVGContext) => new SVG(context);

type PCommand =
  | MCommand
  | LCommand
  | CCommand
  | QCommand
  | ARCTOCommand
  | ARCCommand
  | ZCommand;

type MCommand = ["M", number, number];

const M = (x: number, y: number): MCommand => ["M", x, y];

type LCommand = ["L", number, number];

const L = (x: number, y: number): LCommand => ["L", x, y];

type CCommand = ["C", number, number, number, number, number, number];

const C = (
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  ex: number,
  ey: number
): CCommand => ["C", c1x, c1y, c2x, c2y, ex, ey];

type QCommand = ["Q", number, number, number, number];

const Q = (cx: number, cy: number, ex: number, ey: number): QCommand => [
  "Q",
  cx,
  cy,
  ex,
  ey,
];

type ARCTOCommand = ["ARCTO", number, number, number, number, number];

const ARCTO = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number
): ARCTOCommand => ["ARCTO", x1, y1, x2, y2, r];

type ARCCommand = ["ARC", number, number, number, number, number, 0 | 1];

const ARC = (
  x: number,
  y: number,
  r: number,
  a0: number,
  a1: number,
  ccw: 0 | 1
): ARCCommand => ["ARC", x, y, r, a0, a1, ccw];

type ZCommand = ["Z"];

const Z = (): ZCommand => ["Z"];

const pi = Math.PI,
  tau = 2 * pi,
  epsilon = 1e-6,
  tauEpsilon = tau - epsilon;

function processPathCommands(
  commandList: PCommand[],
  fx: (x: number) => number,
  fy: (y: number) => number
) {
  const output: string[] = [];
  let x0: number | null = null;
  let y0: number | null = x0;
  let x1: number | null = y0;
  let y1: number | null = x1;
  commandList.forEach((command) => {
    const type = command[0];
    switch (type) {
      case "M": {
        const x = fx(command[1]);
        const y = fy(command[2]);
        output.push(`M${(x0 = x1 = +x)},${(y0 = y1 = +y)}`);
        break;
      }
      case "Z": {
        output.push("Z");
        break;
      }
      case "L": {
        const x = fx(command[1]);
        const y = fx(command[2]);
        output.push(`L${(x1 = +x)},${(y1 = +y)}`);
        break;
      }
      case "Q": {
        const cx = fx(command[1]);
        const cy = fy(command[2]);
        const ex = fx(command[3]);
        const ey = fy(command[4]);
        output.push(`Q${+cx},${+cy},${(x1 = +ex)},${(y1 = +ey)}`);
        break;
      }
      case "C": {
        const c1x = fx(command[1]);
        const c1y = fy(command[2]);
        const c2x = fx(command[3]);
        const c2y = fy(command[4]);
        const ex = fx(command[5]);
        const ey = fy(command[6]);
        output.push(
          `C${+c1x},${+c1y},${+c2x},${+c2y},${(x1 = +ex)},${(y1 = +ey)}`
        );
        break;
      }
      case "ARCTO": {
        // x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        // Is the radius negative? Error.
        const ax1 = fx(command[1]);
        const ay1 = fy(command[2]);
        const ax2 = fx(command[3]);
        const ay2 = fy(command[4]);
        const r = command[5];
        if (r < 0) throw new Error(`negative radius: ${r}`);
        const x0 = x1,
          y0 = y1,
          x21 = ax2 - ax1,
          y21 = ay2 - ay1,
          x01 = (x0 ?? 0) - ax1,
          y01 = (y0 ?? 0) - ay1,
          l01_2 = x01 * x01 + y01 * y01;

        // Is this path empty? Move to (x1,y1).
        if (x1 === null) {
          output.push(`M${(x1 = x1)},${(y1 = y1)}`);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon)) {
          break;
        }

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          output.push(`L${(x1 = x1)},${(y1 = y1)}`);
        }

        // Otherwise, draw an arc!
        else {
          const x20 = ax2 - (x0 ?? 0),
            y20 = ay2 - (y0 ?? 0),
            l21_2 = x21 * x21 + y21 * y21,
            l20_2 = x20 * x20 + y20 * y20,
            l21 = Math.sqrt(l21_2),
            l01 = Math.sqrt(l01_2),
            l =
              r *
              Math.tan(
                (pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2
              ),
            t01 = l / l01,
            t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            output.push(`L${x1 + t01 * x01},${(y1 as number) + t01 * y01}`);
          }

          output.push(
            `A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${(x1 =
              x1 + t21 * x21)},${(y1 = ay1 + t21 * y21)}`
          );
        }
        break;
      }
      case "ARC": {
        const x = fx(command[1]);
        const y = fy(command[2]);
        const r = command[3];
        const a0 = command[4];
        const a1 = command[5];
        // x = +x, y = +y, r = +r, ccw = !!ccw;
        const ccw = command[6];

        // Is the radius negative? Error.
        if (r < 0) throw new Error(`negative radius: ${r}`);

        const dx = r * Math.cos(a0),
          dy = r * Math.sin(a0),
          x0 = x + dx,
          y0 = y + dy,
          cw = 1 ^ ccw;
        let da = ccw ? a0 - a1 : a1 - a0;

        // Is this path empty? Move to (x0,y0).
        if (x1 === null) {
          output.push(`M${x0},${y0}`);
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (
          Math.abs(x1 - x0) > epsilon ||
          Math.abs((y1 ?? 0) - y0) > epsilon
        ) {
          output.push(`L${x0},${y0}`);
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = (da % tau) + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          output.push(
            `A${r},${r},0,1,${cw},${x - dx},${
              y - dy
            }A${r},${r},0,1,${cw},${(x1 = x0)},${(y1 = y0)}`
          );
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          output.push(
            `A${r},${r},0,${+(da >= pi)},${cw},${(x1 =
              x + r * Math.cos(a1))},${(y1 = y + r * Math.sin(a1))}`
          );
        }
        break;
      }
    }
  });
  return output;
}

class SVGPath extends Renderable {
  commands: PCommand[];
  commandList: string[] = [];
  constructor() {
    super();
    this.commands = [];
  }
  render(fx: (x: number) => number, fy: (y: number) => number) {
    this.commandList = processPathCommands(this.commands, fx, fy);
    return this;
  }
  push(command: PCommand) {
    this.commands.push(command);
  }
  moveTo(x: number, y: number) {
    this.push(M(x, y));
    return this;
  }
  closePath() {
    this.push(Z());
    return this;
  }
  lineTo(x: number, y: number) {
    this.push(L(x, y));
    return this;
  }
  quadraticCurveTo(x1: number, y1: number, x: number, y: number) {
    this.push(Q(x1, y1, x, y));
    return this;
  }
  bezierCurveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
  ) {
    this.push(C(x1, y1, x2, y2, x, y));
    return this;
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) {
    this.push(ARCTO(x1, y1, x2, y2, r));
    return this;
  }
  arc(
    x: number,
    y: number,
    r: number,
    a0: number,
    a1: number,
    counterClockwise: boolean
  ) {
    const ccw = counterClockwise ? 1 : 0;
    this.push(ARC(x, y, r, a0, a1, ccw));
    return this;
  }
  toString() {
    return this.commands.join(",");
  }
}

const path = () => new SVGPath();

type FigureProps = {
  data: SVG;
  width?: number;
  paddingBottom?: number;
};

function FIGURE({ data, width = 100, paddingBottom = width }: FigureProps) {
  const par = "xMidYMid meet";
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
    <figure className="algebron-fig2D">
      <div style={boxcss}>
        <svg viewBox={viewbox} preserveAspectRatio={par} style={svgcss}>
          {data._children.map((child, i) => {
            if (child instanceof SVGPath) {
              return (
                <path
                  key={`path-${i}`}
                  d={child.commandList.join("")}
                  stroke={"black"}
                  fill={"none"}
                />
              );
            }
          })}
        </svg>
      </div>
    </figure>
  );
}

export const Demo1 = () => {
  const d = svg({
    domain: [-5, 5],
    range: [-5, 5],
    width: 500,
    height: 500,
  }).children([
		path().moveTo(-5,0).lineTo(5,0),
		path().moveTo(0,-5).lineTo(0,-5),
		path().moveTo(0,0).arc(0,0,50,0,Math.PI/2,false),
	]);
  return <FIGURE data={d} />;
};
