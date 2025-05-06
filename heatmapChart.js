import { addHammerEvents, clearChart } from './app.js';

/**************************************************
 * Heatmap Data
 **************************************************/

// Heatmap: Time allocation (e.g., minutes spent on activities per day)
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
    
    //make amount absolute
    var newAmount = Math.abs(amount);
    newAmount = Math.round(-amount);
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      // Store original value before preview updates
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        // For preview, restore original and add current amount
        heatmapData[row][col] = heatmapData[row]._originalValues[col] + Math.round(newAmount);
      } else {
        // For final update, add amount and clear stored original
        heatmapData[row][col] += Math.round(newAmount);
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },
  heatmapRemoveTime: function(data) {
    const { row, col, amount, isPreview } = data;

    newAmount = Math.abs(amount); // Make amount absolute
    newAmount = -amount;
    
    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      // Store original value before preview updates
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }
      
      if (isPreview) {
        // For preview, restore original and subtract current amount
        heatmapData[row][col] = Math.max(0, heatmapData[row]._originalValues[col] - Math.round(newAmount));
      } else {
        // For final update, subtract amount and clear stored original
        heatmapData[row][col] = Math.max(0, heatmapData[row][col] - Math.round(newAmount));
        delete heatmapData[row]._originalValues;
      }
      
      renderHeatmap();
    }
  },
  heatmapChangeTime: function(data) {
    const { row, col, eventX, eventY, xScale, yScale, isPreview } = data;

    if (heatmapData[row] && typeof heatmapData[row][col] === "number") {
      // Convert screen coordinates to data values
      const newValue = Math.round(yScale.invert(eventY));

      // Store original value before preview updates
      if (isPreview && !heatmapData[row]._originalValues) {
        heatmapData[row]._originalValues = [...heatmapData[row]];
      }

      if (isPreview) {
        // For preview, restore original and set to the new value
        heatmapData[row][col] = newValue;
      } else {
        // For final update, set to the new value and clear stored original
        heatmapData[row][col] = newValue;
        delete heatmapData[row]._originalValues;
      }

      renderHeatmap();
    }
  },
  heatmapAddColumn: function(data) {
    alert("addColumn called");
  },
  heatmapRemoveColumns: function(data) {
    alert("removeColumns called");
  },
  heatmapMergeColumns: function(data) {
    alert("mergeColumns called");
  }
};

/**************************************************
 * Heatmap Rendering
 **************************************************/

function renderHeatmap() {
  clearChart();
  const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);
  
  svg.append("rect")
    .attr("class", "chart-bg")
    .attr("x", 40)
    .attr("y", 20)
    .attr("width", 600 - 80)
    .attr("height", 500 - 60)
    .attr("fill", "#f9f9f9")
    .lower();
  
  // Increase the left margin to accommodate row labels
  const leftMargin = 70;
  // Reduce the width to make space for color legend
  const cellSize = 60;
  const numRows = heatmapData.length;
  const numCols = heatmapData[0].length;
  
  // Calculate the width needed for the main chart
  const chartWidth = cellSize * numCols;
  
  // Create pastel color scale
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(heatmapData.flat())])
    .interpolator(d3.interpolateRgb("#a8d0e6", "#d3c0f9")); // Direct RGB interpolation between pastel blue and purple
  
  // Render cells.
  for(let i = 0; i < numRows; i++){
    for(let j = 0; j < numCols; j++){
      // Cell rectangle
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
          addHammerEvents(this, { row: i, col: j, amount: 15 }, "cell");
        });
        
      // Add cell value text with pointer-events-none to allow interaction with cell
      svg.append("text")
        .attr("class", "cell-label pointer-events-none")
        .attr("x", leftMargin + j * cellSize + cellSize/2)
        .attr("y", 40 + i * cellSize + cellSize/2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", heatmapData[i][j] > 30 ? "white" : "black")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(Math.round(heatmapData[i][j])); // Ensure integers are displayed
    }
  }
  
  // Add row labels with pointer-events-none
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
  
  // Add column labels with pointer-events-none
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
  
  // Add color legend
  const legendWidth = 20;
  const legendHeight = 200;
  const legendX = leftMargin + chartWidth + 40;
  const legendY = 150;
  
  // Create the gradient for the legend
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "heatmap-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");
    
  // Add color stops
  const maxValue = d3.max(heatmapData.flat());
  [0, 0.25, 0.5, 0.75, 1].forEach(stop => {
    linearGradient.append("stop")
      .attr("offset", `${stop * 100}%`)
      .attr("stop-color", colorScale(stop * maxValue));
  });
  
  // Draw the legend rectangle with the gradient
  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY - legendHeight / 2)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#heatmap-gradient)");
    
  // Add legend title with pointer-events-none
  svg.append("text")
    .attr("class", "legend-title pointer-events-none")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - legendHeight / 2 - 15)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("Minutes");
    
  // Add legend labels for min and max values with pointer-events-none
  svg.append("text")
    .attr("class", "legend-label pointer-events-none")
    .attr("x", legendX + legendWidth + 5)
    .attr("y", legendY - legendHeight / 2)
    .attr("dominant-baseline", "middle")
    .text(Math.round(maxValue)); // Ensure integer display
    
  svg.append("text")
    .attr("class", "legend-label pointer-events-none")
    .attr("x", legendX + legendWidth + 5)
    .attr("y", legendY + legendHeight / 2)
    .attr("dominant-baseline", "middle")
    .text("0");
  
  svg.selectAll(".chart-bg")
    .each(function() {
      addHammerEvents(this, { xScale: xScale, yScale: yScale }, "outsideCells");
    });
}

export { heatmapData, functionsMapHeatmap, renderHeatmap };
