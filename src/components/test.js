const {useRef, useEffect, useState} = React;

const App = () => {
  const svgRef = useRef(null);
  const divRef = useRef(null);
  const { xCord, yCord } = useMousePosition({ divRef });
  const [mousedown, setMouseDown] = useState(false);
  const [last_mousex, set_last_mousex] = useState(0);
  const [last_mousey, set_last_mousey] = useState(0);
  const [mousex, set_mousex] = useState(0);
  const [mousey, set_mousey] = useState(0);
  const [rectx, setrectx] = useState(0);
  const [recty, setrecty] = useState(0);
  const [rectwidth, setrectwidth] = useState(0);
  const [rectheight, setrectheight] = useState(0);

  const mouseDown = () => {
    set_last_mousex(xCord);
    set_last_mousey(yCord);
    setMouseDown(true);
  };

  const mouseUp = () => {
    setMouseDown(false);
  };

  const mouseMove = () => {
    set_mousex(xCord);
    set_mousey(yCord);
  };

  const addRectangle = () => {
    if (mousedown) {
      const width = Math.abs(mousex - last_mousex);
      const height = Math.abs(mousey - last_mousey);

      const rx = mousex < last_mousex ? mousex : last_mousex;
      const ry = mousey < last_mousey ? mousey : last_mousey;
      if(rectx !== rx)  setrectx(rx);
      if(recty !== ry )setrecty(ry);
      if(rectheight !== height) setrectheight(height);
      if(rectwidth !== width)  setrectwidth(width);

      return (
        <rect
          className={"rectangle"}
          x={rx}
          y={ry}
          height={height}
          width={width}
        />
      );
    }
  };

  return (
    <div className="App" ref={divRef}>
      <svg
        id="svg"
        ref={svgRef}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseMove={mouseMove}
      >
        {addRectangle() ? (
          addRectangle()
        ) : (
          <rect
            className={"rectangle"}
            x={rectx}
            y={recty}
            height={rectheight}
            width={rectwidth}
          />
        )}
      </svg>
    </div>
  );
}



function useMousePosition({divRef}){
  const [position, setPosition] = useState({ xCord: 0, yCord: 0 });

  useEffect(() => {

    function setFromEvent(e) {
          return setPosition({ xCord: e.clientX, yCord: e.clientY });
      }
      if(divRef.current){
          divRef.current.addEventListener("mousemove", setFromEvent);
      }
      
    return () => {
        if(divRef.current){
            divRef.current.removeEventListener("mousemove", setFromEvent);
        }
    };
  });
  return position;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement)