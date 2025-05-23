import { addHammerEvents, clearChart, pastelColors, borderColors } from './app.js';

/**************************************************
 * Pie Chart Data
 **************************************************/


let pieData = [
  { task: "Protein", value: 200 },
  { task: "Carbs", value: 300 },
  { task: "Fats", value: 100 },
  { task: "Veggies", value: 150 }
];

/**************************************************
 * Pie Chart Functions
 **************************************************/

const functionsMapPie = {
  pieAddToSection: function(data) {
    const { task, amount, isPreview } = data;
    const slice = pieData.find(d => d.task === task);
    
    if (slice) {
      
      if (isPreview && !slice._originalValue) {
        slice._originalValue = slice.value;
      }
      
      if (isPreview) {
        
        slice.value = slice._originalValue + Math.round(amount);
      } else {
        
        slice.value += Math.round(amount);
        delete slice._originalValue;
      }
      
      renderPieChart();
    }
  },
  pieRemoveFromSection: function(data) {
    const { task, amount, isPreview } = data;
    const slice = pieData.find(d => d.task === task);
    
    if (slice) {
      
      if (isPreview && !slice._originalValue) {
        slice._originalValue = slice.value;
      }
      
      if (isPreview) {
        
        slice.value = Math.max(0, slice._originalValue - Math.round(amount));
      } else {
        
        slice.value = Math.max(0, slice.value - Math.round(amount));
        delete slice._originalValue;      }
      
      renderPieChart();
    }  },  pieChangeSection: function(data) {
    const { task, deltaY, distance, isPreview, isFinalUpdate } = data;
    const slice = pieData.find(d => d.task === task);
    
    if (slice) {
      
      if (deltaY !== undefined && distance !== undefined) {
        
        if (isPreview && !slice._originalValue) {
          slice._originalValue = slice.value;
        }
        
        
        
        const direction = deltaY < 0 ? 1 : -1;
        const changeAmount = Math.round(distance / 5); 
        const newValue = slice._originalValue + (changeAmount * direction);
        
        
        if (isPreview) {
          slice.value = Math.max(0, newValue);
        } else if (isFinalUpdate) {
          delete slice._originalValue;
        } else {
          slice.value = Math.max(0, newValue);
          delete slice._originalValue;
        }
        
        renderPieChart();
      }
    }
  },pieAddSection: function(data) {
    
    const sectionName = prompt("Enter name for new section:", "New Section");
    
    
    if (sectionName) {
      
      pieData.push({ task: sectionName, value: 1 });
      renderPieChart();
    }
  },
  pieRemoveSection: function(data) {
    const { task } = data;
    const index = pieData.findIndex(d => d.task === task);
    if (index !== -1) { pieData.splice(index, 1); renderPieChart(); }
  }
};

/**************************************************
 * Pie Chart Rendering
 **************************************************/

function renderPieChart() {
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
  
    const radius = Math.min(600, 500) / 2 - 25;
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null); 
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  
  const labelArc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.5);
  
  
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  
  const arcs = svg.selectAll("g.slice")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "slice")
    .attr("transform", `translate(${600/2},${500/2})`);
  
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => pastelColors[i % pastelColors.length])
    .attr("stroke", (d, i) => borderColors[i % borderColors.length])    .attr("stroke-width", 2)
    .attr("data-task", d => d.data.task)
    .each(function(d) {
      
      
      addHammerEvents(this, { task: d.data.task }, "sectionArea");
    });
  
  
  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .attr("class", "pointer-events-none") 
    .text(d => {
      const percent = Math.round((d.data.value / total) * 100);
      return `${Math.round(d.data.value)} (${percent}%)`;
    });
  
  
  const legend = svg.append("g")
    .attr("transform", "translate(10,30)");
  pieData.forEach((d, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", pastelColors[i % pastelColors.length]);
    g.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .attr("class", "pointer-events-none") 
      .text(d.task);
  });
  
  svg.selectAll(".chart-bg")
    .each(function() {
      addHammerEvents(this, {}, "outsideSections");
    });
}

export { pieData, functionsMapPie, renderPieChart };
