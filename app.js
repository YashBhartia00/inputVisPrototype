/**************************************************
 * Global Variables and Gesture Options
 **************************************************/

// All available gestures
const allGestures = ["tap", "double tap", "hold", "pan", "pinch in", "pinch out", "swipe left", "swipe right"];

// Global chart type (default: bar)
let currentChartType = "bar";

// Chart configuration per your explanation
const chartConfig = {
  bar: {
    functions: ["barAddToBar", "barRemoveFromBar", "barChangeBar", "barAddBar", "barRemoveBar", "barMergeBars", "barReorderBar"],
    parts: ["barArea", "barTopEdge", "outsideBars"]
  },
  pie: {
    functions: ["pieAddToSection", "pieRemoveFromSection", "pieChangeSection", "pieAddSection", "pieRemoveSection"],
    parts: ["sectionArea", "outsideSections"]
  },
  line: {
    functions: ["lineAddPoint", "lineRemovePoint", "lineAddPointHeight", "lineRemovePointHeight", "lineChangePointHeight", "lineAddLine", "lineRemoveLine"],
    parts: ["point", "line", "outsideLines"]
  },
  heatmap: {
    functions: ["heatmapAddTime", "heatmapRemoveTime", "heatmapAddColumn", "heatmapRemoveColumns", "heatmapMergeColumns"],
    parts: ["cell", "outsideCells"]
  },
  scatterplot: {
    functions: ["scatterAddPoint", "scatterRemovePoint", "scatterAddCategoryColor", "scatterRemoveCategoryColor", "scatterChangePointLoc", "scatterChangePointColor"],
    parts: ["point", "outsidePoints"]
  }
};

// Default color schemes (pastel colors)
const pastelColors = [
  'var(--pastel-blue)', 
  'var(--pastel-red)', 
  'var(--pastel-green)', 
  'var(--pastel-yellow)', 
  'var(--pastel-purple)', 
  'var(--pastel-orange)', 
  'var(--pastel-pink)', 
  'var(--pastel-teal)'
];

// Darker border colors for pastel colors
const borderColors = [
  '#80b0c6', // darker blue
  '#d88aa7', // darker red
  '#95c780', // darker green
  '#d9c060', // darker yellow
  '#b3a0d9', // darker purple
  '#d9a764', // darker orange
  '#df9699', // darker pink
  '#8dc1c5'  // darker teal
];

/**************************************************
 * Import Chart Modules
 **************************************************/
import { barData, functionsMapBar, renderBarChart } from './barChart.js';
import { pieData, functionsMapPie, renderPieChart } from './pieChart.js';
import { lineData, functionsMapLine, renderLineChart } from './lineChart.js';
import { heatmapData, functionsMapHeatmap, renderHeatmap } from './heatmapChart.js';
import { scatterData, functionsMapScatter, renderScatterplot } from './scatterplotChart.js';

/**************************************************
 * Local Storage Functions for Data Persistence
 **************************************************/

// Save current chart data to localStorage
function saveChartData() {
  const dataToSave = {
    bar: barData,
    pie: pieData,
    line: lineData,
    heatmap: heatmapData,
    scatterplot: scatterData
  };
  
  localStorage.setItem('inputviz_chart_data', JSON.stringify(dataToSave));
}

// Load chart data from localStorage
function loadChartData() {
  const savedData = localStorage.getItem('inputviz_chart_data');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    
    // Only overwrite if there's actual data
    if (parsedData.bar && parsedData.bar.length > 0) {
      // Clear existing arrays and copy saved data
      barData.length = 0;
      parsedData.bar.forEach(item => barData.push(item));
    }
    
    if (parsedData.pie && parsedData.pie.length > 0) {
      pieData.length = 0;
      parsedData.pie.forEach(item => pieData.push(item));
    }
    
    if (parsedData.line && parsedData.line.length > 0) {
      lineData.length = 0;
      parsedData.line.forEach(item => lineData.push(item));
    }
    
    if (parsedData.heatmap && parsedData.heatmap.length > 0) {
      heatmapData.length = 0;
      parsedData.heatmap.forEach(row => heatmapData.push(row));
    }
    
    if (parsedData.scatterplot && parsedData.scatterplot.length > 0) {
      scatterData.length = 0;
      parsedData.scatterplot.forEach(item => scatterData.push(item));
    }
  }
}

