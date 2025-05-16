import { addHammerEvents, clearChart } from './app.js';

/**************************************************
 * Heatmap Data
 **************************************************/


let heatmapData = [
  [30, 45, 20, 15],
  [25, 50, 35, 10],
  [40, 30, 20, 10],
  [20, 40, 25, 15],
  [30, 35, 20, 15],
  [25, 45, 30, 10],
  [20, 30, 25, 15]
];

/**************************************************
 * Heatmap Functions
 **************************************************/

const functionsMapHeatmap = {
  heatmapAddTime: function(data) {
    const { row, col, amount, isPreview } = data;
    
    
    const newAmount = Math.abs(amount);
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        
        heatmapData[row][col] = heatmapData[row]._originalValues[col] + Math.round(newAmount);
      } else {
        
        heatmapData[row][col] += Math.round(newAmount);
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },
  heatmapRemoveTime: function(data) {
    const { row, col, amount, isPreview } = data;
    
    
    const newAmount = Math.abs(amount);
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        
        heatmapData[row][col] = Math.max(0, heatmapData[row]._originalValues[col] - Math.round(newAmount));
      } else {
        
        heatmapData[row][col] = Math.max(0, heatmapData[row][col] - Math.round(newAmount));
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },
  heatmapChangeTime: function(data) {
    const { row, col, eventY, isPreview } = data;

    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      
      const cellSize = 60;
      const maxValue = d3.max(heatmapData.flat());
      
      
      
      const cellTop = 40 + row * cellSize;
      const cellBottom = cellTop + cellSize;
      const relativeY = (cellBottom - eventY) / cellSize;
      const newValue = Math.round(relativeY * maxValue);
      
      
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }

      if (isPreview) {
        heatmapData[row][col] = Math.max(0, Math.min(maxValue, newValue));
      } else {
        heatmapData[row][col] = Math.max(0, Math.min(maxValue, newValue));
        delete heatmapData[row]._originalValues;
      }

      renderHeatmap();
    }
  },
  heatmapAddColumn: function(data) {
    
    const defaultValue = 25;
    
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
  },
  heatmapMergeColumns: function(data) {
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
    .attr("width", 750)  // Increased width to accommodate legend
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
  
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(heatmapData.flat()) + 1])
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
        .attr("data-row", i)
        .attr("data-col", j)
        .each(function() {
          addHammerEvents(this, { row: i, col: j, amount: 5 }, "cell");
        });
        
      
      svg.append("text")
        .attr("class", "cell-label pointer-events-none")
        .attr("x", leftMargin + j * cellSize + cellSize/2)
        .attr("y", 40 + i * cellSize + cellSize/2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", heatmapData[i][j] > 30 ? "white" : "black")
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
    
  
  const maxValue = d3.max(heatmapData.flat());
  [0, 0.25, 0.5, 0.75, 1].forEach(stop => {
    linearGradient.append("stop")
      .attr("offset", `${stop * 100}%`)
      .attr("stop-color", colorScale(stop * maxValue));
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
    .attr("y", legendY - legendHeight / 2 - 15)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Minutes");
    
  
  svg.append("text")
    .attr("class", "legend-label pointer-events-none")
    .attr("x", legendX + legendWidth + 5)
    .attr("y", legendY - legendHeight / 2)
    .attr("dominant-baseline", "middle")
    .text(Math.round(maxValue)); 
    
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
