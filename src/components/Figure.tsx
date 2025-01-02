import { SVG, svg, Path, path, ArrowHead, Renderable } from "@/algebron/main";

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
          <DEFS data={data._markers} />
          <RENDERABLES data={data._children} />
        </svg>
      </div>
    </figure>
  );
}

type DEFSProps = { data: ArrowHead[] };

function DEFS({ data }: DEFSProps) {
  return (
    <defs>
      {data.map((e, i) => {
        if (e instanceof ArrowHead) {
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
      })}
    </defs>
  );
}

type RENDERABLE2DProps = { data: Renderable[] };

function RENDERABLES({ data }: RENDERABLE2DProps) {
  return (
    <>
      {data.map((e, i) => {
        if (e instanceof Path) {
          return (
            <path
              key={`${e._id}-${i}`}
              d={e._commandList.join("")}
              stroke={"black"}
              fill={"none"}
              markerEnd={e._arrowEnd ? `url(#${e._id}-end)` : ""}
              markerStart={e._arrowEnd ? `url(#${e._id}-start)` : ""}
            />
          );
        }
      })}
    </>
  );
}

export const Demo1 = () => {
  const d = svg({
    domain: [-5, 5],
    range: [-5, 5],
    width: 500,
    height: 500,
  }).children([
    path("p1").moveTo(-3, 0).lineTo(3, 0),
    path("p2").moveTo(0, -3).lineTo(0, -3).arrowEnd(),
    path("p3")
      .arc(0, 0, 50, 0, Math.PI / 4, false)
      .arrowEnd(),
  ]);
  return <FIGURE data={d} />;
};
