import { addHammerEvents, clearChart, pastelColors, borderColors } from './app.js';

/**************************************************
 * Bar Chart Data
 **************************************************/


let barData = [
  { subject: "Fantasy", time: 12 },
  { subject: "Mystery", time: 8 },
  { subject: "Sci-Fi", time: 15 },
  { subject: "Non-fiction", time: 10 }
];

/**************************************************
 * Bar Chart Functions
 **************************************************/

const functionsMapBar = {
  barAddToBar: function(data) {
    const { subject, amount, isPreview, isFinalUpdate } = data;
    const bar = barData.find(d => d.subject === subject);
    
    if (bar) {
      
      if (isPreview && !bar._originalValue) {
        bar._originalValue = bar.time;
      }
      
      if (isPreview) {
        
        bar.time = bar._originalValue + Math.round(amount);
      } else if (isFinalUpdate) {
        
        delete bar._originalValue;
      } else {
        
        bar.time += Math.round(amount);
      }
      
      renderBarChart();
    }
  },
  barRemoveFromBar: function(data) {
    const { subject, amount, isPreview, isFinalUpdate } = data;
    const bar = barData.find(d => d.subject === subject);
    
    if (bar) {
      
      if (isPreview && !bar._originalValue) {
        bar._originalValue = bar.time;
      }
      
      if (isPreview) {
        
        bar.time = Math.max(0, bar._originalValue - Math.round(amount));
      } else if (isFinalUpdate) {
        
        delete bar._originalValue;
      } else {
        
        bar.time = Math.max(0, bar.time - Math.round(amount));
      }
      
      renderBarChart();
    }
  },
  barChangeBar: function(data) {
    const { subject, yPosition, yScale, isPreview } = data;
    console.log("barChangeBar", subject, yPosition, yScale, isPreview);
    console.log("barData", data);
    const bar = barData.find(d => d.subject === subject);
    
    if (bar && yPosition !== undefined && yScale) {
      
      let newHeight = yScale.invert(yPosition);
      console.log("newHeight", yPosition, newHeight);
      
      
      newHeight = Math.max(0, Math.round(newHeight));
      
      
      if (isPreview && !bar._originalValue) {
        bar._originalValue = bar.time;
        console.log("Storing original value:", bar._originalValue); 
      }
      
      if (isPreview) {
        
        bar.time = newHeight;
      } else {
        
        bar.time = newHeight;
        delete bar._originalValue;
      }
      
      renderBarChart();
    }
  },
  barChangeStart: function(data) {
    
    const { subject } = data;
    const bar = barData.find(d => d.subject === subject);
    
    if (bar) {
      
      bar._changeStartValue = bar.time;
    }
  },
  barChangeEnd: function(data) {
    
    const { subject, yPosition, yScale } = data;
    const bar = barData.find(d => d.subject === subject);
    
    if (bar && yPosition !== undefined && yScale && bar._changeStartValue !== undefined) {
      
      let newHeight = yScale.invert(yPosition);
      
      
      newHeight = Math.max(0, Math.round(newHeight));
      
      
      bar.time = newHeight;
      
      
      delete bar._changeStartValue;
      
      renderBarChart();
    }
  },  barAddBar: function(data) {
    
    const barName = prompt("Enter name for new bar:", "New Category");
    
    
    if (barName) {
      
      barData.push({ subject: barName, time: 1 });
      renderBarChart();
    }
  },
  barRemoveBar: function(data) {
    const { subject } = data;
    const index = barData.findIndex(d => d.subject === subject);
    if (index !== -1) { barData.splice(index, 1); renderBarChart(); }
  },
  barMergeBars: function(data) {
    alert("mergeBars called  implement merge logic.");
  },
  barReorderBar: function(data) {
    alert("reorderBar called  implement reorder logic.");
  }
};

/**************************************************
 * Bar Chart Rendering
 **************************************************/

function renderBarChart() {
  clearChart();
  const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", 750)  
    .attr("height", 500)
    .attr("border", "20px solid black");
  
  
  svg.append("rect")
    .attr("class", "chart-bg")
    .attr("x", 40)
    .attr("y", 20)
    .attr("width", 600 - 80)
    .attr("height", 500 - 60)
    .attr("fill", "#f9f9f9")
    .lower();
    const xScale = d3.scaleBand()
    .domain(barData.map(d => d.subject))
    .range([40, 600 - 80]) 
    .padding(0.1);
    const yScale = d3.scaleLinear()
    .domain([0, (d3.max(barData, d => d.time) || 20) + 1])
    .range([500 - 40, 20]);
  
  
  const groups = svg.selectAll(".bar-group")
    .data(barData, d => d.subject)
    .enter()
    .append("g")
    .attr("class", "bar-group");
  
  groups.append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.subject))
    .attr("y", d => yScale(d.time))
    .attr("width", xScale.bandwidth())
    .attr("height", d => 500 - 40 - yScale(d.time))
    .attr("fill", (d, i) => pastelColors[i % pastelColors.length])
    .attr("stroke", (d, i) => borderColors[i % borderColors.length])
    .attr("stroke-width", 2)
    .attr("data-subject", d => d.subject)
    .each(function(d) {
      addHammerEvents(this, { subject: d.subject, amount: 1, yScale: yScale }, "barArea");
    });
  
  
  groups.append("text")
    .attr("class", "bar-label pointer-events-none")
    .attr("x", d => xScale(d.subject) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.time) - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text(d => Math.round(d.time));
  
  groups.each(function(d) {
    const g = d3.select(this);
    const x = xScale(d.subject);
    const y = yScale(d.time);
    const barWidth = xScale.bandwidth();
    
    
    g.append("rect")
      .attr("class", "handle top")
      .attr("x", x)
      .attr("y", y - 20) 
      .attr("width", barWidth)
      .attr("height", 25) 
      .attr("fill", "transparent") 
      .each(function() {
        addHammerEvents(this, { subject: d.subject, amount: 1, yScale: yScale }, "barTopEdge");
      });
  });
  
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('d')) 
    .ticks(5);
    
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${500 - 40})`)
    .call(d3.axisBottom(xScale));
  
  svg.append("text")
    .attr("class", "axis-label pointer-events-none")
    .attr("x", 600/2)
    .attr("y", 500 - 5)
    .attr("text-anchor", "middle")
    .text("Genre");
  
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
    .text("Number Read");
  
  
  svg.selectAll(".chart-bg")
    .each(function() {
      addHammerEvents(this, {}, "outsideBars");
    });
}

export { barData, functionsMapBar, renderBarChart };
