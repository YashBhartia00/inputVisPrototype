import { addHammerEvents, clearChart, triggerFunction, pastelColors, borderColors } from './app.js';

/**************************************************
 * Scatterplot Data
 **************************************************/


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
    
    if (data.eventX !== undefined && data.eventY !== undefined && data.xScale && data.yScale) {
      
      const x = data.xScale.invert(data.eventX);
      const y = data.yScale.invert(data.eventY);
      
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      
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
  },  scatterAddCategoryColor: function(data) {
    
    const categoryName = prompt("Enter name for new category:", "New Category");
    
    
    if (categoryName) {
      
      
      const x = Math.floor(Math.random() * 5);
      const y = Math.floor(Math.random() * 5) + 10;
      
      
      scatterData.push({ x: x, y: y, category: categoryName });
      renderScatterplot();
    }
  },
  scatterRemoveCategoryColor: function(data) {
    alert("removeCategoryColor called – implement as needed.");
  },
  scatterChangePointLoc: function(data) {
    const { index, eventX, eventY, xScale, yScale, isPreview, isFinalUpdate } = data;
    console.log("scatterChangePointLoc called", data);

    if (!scatterData[index]) return;

    
    if (!xScale || !yScale) {
      console.error("xScale or yScale is missing in data");
      return;
    }

    
    const newX = xScale.invert(eventX);
    const newY = yScale.invert(eventY);

    
    const roundedX = Math.round(newX);
    const roundedY = Math.round(newY);

    
    if (isPreview && !scatterData[index]._originalPos) {
      scatterData[index]._originalPos = {
        x: scatterData[index].x,
        y: scatterData[index].y
      };
    }

    if (isPreview) {
      
      scatterData[index].x = roundedX;
      scatterData[index].y = roundedY;
    } else if (isFinalUpdate) {
      
      delete scatterData[index]._originalPos;
    } else {
      
      scatterData[index].x = roundedX;
      scatterData[index].y = roundedY;
    }

    renderScatterplot();
  },
  scatterChangeStart: function(data) {
    
    const { index } = data;
    
    if (scatterData[index]) {
      
      scatterData[index]._changeStartPos = {
        x: scatterData[index].x,
        y: scatterData[index].y
      };
    }
  },
  scatterChangeEnd: function(data) {
    
    const { index, eventX, eventY, xScale, yScale } = data;
    
    if (scatterData[index] && eventX !== undefined && eventY !== undefined && 
        xScale && yScale && scatterData[index]._changeStartPos) {
      
      const newX = xScale.invert(eventX);
      const newY = yScale.invert(eventY);
      
      
      scatterData[index].x = Math.round(newX);
      scatterData[index].y = Math.round(newY);
      
      
      delete scatterData[index]._changeStartPos;
      
      renderScatterplot();
    }
  },
  scatterChangePointColor: function(data) {
    if (data.index !== undefined && scatterData[data.index]) {
      
      const categories = [...new Set(scatterData.map(d => d.category))];
      
      const currentIndex = categories.indexOf(scatterData[data.index].category);
      
      const nextIndex = (currentIndex + 1) % categories.length;
      
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
  
  
  const xExtent = d3.extent(scatterData, d => d.x);
  const yExtent = d3.extent(scatterData, d => d.y);
    
  const xMin = Math.min(-5, xExtent[0]);
  const xMax = Math.max(5, xExtent[1]);
  const yMin = Math.min(-5, yExtent[0]);
  const yMax = Math.max(5, yExtent[1]);
  const xMaxAbs = Math.max(Math.abs(xMin), Math.abs(xMax), 5);
  const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax), 5);
  
  
  const xScale = d3.scaleLinear()
    .domain([-xMaxAbs, xMaxAbs])
    .range([50, 600 - 50])
    .nice(); 
  
  const yScale = d3.scaleLinear()
    .domain([-yMaxAbs, yMaxAbs])
    .range([500 - 30, 30])
    .nice(); 
  
  
  const categories = [...new Set(scatterData.map(d => d.category))];
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(pastelColors);
  
  
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d')); 
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('d')); 
  
  
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis);
  
  
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(yAxis);
  
  
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
  
  
  const points = svg.selectAll("g.point-group")
    .data(scatterData)
    .enter()
    .append("g")
    .attr("class", "point-group");
  
  
  points.append("circle")
    .attr("class", "point-interaction")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 15) 
    .attr("fill", "transparent") 
    .attr("stroke", "rgba(0,0,0,0.1)")
    .attr("stroke-width", 1)
    .each(function(d, i) {
      addHammerEvents(this, { index: i, x: d.x, y: d.y, xScale: xScale, yScale: yScale }, "point");
    });
  
  
  points.append("circle")
    .attr("class", "point pointer-events-none")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 8)
    .attr("fill", d => colorScale(d.category))
    .attr("stroke", "black")
    .attr("stroke-width", 1);
  
  
  points.append("text")
    .attr("class", "point-label pointer-events-none")
    .attr("x", d => xScale(d.x))
    .attr("y", d => yScale(d.y) + 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(d => `(${Math.round(d.x)},${Math.round(d.y)})`);
  
  
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
      .attr("class", "pointer-events-none") 
      .attr("x", 15)
      .attr("y", 9)
      .attr("font-size", "12px")
      .text(category);
  });
  
  
  svg.selectAll(".chart-bg")
    .each(function() {
      
      addHammerEvents(this, { xScale: xScale, yScale: yScale }, "outsidePoints");
    });
    
  
  
  svg.select(".chart-bg").on("click", function(event) {
    
    
    const coords = d3.pointer(event);
    const eventX = coords[0];
    const eventY = coords[1];
    triggerFunction("outsidePoints", "tap", { eventX: eventX, eventY: eventY, xScale: xScale, yScale: yScale });
  });
}

export { scatterData, functionsMapScatter, renderScatterplot };