// Save gesture assignments to localStorage
function saveGestureAssignments() {
  const assignments = {};
  
  Object.keys(chartConfig).forEach(chartType => {
    assignments[chartType] = {};
    
    chartConfig[chartType].functions.forEach(fnName => {
      chartConfig[chartType].parts.forEach(part => {
        const key = `${fnName}-${part}`;
        const select = d3.select(`select[name="${key}"]`).node();
        if (select && select.value !== "select") {
          if (!assignments[chartType][fnName]) {
            assignments[chartType][fnName] = {};
          }
          assignments[chartType][fnName][part] = select.value;
        }
      });
    });
  });
  
  localStorage.setItem('inputviz_gesture_assignments', JSON.stringify(assignments));
}

// Get saved gesture assignment
function getSavedGestureAssignment(fnName, part) {
  const saved = localStorage.getItem('inputviz_gesture_assignments');
  if (saved) {
    const assignments = JSON.parse(saved);
    if (assignments[currentChartType] && 
        assignments[currentChartType][fnName] && 
        assignments[currentChartType][fnName][part]) {
      return assignments[currentChartType][fnName][part];
    }
  }
  return null;
}

// Load gesture assignments from localStorage
function loadGestureAssignments() {
  const saved = localStorage.getItem('inputviz_gesture_assignments');
  if (saved) {
    const assignments = JSON.parse(saved);
    
    if (assignments[currentChartType]) {
      Object.keys(assignments[currentChartType]).forEach(fnName => {
        Object.keys(assignments[currentChartType][fnName]).forEach(part => {
          const value = assignments[currentChartType][fnName][part];
          const select = d3.select(`select[name="${fnName}-${part}"]`).node();
          if (select) {
            select.value = value;
          }
        });
      });
      
      // Update column selects after loading
      chartConfig[currentChartType].parts.forEach(part => {
        updateColumnSelects(part);
      });
    }
  }
}

// Reset all data to defaults
function resetAllData() {
  if (confirm("This will reset all chart data and gesture assignments to defaults. Continue?")) {
    localStorage.removeItem('inputviz_chart_data');
    localStorage.removeItem('inputviz_gesture_assignments');
    
    // Reset to default datasets
    resetChartData();
    
    // Redraw the current chart
    renderCurrentChart();
    
    // Reset all dropdowns
    createDropdownMatrix();
    
    alert("All data has been reset to defaults.");
  }
}

// Reset chart data to defaults
function resetChartData() {
  // Bar Chart - reset to defaults
  barData.length = 0;
  [
    { subject: "Fantasy", time: 12 },
    { subject: "Mystery", time: 8 },
    { subject: "Sci-Fi", time: 15 },
    { subject: "Non-fiction", time: 10 }
  ].forEach(item => barData.push(item));
  
  // Pie Chart - reset to defaults
  pieData.length = 0;
  [
    { task: "Protein", value: 200 },
    { task: "Carbs", value: 300 },
    { task: "Fats", value: 100 },
    { task: "Veggies", value: 150 }
  ].forEach(item => pieData.push(item));
  
  // Line Chart - reset to defaults
  lineData.length = 0;
  [
    { day: 1, height: 10 },
    { day: 2, height: 12 },
    { day: 3, height: 15 },
    { day: 4, height: 18 },
    { day: 5, height: 20 }
  ].forEach(item => lineData.push(item));
  
  // Heatmap - reset to defaults
  heatmapData.length = 0;
  [
    [30, 45, 20, 15],
    [25, 50, 35, 10],
    [40, 30, 20, 10],
    [20, 40, 25, 15],
    [30, 35, 20, 15],
    [25, 45, 30, 10],
    [20, 30, 25, 15]
  ].forEach(row => heatmapData.push(row));
  
  // Scatterplot - reset to defaults
  scatterData.length = 0;
  [
    { x: 100, y: 150, category: "Food" },
    { x: 200, y: 300, category: "Utilities" },
    { x: 300, y: 200, category: "Entertainment" }
  ].forEach(item => scatterData.push(item));
}

