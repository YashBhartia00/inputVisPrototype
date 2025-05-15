import { addHammerEvents, clearChart, pastelColors, borderColors } from './app.js';

/**************************************************
 * Pie Chart Data
 **************************************************/

// Pie Chart: Tracking meal portions by week (in mg)
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
      // Store original value before preview updates
      if (isPreview && !slice._originalValue) {
        slice._originalValue = slice.value;
      }
      
      if (isPreview) {
        // For preview, restore original and add current amount
        slice.value = slice._originalValue + Math.round(amount);
      } else {
        // For final update, add amount and clear stored original
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
      // Store original value before preview updates
      if (isPreview && !slice._originalValue) {
        slice._originalValue = slice.value;
      }
      
      if (isPreview) {
        // For preview, restore original and subtract current amount
        slice.value = Math.max(0, slice._originalValue - Math.round(amount));
      } else {
        // For final update, subtract amount and clear stored original
        slice.value = Math.max(0, slice.value - Math.round(amount));
        delete slice._originalValue;
      }
      
      renderPieChart();
    }
  },
  pieChangeSection: function(data) {
    const { task } = data;
    const slice = pieData.find(d => d.task === task);
    if (slice) {
      const newVal = parseInt(prompt(`Change value for ${task}:`),10);
      if (!isNaN(newVal)) { slice.value = Math.round(newVal); renderPieChart(); }
    }
  },
  pieAddSection: function(data) {
    const { task, initialValue } = data;
    if (!pieData.some(d => d.task === task)) {
      pieData.push({ task: task, value: Math.round(initialValue) });
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
  
  // Add a little more room around the pie chart
  const radius = Math.min(600, 500) / 2 - 25;
  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  // Slightly smaller arc for positioning text
  const labelArc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.5);
  
  // Calculate total for percentages
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
    .attr("stroke", (d, i) => borderColors[i % borderColors.length])
    .attr("stroke-width", 2)
    .attr("data-task", d => d.data.task)
    .each(function(d) {
      addHammerEvents(this, { task: d.data.task, amount: 5 }, "sectionArea");
    });
  
  // Add labels inside each pie section - make them non-interactive with pointer-events-none
  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .attr("class", "pointer-events-none") // Make labels pass through to pie sections
    .text(d => {
      const percent = Math.round((d.data.value / total) * 100);
      return `${Math.round(d.data.value)} (${percent}%)`;
    });
  
  // Legend for pie chart with non-interactive labels
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
      .attr("class", "pointer-events-none") // Make labels pass through
      .text(d.task);
  });
  
  svg.selectAll(".chart-bg")
    .each(function() {
      addHammerEvents(this, {}, "outsideSections");
    });
}

export { pieData, functionsMapPie, renderPieChart };
