import { addHammerEvents, clearChart } from './app.js';

/**************************************************
 * Heatmap Data
 **************************************************/


let heatmapData = [
  [1, 3, 0, 0],
  [0, 2, 1, 0],
  [3, 1, 0, 0],
  [0, 2, 0, 0],
  [2, 1, 0, 0],
  [0, 3, 2, 0],
  [0, 1, 0, 0]
];

/**************************************************
 * Heatmap Functions
 **************************************************/

const functionsMapHeatmap = {  heatmapAddTime: function(data) {
    const { row, col, amount, isPreview } = data;
    
    
    const newAmount = 1;
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        heatmapData[row][col] = heatmapData[row]._originalValues[col] + newAmount;
      } else {
        heatmapData[row][col] += newAmount;
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },  heatmapRemoveTime: function(data) {
    const { row, col, amount, isPreview } = data;
    
    
    const newAmount = 1;
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        heatmapData[row][col] = Math.max(0, heatmapData[row]._originalValues[col] - newAmount);
      } else {
        heatmapData[row][col] = Math.max(0, heatmapData[row][col] - newAmount);
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },  heatmapChangeTime: function(data) {
    const { row, col, eventY, isPreview } = data;

    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      const cellSize = 60;
      const baseMaxValue = 8; // Using a higher base value for better granularity
      
      const cellTop = 40 + row * cellSize;
      const cellBottom = cellTop + cellSize;
      const relativeY = (cellBottom - eventY) / cellSize;
      
      // No max limit applied here
      const newValue = Math.round(relativeY * baseMaxValue);
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }

      if (isPreview) {
        heatmapData[row][col] = Math.max(0, newValue); // No upper limit
      } else {
        heatmapData[row][col] = Math.max(0, newValue); // No upper limit
        delete heatmapData[row]._originalValues;
      }

      renderHeatmap();
    }
  },heatmapAddColumn: function(data) {
    
    const defaultValue = 1; 
    
    for (let i = 0; i < heatmapData.length; i++) {
      heatmapData[i].push(defaultValue);
    }
    
    renderHeatmap();
  },
  heatmapRemoveColumns: function(data) {
    
    if (heatmapData[0].length > 1) {
      for (let i = 0; i < heatmapData.length; i++) {
        heatmapData[i].pop();
      }
      renderHeatmap();
    }
  },  heatmapMergeColumns: function(data) {
    const { col } = data;
    
    
    if (col < heatmapData[0].length - 1) {
      for (let i = 0; i < heatmapData.length; i++) {
        
        
        heatmapData[i][col] = Math.round((heatmapData[i][col] + heatmapData[i][col + 1]) / 2);
        
        heatmapData[i].splice(col + 1, 1);
      }
      renderHeatmap();
    }
  }
};

/**************************************************
 * Heatmap Rendering
 **************************************************/

function renderHeatmap() {
  clearChart();
  const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", 750)  
    .attr("height", 500)
  
  svg.append("rect")
    .attr("class", "chart-bg")
    .attr("x", 40)
    .attr("y", 20)
    .attr("width", 600 - 80)
    .attr("height", 500 - 60)
    .attr("fill", "#f9f9f9")
    .lower();
  
  
  const leftMargin = 70;
  
  const cellSize = 60;
  const numRows = heatmapData.length;
  const numCols = heatmapData[0].length;
      const chartWidth = cellSize * numCols;
  
  // Find the actual maximum value in the data
  let actualMaxValue = 0;
  for(let i = 0; i < numRows; i++) {
    for(let j = 0; j < numCols; j++) {
      actualMaxValue = Math.max(actualMaxValue, heatmapData[i][j]);
    }
  }
  
  // Use at least 4 as minimum for the scale, but allow higher values
  const scaleMaxValue = Math.max(4, actualMaxValue);
    
  const colorScale = d3.scaleSequential()
    .domain([0, scaleMaxValue]) 
    .interpolator(t => d3.interpolateLab("white", "purple")(t)); 
  
  
  for(let i = 0; i < numRows; i++){
    for(let j = 0; j < numCols; j++){
      
      svg.append("rect")
        .attr("class", "cell")
        .attr("x", leftMargin + j * cellSize)
        .attr("y", 40 + i * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", colorScale(heatmapData[i][j]))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("data-row", i)        .attr("data-col", j)
        .each(function() {
          addHammerEvents(this, { row: i, col: j, amount: 1 }, "cell");
        });
        
        svg.append("text")
        .attr("class", "cell-label pointer-events-none")
        .attr("x", leftMargin + j * cellSize + cellSize/2)
        .attr("y", 40 + i * cellSize + cellSize/2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", heatmapData[i][j] > 2 ? "white" : "black")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(Math.round(heatmapData[i][j]));
    }
  }
  
  
  const rowLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  rowLabels.forEach((d, i) => {
    svg.append("text")
      .attr("class", "row-label pointer-events-none")
      .attr("x", leftMargin - 10)
      .attr("y", 40 + i * cellSize + cellSize/2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .attr("font-weight", "bold")
      .text(d);
  });
  
  
  const colLabels = ["Work", "Leisure", "Exercise", "Sleep"];
  colLabels.forEach((d, j) => {
    svg.append("text")
      .attr("class", "col-label pointer-events-none")
      .attr("x", leftMargin + j * cellSize + cellSize/2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(d);
  });
  
  
  const legendWidth = 20;
  const legendHeight = 200;
  const legendX = leftMargin + chartWidth + 40;
  const legendY = 150;
  
  
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "heatmap-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");
      // Using the dynamic scale max value from above
  [0, 0.25, 0.5, 0.75, 1].forEach(stop => {
    linearGradient.append("stop")
      .attr("offset", `${stop * 100}%`)
      .attr("stop-color", colorScale(stop * scaleMaxValue));
  });
  
  
  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY - legendHeight / 2)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#heatmap-gradient)");
    
  
  svg.append("text")
    .attr("class", "legend-title pointer-events-none")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - legendHeight / 2 - 15)    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Hours");
      svg.append("text")
    .attr("class", "legend-label pointer-events-none")
    .attr("x", legendX + legendWidth + 5)
    .attr("y", legendY - legendHeight / 2)
    .attr("dominant-baseline", "middle")
    .text(scaleMaxValue.toString()); 
    
  svg.append("text")
    .attr("class", "legend-label pointer-events-none")
    .attr("x", legendX + legendWidth + 5)
    .attr("y", legendY + legendHeight / 2)
    .attr("dominant-baseline", "middle")
    .text("0");
  
  
  svg.selectAll(".chart-bg")
    .each(function() {
      addHammerEvents(this, {}, "outsideCells");
    });
}

export { heatmapData, functionsMapHeatmap, renderHeatmap };