/**************************************************
 * Dropdown Matrix – With Unique Gesture Per Part
 **************************************************/

function createDropdownMatrix() {
  const config = chartConfig[currentChartType];
  const container = d3.select("#dropdown-matrix-container");
  container.html(""); // Clear previous matrix

  // Add title for the matrix
  container.append("h3").text("Gesture Assignments");

  const table = container.append("table").attr("class", "dropdown-matrix");
  const thead = table.append("thead").append("tr");
  thead.append("th").text(""); // Top-left empty cell

  // Create column headers (one for each interactive part)
  config.parts.forEach(part => {
    thead.append("th").text(part);
  });

  // Create one row for each function
  const tbody = table.append("tbody");
  config.functions.forEach(fnName => {
    const row = tbody.append("tr");
    row.append("th").text(fnName);
    config.parts.forEach(part => {
      const cell = row.append("td");
      // Create select with a name attribute for identification.
      const select = cell.append("select")
        .attr("name", `${fnName}-${part}`);
      // Add a default "select" option.
      select.append("option").attr("value", "select").text("select");
      // Then add gesture options.
      allGestures.forEach(gesture => {
        select.append("option").attr("value", gesture).text(gesture);
      });
      // When changed, update all dropdowns for that part.
      select.on("change", function() {
        updateColumnSelects(part);
        saveGestureAssignments(); // Save when changed
      });
      
      // Load previously saved assignments if they exist
      const savedValue = getSavedGestureAssignment(fnName, part);
      if (savedValue && savedValue !== "select") {
        select.node().value = savedValue;
      }
    });
  });
  // Enforce uniqueness per column.
  chartConfig[currentChartType].parts.forEach(part => {
    updateColumnSelects(part);
  });
}

// Updates dropdowns for a given interactive part so that each gesture is only available once.
function updateColumnSelects(part) {
  const selects = d3.selectAll(`select[name$="-${part}"]`).nodes();
  selects.forEach(select => {
    const current = select.value;
    const otherSelected = selects.filter(s => s !== select)
                                 .map(s => s.value)
                                 .filter(v => v !== "select");
    d3.select(select).selectAll("option").remove();
    d3.select(select).append("option").attr("value", "select").text("select");
    allGestures.forEach(gesture => {
      if (gesture === current || otherSelected.indexOf(gesture) === -1) {
        d3.select(select)
          .append("option")
          .attr("value", gesture)
          .text(gesture);
      }
    });
    // Restore current value if available.
    if (d3.select(select).select(`option[value="${current}"]`).empty()) {
      select.value = "select";
    } else {
      select.value = current;
    }
  });
}

// Get the selected gesture for a given function and part.
function getSelectedGesture(fnName, part) {
  const sel = d3.select(`select[name="${fnName}-${part}"]`).node();
  return sel ? sel.value : "select";
}

/**************************************************
 * Generic Trigger Function for Touch Events
 **************************************************/

function triggerFunction(part, eventType, data) {
  // Do not trigger anything if the dropdown is still "select".
  const config = chartConfig[currentChartType];
  config.functions.forEach(fnName => {
    const assignedGesture = getSelectedGesture(fnName, part);
    if (assignedGesture === "select") return;
    if (assignedGesture === eventType) {
      if (functionsMap[fnName]) {
        functionsMap[fnName](data);
        // After any data change, save to localStorage
        saveChartData();
      }
    }
  });
}

/**************************************************
 * Hammer Helper – Initialize Recognizers with
 * recognizeWith and requireFailure, plus pan/pinch etc.
 **************************************************/

