import { addHammerEvents, clearChart, triggerFunction, pastelColors, borderColors } from './app.js';

/**************************************************
 * Scatterplot Data
 **************************************************/

// Scatterplot: Money spent vs money (colors indicate reasons)
let scatterData = [
    { x: 2, y: 15, category: "Food" },
    { x: 4, y: 30, category: "Utilities" },
    { x: 3, y: 20, category: "Entertainment" },
    { x: -4, y: 30, category: "Food" },
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
      // Use the first category if available instead of creating a new one
      const firstCategory = scatterData.length > 0 ? scatterData[0].category : "Food";
      scatterData.push({ x: roundedX, y: roundedY, category: firstCategory });
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
    const { index, eventX, eventY, xScale, yScale, isPreview, isFinalUpdate } = data;
    console.log("scatterChangePointLoc called", data);

    if (!scatterData[index]) return;

    // Ensure xScale and yScale exist
    if (!xScale || !yScale) {
      console.error("xScale or yScale is missing in data");
      return;
    }

    // Convert screen coordinates to data values
    const newX = xScale.invert(eventX);
    const newY = yScale.invert(eventY);

    // Round values
    const roundedX = Math.round(newX);
    const roundedY = Math.round(newY);

    // Store original position before preview updates
    if (isPreview && !scatterData[index]._originalPos) {
      scatterData[index]._originalPos = {
        x: scatterData[index].x,
        y: scatterData[index].y
      };
    }

    if (isPreview) {
      // For preview during drag, update to the position
      scatterData[index].x = roundedX;
      scatterData[index].y = roundedY;
    } else if (isFinalUpdate) {
      // For final update, just keep the current value (already updated in preview)
      delete scatterData[index]._originalPos;
    } else {
      // For direct value setting, update the position directly
      scatterData[index].x = roundedX;
      scatterData[index].y = roundedY;
    }

    renderScatterplot();
  },
  scatterChangeStart: function(data) {
    // This function marks the start of a change operation
    const { index } = data;
    
    if (scatterData[index]) {
      // Store the starting position
      scatterData[index]._changeStartPos = {
        x: scatterData[index].x,
        y: scatterData[index].y
      };
    }
  },
  scatterChangeEnd: function(data) {
    // This function completes a change operation using the stored start value
    const { index, eventX, eventY, xScale, yScale } = data;
    
    if (scatterData[index] && eventX !== undefined && eventY !== undefined && 
        xScale && yScale && scatterData[index]._changeStartPos) {
      // Convert screen coordinates to data values
      const newX = xScale.invert(eventX);
      const newY = yScale.invert(eventY);
      
      // Round values
      scatterData[index].x = Math.round(newX);
      scatterData[index].y = Math.round(newY);
      
      // Clean up
      delete scatterData[index]._changeStartPos;
      
      renderScatterplot();
    }
  },
  scatterChangePointColor: function(data) {
    if (data.index !== undefined && scatterData[data.index]) {
      // Get all unique categories
      const categories = [...new Set(scatterData.map(d => d.category))];
      // Find current category index
      const currentIndex = categories.indexOf(scatterData[data.index].category);
      // Cycle to next category (or back to first if at the end)
      const nextIndex = (currentIndex + 1) % categories.length;
      // Update the category
      scatterData[data.index].category = categories[nextIndex];
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
    .attr("width", 600  )
    .attr("height", 500 - 80)
    .attr("fill", "#f9f9f9")
    .lower();
  
  // Define scales with both positive and negative values
  const xExtent = d3.extent(scatterData, d => d.x);
  const yExtent = d3.extent(scatterData, d => d.y);
    // Ensure we have both positive and negative values within -5 to 5 range
  const xMin = Math.min(-5, xExtent[0]);
  const xMax = Math.max(5, xExtent[1]);
  const yMin = Math.min(-5, yExtent[0]);
  const yMax = Math.max(5, yExtent[1]);
  const xMaxAbs = Math.max(Math.abs(xMin), Math.abs(xMax), 5);
  const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax), 5);
  
  
  const xScale = d3.scaleLinear()
    .domain([-xMaxAbs, xMaxAbs])
    .range([50, 600 - 50])
    .nice(); // Make the scale use "nice" round numbers
  
  const yScale = d3.scaleLinear()
    .domain([-yMaxAbs, yMaxAbs])
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
      addHammerEvents(this, { index: i, x: d.x, y: d.y, xScale: xScale, yScale: yScale }, "point");
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
    .attr("y", d => yScale(d.y) + 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(d => `(${Math.round(d.x)},${Math.round(d.y)})`);
  
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
    
  // We'll modify this event handler to register on chart-bg, but won't call it directly anymore
  // Instead, we'll let the HammerJS events get the coordinates and pass them to all gestures
  svg.select(".chart-bg").on("click", function(event) {
    // This is now just a backup for native browser events
    // HammerJS will handle the gesture recognition and coordinate passing
    const coords = d3.pointer(event);
    const eventX = coords[0];
    const eventY = coords[1];
    triggerFunction("outsidePoints", "tap", { eventX: eventX, eventY: eventY, xScale: xScale, yScale: yScale });
  });
}

export { scatterData, functionsMapScatter, renderScatterplot };
