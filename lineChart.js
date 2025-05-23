import { addHammerEvents, clearChart, triggerFunction, pastelColors, borderColors } from './app.js';

/**************************************************
 * Line Chart Data
 **************************************************/


let lineData = [
  { day: 1, height: 10 },
  { day: 2, height: 12 },
  { day: 3, height: 15 },
  { day: 4, height: 18 },
  { day: 5, height: 20 }
];

/**************************************************
 * Line Chart Functions
 **************************************************/

const functionsMapLine = {  lineAddPoint: function(data) {
    
    
    if (data.isPreview) {
      return; 
    }

    const newDay = lineData.length > 0 ? Math.max(...lineData.map(d => d.day)) + 1 : 1;
    
    let newHeight = 10; 
    if (data.eventY !== undefined && data.yScale) {
      newHeight = data.yScale.invert(data.eventY);
      
      newHeight = Math.round(newHeight);
      
      newHeight = Math.max(0, newHeight);
      
      lineData.push({ day: newDay, height: newHeight });
      renderLineChart();
    } else {
      console.error(data.eventY, data.yScale, "Invalid event position or scale for adding point.");
    }
  },
  lineRemovePoint: function(data) {
    const { day, amount } = data;
    const point = lineData.find(d => d.day === day);
    if (point) { point.height = Math.max(0, Math.round(point.height - amount)); renderLineChart(); }
  },
  lineAddPointHeight: function(data) {
    const { day, amount, isPreview } = data;
    const point = lineData.find(d => d.day === day);
    
    if (point) {
      
      if (isPreview && !point._originalHeight) {
        point._originalHeight = point.height;
      }
      
      if (isPreview) {
        
        point.height = point._originalHeight + Math.round(amount);
      } else {
        
        point.height += Math.round(amount);
        delete point._originalHeight;
      }
      
      renderLineChart();
    }
  },
  lineRemovePointHeight: function(data) {
    const { day, amount, isPreview } = data;
    const point = lineData.find(d => d.day === day);
    
    if (point) {
      
      if (isPreview && !point._originalHeight) {
        point._originalHeight = point.height;
      }
      
      if (isPreview) {
        
        point.height = Math.max(0, point._originalHeight - Math.round(amount));
      } else {
        
        point.height = Math.max(0, point.height - Math.round(amount));
        delete point._originalHeight;
      }
      
      renderLineChart();
    }
  },
  lineChangePointHeight: function(data) {
    const { day, yPosition, yScale, isPreview, isFinalUpdate } = data;
    const point = lineData.find(d => d.day === day);
    
    if (point && yPosition !== undefined && yScale) {
      
      let newHeight = yScale.invert(yPosition);
      
      
      newHeight = Math.max(0, Math.round(newHeight));
      
      
      if (isPreview && !point._originalHeight) {
        point._originalHeight = point.height;
      }
      
      if (isPreview) {
        
        point.height = newHeight;
      } else if (isFinalUpdate) {
        
        delete point._originalHeight;
      } else {
        
        point.height = newHeight;
      }
      
      renderLineChart();
    }
  },
  lineChangeStart: function(data) {
    
    const { day } = data;
    const point = lineData.find(d => d.day === day);
    
    if (point) {
      
      point._changeStartHeight = point.height;
    }
  },
  lineChangeEnd: function(data) {
    
    const { day, yPosition, yScale } = data;
    const point = lineData.find(d => d.day === day);
    
    if (point && yPosition !== undefined && yScale && point._changeStartHeight !== undefined) {
      
      let newHeight = yScale.invert(yPosition);
      
      
      newHeight = Math.max(0, Math.round(newHeight));
      
      
      point.height = newHeight;
      
      
      delete point._changeStartHeight;
      
      renderLineChart();
    }
  },
  lineAddLine: function(data) {
    const { day, initialValue } = data;
    if (!lineData.some(d => d.day === day)) {
      lineData.push({ day: day, height: Math.round(initialValue) });
      renderLineChart();
    }
  },
  lineRemoveLine: function(data) {
    const { day } = data;
    const index = lineData.findIndex(d => d.day === day);
    if (index !== -1) { lineData.splice(index, 1); renderLineChart(); }
  }
};

/**************************************************
 * Line Chart Rendering
 **************************************************/

function renderLineChart() {
  clearChart();
  const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", 750)  // Increased width to accommodate legend
    .attr("height", 500);
  
  svg.append("rect")
    .attr("class", "chart-bg")
    .attr("x", 40)
    .attr("y", 20)
    .attr("width", 600 - 80)
    .attr("height", 500 - 60)
    .attr("fill", "#f9f9f9")
    .lower();
    const xScale = d3.scaleLinear()
    .domain([d3.min(lineData, d => d.day) || 0, (d3.max(lineData, d => d.day) || 10) + 1])
    .range([40, 600 - 40]);
  
  const yScale = d3.scaleLinear()
    .domain([0, (d3.max(lineData, d => d.height) || 20) + 1])
    .range([500 - 40, 20]);
  
  const lineGenerator = d3.line()
    .x(d => xScale(d.day))
    .y(d => yScale(d.height));
  
  
  svg.append("path")
    .datum(lineData)
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr("stroke", pastelColors[0])
    .attr("stroke-width", 3)
    .each(function() {
      addHammerEvents(this, {}, "line");
    });
  
  
  const points = svg.selectAll("g.point")
    .data(lineData)
    .enter()
    .append("g")
    .attr("class", "point-group");
  
  
  points.append("circle")
    .attr("class", "point-interaction")
    .attr("cx", d => xScale(d.day))
    .attr("cy", d => yScale(d.height))
    .attr("r", 15) 
    .attr("fill", "transparent") 
    .attr("stroke", "rgba(0,0,0,0.1)")
    .attr("stroke-width", 1)
    .each(function(d) {
      addHammerEvents(this, { day: d.day, amount: 1, yScale: yScale }, "point");
    });
  
  
  points.append("circle")
    .attr("class", "point pointer-events-none")
    .attr("cx", d => xScale(d.day))
    .attr("cy", d => yScale(d.height))
    .attr("r", 5) 
    .attr("fill", pastelColors[1])
    .attr("stroke", borderColors[1])
    .attr("stroke-width", 2);
  
  
  points.append("text")
    .attr("class", "point-label pointer-events-none")
    .attr("x", d => xScale(d.day))
    .attr("y", d => yScale(d.height) - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text(d => Math.round(d.height));
  
  
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d')) 
    .ticks(lineData.length);
    
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('d')) 
    .ticks(5);
    
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${500 - 40})`)
    .call(xAxis);
    
  svg.append("text")
    .attr("class", "axis-label pointer-events-none")
    .attr("x", 600/2)
    .attr("y", 500 - 5)
    .attr("text-anchor", "middle")
    .text("Day");
  
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(40,0)`)
    .call(yAxis);
    
  svg.append("text")
    .attr("class", "axis-label pointer-events-none")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Plant Height (cm)");
  
  svg.selectAll(".chart-bg")
    .each(function() {
      
      addHammerEvents(this, { yScale: yScale }, "outsideLines");
    });
    
  
  svg.select(".chart-bg").on("click", function(event) {
    const coords = d3.pointer(event);
    const eventX = coords[0];
    const eventY = coords[1];
    // triggerFunction("outsideLines", "tap", { eventX: eventX, eventY: eventY, yScale: yScale });
  });
}

export { lineData, functionsMapLine, renderLineChart };
