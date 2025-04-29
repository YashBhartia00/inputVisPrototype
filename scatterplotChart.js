import { addHammerEvents, clearChart, triggerFunction, pastelColors, borderColors } from './app.js';

/**************************************************
 * Scatterplot Data
 **************************************************/

// Scatterplot: Money spent vs money (colors indicate reasons)
let scatterData = [
  { x: 100, y: 150, category: "Food" },
  { x: 200, y: 300, category: "Utilities" },
  { x: 300, y: 200, category: "Entertainment" }
];

/**************************************************
 * Scatterplot Functions
 **************************************************/

const functionsMapScatter = {
  scatterAddPoint: function(data) {
    // Add a new point at the event location
    if (data.eventX !== undefined && data.eventY !== undefined && data.xScale && data.yScale) {
      // Convert screen coordinates to data values
      const x = data.xScale.invert(data.eventX);
      const y = data.yScale.invert(data.eventY);
      // Round to nearest whole numbers for cleaner data
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      scatterData.push({ x: roundedX, y: roundedY, category: "New" });
      renderScatterplot();
    }
  },
  scatterRemovePoint: function(data) {
    if (data.index !== undefined && scatterData[data.index]) {
      scatterData.splice(data.index, 1);
      renderScatterplot();
    }
  },
  scatterAddCategoryColor: function(data) {
    alert("addCategoryColor called – implement as needed.");
  },
  scatterRemoveCategoryColor: function(data) {
    alert("removeCategoryColor called – implement as needed.");
  },
  scatterChangePointLoc: function(data) {
    if (data.index !== undefined && scatterData[data.index]) {
      scatterData[data.index].x = Math.round(data.x);
      scatterData[data.index].y = Math.round(data.y);
      renderScatterplot();
    }
  },
  scatterChangePointColor: function(data) {
    if (data.index !== undefined && scatterData[data.index]) {
      scatterData[data.index].category = data.newCategory;
      renderScatterplot();
    }
  }
};

/**************************************************
 * Scatterplot Rendering
 **************************************************/

function renderScatterplot() {
  clearChart();
  const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);
  
  svg.append("rect")
    .attr("class", "chart-bg")
    .attr("x", 50)
    .attr("y", 30)
    .attr("width", 600 - 100)
    .attr("height", 500 - 80)
    .attr("fill", "#f9f9f9")
    .lower();
  
  // Define scales with both positive and negative values
  const xExtent = d3.extent(scatterData, d => d.x);
  const yExtent = d3.extent(scatterData, d => d.y);
  
  // Ensure we have both positive and negative values
  const xMin = Math.min(-50, xExtent[0]);
  const xMax = Math.max(50, xExtent[1]);
  const yMin = Math.min(-50, yExtent[0]);
  const yMax = Math.max(50, yExtent[1]);
  
  const xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([50, 600 - 50])
    .nice(); // Make the scale use "nice" round numbers
  
  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([500 - 30, 30])
    .nice(); // Make the scale use "nice" round numbers
  
  // Get all unique categories for the legend
  const categories = [...new Set(scatterData.map(d => d.category))];
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(pastelColors);
  
  // Draw axes with zero line highlighted and integer ticks
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d')); // Format as integers
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('d')); // Format as integers
  
  // X-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis);
  
  // Y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(yAxis);
  
  // Axis labels
  svg.append("text")
    .attr("class", "axis-label pointer-events-none")
    .attr("x", 600/2)
    .attr("y", 500 - 5)
    .attr("text-anchor", "middle")
    .text("Money Spent");
  
  svg.append("text")
    .attr("class", "axis-label pointer-events-none")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Mood");
  
  // Create a group for each point
  const points = svg.selectAll("g.point-group")
    .data(scatterData)
    .enter()
    .append("g")
    .attr("class", "point-group");
  
  // Add larger invisible circles for better interaction (touch target area)
  points.append("circle")
    .attr("class", "point-interaction")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 15) // Larger radius for easier interaction
    .attr("fill", "transparent") // Invisible but interactive
    .attr("stroke", "rgba(0,0,0,0.1)")
    .attr("stroke-width", 1)
    .each(function(d, i) {
      addHammerEvents(this, { index: i, x: d.x, y: d.y }, "point");
    });
  
  // Add visible points without direct events (they'll be handled by the larger circles)
  points.append("circle")
    .attr("class", "point pointer-events-none")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 8)
    .attr("fill", d => colorScale(d.category))
    .attr("stroke", "black")
    .attr("stroke-width", 1);
  
  // Add point labels with pointer-events-none
  points.append("text")
    .attr("class", "point-label pointer-events-none")
    .attr("x", d => xScale(d.x))
    .attr("y", d => yScale(d.y) - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(d => `${d.category}: (${Math.round(d.x)},${Math.round(d.y)})`);
  
  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${600 - 120}, 40)`);
    
  categories.forEach((category, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);
      
    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale(category));
      
    legendRow.append("text")
      .attr("class", "pointer-events-none") // Make labels pass through
      .attr("x", 15)
      .attr("y", 9)
      .attr("font-size", "12px")
      .text(category);
  });
  
  // Background for outsidePoints (tap to add new point at tap location).
  svg.selectAll(".chart-bg")
    .each(function() {
      // Pass the scales so we can convert screen coordinates to data
      addHammerEvents(this, { xScale: xScale, yScale: yScale }, "outsidePoints");
    });
    
  // Update event handling for background to capture click location
  svg.select(".chart-bg").on("click", function(event) {
    const coords = d3.pointer(event);
    const eventX = coords[0];
    const eventY = coords[1];
    triggerFunction("outsidePoints", "tap", { eventX: eventX, eventY: eventY, xScale: xScale, yScale: yScale });
  });
}

export { scatterData, functionsMapScatter, renderScatterplot };