function addHammerEvents(element, data, part) {
  const manager = new Hammer.Manager(element);
  const tap = new Hammer.Tap({ event: 'tap', taps: 1 });
  const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
  const press = new Hammer.Press({ event: 'press' });
  const pan = new Hammer.Pan({ event: 'pan', threshold: 0 });
  const pinch = new Hammer.Pinch({ event: 'pinch' });
  const swipe = new Hammer.Swipe({ event: 'swipe' });
  
  manager.add([doubleTap, tap, press, pan, pinch, swipe]);
  doubleTap.recognizeWith(tap);
  tap.requireFailure(doubleTap);
  
  manager.on("tap", function(ev) {
    triggerFunction(part, "tap", data);
  });
  manager.on("doubletap", function(ev) {
    triggerFunction(part, "double tap", data);
  });
  manager.on("press", function(ev) {
    triggerFunction(part, "hold", data);
  });
  manager.on("pan", function(ev) {
    triggerFunction(part, "pan", data);
  });
  manager.on("pinch", function(ev) {
    if(ev.scale < 1) {
      triggerFunction(part, "pinch in", data);
    } else if(ev.scale > 1) {
      triggerFunction(part, "pinch out", data);
    }
  });
  manager.on("swipe", function(ev) {
    if(ev.direction === Hammer.DIRECTION_LEFT) {
      triggerFunction(part, "swipe left", data);
    } else if(ev.direction === Hammer.DIRECTION_RIGHT) {
      triggerFunction(part, "swipe right", data);
    }
  });
  return manager;
}

/**************************************************
 * Functions Map – Combined from all chart modules
 **************************************************/

const functionsMap = {
  ...functionsMapBar,
  ...functionsMapPie,
  ...functionsMapLine,
  ...functionsMapHeatmap,
  ...functionsMapScatter
};

/**************************************************
 * Utility: Clear Chart Container
 **************************************************/

function clearChart() {
  d3.select("#chart-container").selectAll("*").remove();
}

/**************************************************
 * Modal Functionality
 **************************************************/

function initModalHandlers() {
  // Open modal on settings button click
  const settingsBtn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  const closeModal = document.querySelector('.close-modal');
  const saveBtn = document.getElementById('save-settings-btn');
  const resetBtn = document.getElementById('reset-data-btn');
  
  settingsBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    createDropdownMatrix();
    loadGestureAssignments();
  });
  
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  saveBtn.addEventListener('click', () => {
    saveGestureAssignments();
    modal.style.display = 'none';
    alert('Settings saved!');
  });
  
  resetBtn.addEventListener('click', resetAllData);
  
  // Close modal if clicking outside of modal content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**************************************************
 * Render Current Chart
 **************************************************/

function renderCurrentChart() {
  switch(currentChartType) {
    case 'bar':
      renderBarChart();
      break;
    case 'pie':
      renderPieChart();
      break;
    case 'line':
      renderLineChart();
      break;
    case 'heatmap':
      renderHeatmap();
      break;
    case 'scatterplot':
      renderScatterplot();
      break;
  }
}

/**************************************************
 * Initialize Layout
 **************************************************/

function initializeLayout() {
  // Clear any existing content first
  d3.select("body").selectAll(".layout-container").remove();
  
  // Create a flex container for side-by-side layout
  const content = d3.select("body")
    .append("div")
    .attr("class", "layout-container");
  
  // Create chart container (LEFT)
  content.append("div")
    .attr("id", "chart-container")
    .attr("class", "chart-area");
  
  // Create dropdown matrix container (RIGHT)
  content.append("div")
    .attr("id", "dropdown-matrix-container")
    .attr("class", "controls-area");
}

/**************************************************
 * Chart Switching – Button Listeners
 **************************************************/

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("bar-chart-btn").addEventListener("click", function() {
    currentChartType = "bar";
    renderBarChart();
  });

  document.getElementById("pie-chart-btn").addEventListener("click", function() {
    currentChartType = "pie";
    renderPieChart();
  });

  document.getElementById("line-chart-btn").addEventListener("click", function() {
    currentChartType = "line";
    renderLineChart();
  });

  document.getElementById("heatmap-btn").addEventListener("click", function() {
    currentChartType = "heatmap";
    renderHeatmap();
  });

  document.getElementById("scatterplot-btn").addEventListener("click", function() {
    currentChartType = "scatterplot";
    renderScatterplot();
  });
  
  // Initialize the app
  loadChartData();
  initModalHandlers();
  renderCurrentChart();
});

/**************************************************
 * Export functions for use in chart modules
 **************************************************/
export { 
  addHammerEvents, 
  clearChart, 
  triggerFunction, 
  pastelColors, 
  borderColors 
};

/**************************************************
 * Initial Render
 **************************************************/

// Initialize layout first
initializeLayout();
createDropdownMatrix();
renderBarChart();