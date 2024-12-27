let points = [
    { x: 344, y: 186 },
    { x: 458, y: 276 },
    { x: 370, y: 339 },
    { x: 203, y: 270 },
    { x: 170, y: 188 }
  ];
  
  
  let smoothing = 0.3;
  let pathData = getCurvePathData(points, smoothing, true);
  
  // serialize pathData to d attribute string
  let d = pathDataToD(pathData, 1);
  path.setAttribute("d", d);
  
  
  // Render the svg <path> element
  function getCurvePathData(points, smoothing = 0.1, closed=true){ 
    
    // append first 2 points for closed paths
    if (closed) {
      points = points.concat(points.slice(0, 2));
    }
    
    // Properties of a line
    const line = (pointA, pointB) => {
      const lengthX = pointB.x - pointA.x;
      const lengthY = pointB.y - pointA.y;
      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
      };
    };
  
    // Position of a control point
    const controlPoint = (current, previous, next, reverse) => {
      const p = previous || current;
      const n = next || current;
      const o = line(p, n);
  
      const angle = o.angle + (reverse ? Math.PI : 0);
      const length = o.length * smoothing;
  
      const x = current.x + Math.cos(angle) * length;
      const y = current.y + Math.sin(angle) * length;
      return { x, y };
    };
  
    let pathData = [];
    pathData.push({ type: "M", values: [points[0].x, points[0].y] });
  
    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      const cp1 = controlPoint(points[i - 1], points[i - 2], point);
      const cp2 = controlPoint(point, points[i - 1], points[i + 1], true);
      //console.log( i, 'a', a)
      const command = {
        type: "C",
        values: [cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y]
      };
  
      pathData.push(command);
    }
    
    // copy last commands 1st controlpoint to first curveto
    if (closed) {
      let comLast = pathData[pathData.length - 1];
      let valuesLastC = comLast.values;
      let valuesFirstC = pathData[1].values;
      
      pathData[1] = {
        type: "C",
        values: [valuesLastC[0], valuesLastC[1], valuesFirstC.slice(2)].flat()
      };
      // delete last curveto
      pathData = pathData.slice(0, pathData.length - 1); 
    }
    
    return pathData;
  };
  
  // convert pathdata to d attribute string
  function pathDataToD(pathData, decimals=3){
    let d = pathData
    .map((com) => {
      return `${com.type}${com.values.map(value=>{return +value.toFixed(decimals)}).join(" ")}`;
    })
    .join(" ");
    return d;
  }