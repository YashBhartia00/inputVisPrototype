/**************************************************
 * Global Variables and Gesture Options
 **************************************************/


const allGestures = ["tap", "double tap", "hold", "pan", "pinch in", "pinch out", "swipe left", "swipe right"];


let currentChartType = "bar";


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
    functions: ["heatmapAddTime", "heatmapRemoveTime", "heatmapAddColumn", "heatmapRemoveColumns", "heatmapMergeColumns", "heatmapChangeTime"],
    parts: ["cell", "outsideCells"]
  },
  scatterplot: {
    functions: ["scatterAddPoint", "scatterRemovePoint", "scatterAddCategoryColor", "scatterRemoveCategoryColor", "scatterChangePointLoc", "scatterChangePointColor"],
    parts: ["point", "outsidePoints"]
  }
};


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


const borderColors = [
  '#80b0c6', 
  '#d88aa7', 
  '#95c780', 
  '#d9c060', 
  '#b3a0d9', 
  '#d9a764', 
  '#df9699', 
  '#8dc1c5'  
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


function loadChartData() {
  const savedData = localStorage.getItem('inputviz_chart_data');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    
    
    if (parsedData.bar && parsedData.bar.length > 0) {
      
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
      
      
      chartConfig[currentChartType].parts.forEach(part => {
        updateColumnSelects(part);
      });
    }
  }
}


function resetAllData() {
  if (confirm("This will reset all chart data and gesture assignments to defaults. Continue?")) {
    localStorage.removeItem('inputviz_chart_data');
    localStorage.removeItem('inputviz_gesture_assignments');
    
    
    resetChartData();
    
    
    renderCurrentChart();
    
    
    createDropdownMatrix();
    
    alert("All data has been reset to defaults.");
  }
}


function resetChartData() {
  
  barData.length = 0;
  [
    { subject: "Fantasy", time: 12 },
    { subject: "Mystery", time: 8 },
    { subject: "Sci-Fi", time: 15 },
    { subject: "Non-fiction", time: 10 }
  ].forEach(item => barData.push(item));
  
  
  pieData.length = 0;
  [
    { task: "snacks", value: 2 },
    { task: "homemade", value: 3 },
    { task: "fruit", value: 1 },
    { task: "outside", value: 5 }
  ].forEach(item => pieData.push(item));
  
  
  lineData.length = 0;
  [
    { day: 1, height: 10 },
    { day: 2, height: 12 },
    { day: 3, height: 15 },
    { day: 4, height: 18 },
    { day: 5, height: 20 }
  ].forEach(item => lineData.push(item));
  
  
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
  
  
  scatterData.length = 0;
  [
    { x: 2, y: 15, category: "Food" },
    { x: 4, y: 30, category: "Utilities" },
    { x: 3, y: 20, category: "Entertainment" }
  ].forEach(item => scatterData.push(item));
}

/**************************************************
 * Dropdown Matrix – With Unique Gesture Per Part
 **************************************************/

function createDropdownMatrix() {
  const config = chartConfig[currentChartType];
  const container = d3.select("#dropdown-matrix-container");
  container.html(""); 

  
  container.append("h3").text("Gesture Assignments");

  const table = container.append("table").attr("class", "dropdown-matrix");
  const thead = table.append("thead").append("tr");
  thead.append("th").text(""); 

  
  config.parts.forEach(part => {
    thead.append("th").text(part);
  });

  
  const tbody = table.append("tbody");
  config.functions.forEach(fnName => {
    const row = tbody.append("tr");
    row.append("th").text(fnName);
    config.parts.forEach(part => {
      const cell = row.append("td");
      
      const select = cell.append("select")
        .attr("name", `${fnName}-${part}`);
      
      select.append("option").attr("value", "select").text("select");
      
      allGestures.forEach(gesture => {
        select.append("option").attr("value", gesture).text(gesture);
      });
      
      select.on("change", function() {
        updateColumnSelects(part);
        saveGestureAssignments(); 
      });
      
      
      const savedValue = getSavedGestureAssignment(fnName, part);
      if (savedValue && savedValue !== "select") {
        select.node().value = savedValue;
      }
    });
  });
  
  chartConfig[currentChartType].parts.forEach(part => {
    updateColumnSelects(part);
  });
}


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
    
    if (d3.select(select).select(`option[value="${current}"]`).empty()) {
      select.value = "select";
    } else {
      select.value = current;
    }
  });
}


function getSelectedGesture(fnName, part) {
  const sel = d3.select(`select[name="${fnName}-${part}"]`).node();
  return sel ? sel.value : "select";
}

/**************************************************
 * Generic Trigger Function for Touch Events
 **************************************************/

function triggerFunction(part, eventType, data) {
  
  const config = chartConfig[currentChartType];
  config.functions.forEach(fnName => {
    const assignedGesture = getSelectedGesture(fnName, part);
    if (assignedGesture === "select") return;
    if (assignedGesture === eventType) {
      if (functionsMap[fnName]) {
        functionsMap[fnName](data);
        
        saveChartData();
      }
    }
  });
}

/**************************************************
 * Hammer Helper – Initialize Recognizers with
 * recognizeWith and requireFailure, plus pan/pinch etc.
 **************************************************/


const interactionState = {};

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
  
  
  const elementId = Math.random().toString(36).substring(2, 15);
  
  
  function getChartCoordinates(ev) {
    const chartContainer = document.getElementById("chart-container");
    const chartRect = chartContainer.getBoundingClientRect();
    return {
      eventX: ev.center.x - chartRect.left,
      eventY: ev.center.y - chartRect.top
    };
  }
  
  manager.on("tap", function(ev) {
    
    const coords = getChartCoordinates(ev);
    
    triggerFunction(part, "tap", { ...data, ...coords });
  });
  
  manager.on("doubletap", function(ev) {
    const coords = getChartCoordinates(ev);
    triggerFunction(part, "double tap", { ...data, ...coords });
  });
  
  manager.on("press", function(ev) {
    const coords = getChartCoordinates(ev);
    triggerFunction(part, "hold", { ...data, ...coords });
  });
  
  
  manager.on("panstart", function(ev) {
    
    interactionState[elementId] = {
      startX: ev.center.x,
      startY: ev.center.y,
      startData: {...data},
      lastUpdateDelta: 0  
    };
  });
  
  manager.on("pan", function(ev) {
  if (interactionState[elementId]) {
    const chartContainer = document.getElementById("chart-container");
    const chartRect = chartContainer.getBoundingClientRect();

    
    const deltaX = ev.center.x - interactionState[elementId].startX;
    const deltaY = ev.center.y - interactionState[elementId].startY;

    const chartX = ev.center.x - chartRect.left; 
    const chartY = ev.center.y - chartRect.top;  

    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var direction = deltaY > 0 ? 1 : -1; 
    if(deltaY < 30) direction = deltaX > 0 ? -1 : 1; 
    const amount = Math.round(distance / 10) * direction; 

    
    if (amount !== interactionState[elementId].lastUpdateDelta) {
      
      const updatedData = {
        ...interactionState[elementId].startData,
        deltaX,
        deltaY,
        amount: amount,
        distance,
        isPreview: true,  
        eventX: chartX,   
        eventY: chartY,   
        yPosition: chartY 
      };

      
      triggerFunction(part, "pan", updatedData);

      
      interactionState[elementId].lastUpdateDelta = amount;
      }
    }
  });
  
  manager.on("panend", function(ev) {
    if (interactionState[elementId]) {
    const chartContainer = document.getElementById("chart-container");
    const chartRect = chartContainer.getBoundingClientRect();

    
    const deltaX = ev.center.x - interactionState[elementId].startX;
    const deltaY = ev.center.y - interactionState[elementId].startY;

    const chartX = ev.center.x - chartRect.left; 
    const chartY = ev.center.y - chartRect.top;  

    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const direction = deltaY > 0 ? 1 : -1; 
    const amount = Math.round(distance / 10) * direction; 

    
    const updatedData = {
      ...interactionState[elementId].startData,
      deltaX,
      deltaY,
      amount: amount,
      distance,
      isPreview: false,  
      isFinalUpdate: true, 
      eventX: chartX,   
      eventY: chartY,   
      yPosition: chartY 
    };

    
    triggerFunction(part, "pan", updatedData);
    
    
    delete interactionState[elementId];
    }
  });
  
  
  manager.on("pinchstart", function(ev) {
    const coords = getChartCoordinates(ev);
    interactionState[elementId] = {
      startScale: ev.scale,
      startData: {...data, ...coords},
      lastUpdateScale: 0
    };
  });
  
  manager.on("pinch", function(ev) {
    if (interactionState[elementId]) {
      const coords = getChartCoordinates(ev);
      const scaleChange = ev.scale - interactionState[elementId].startScale;
      const scaleFactor = Math.abs(scaleChange) * 10; 
      const amount = Math.round(scaleFactor) * (scaleChange > 0 ? 1 : -1);
      
      
      if (Math.abs(amount - interactionState[elementId].lastUpdateScale) >= 1) {
        
        const updatedData = {
          ...interactionState[elementId].startData, 
          ...coords,
          scaleChange,
          amount: amount,
          isPreview: true  
        };
        
        
        if (ev.scale < 1) {
          triggerFunction(part, "pinch in", updatedData);
        } else if (ev.scale > 1) {
          triggerFunction(part, "pinch out", updatedData);
        } else {
          triggerFunction(part, "pinch", updatedData);
        }
        
        
        interactionState[elementId].lastUpdateScale = amount;
      }
    }
  });
  
  manager.on("pinchend", function(ev) {
    if (interactionState[elementId]) {
      const coords = getChartCoordinates(ev);
      const scaleChange = ev.scale - interactionState[elementId].startScale;
      const scaleFactor = Math.abs(scaleChange) * 10; 
      
      
      const updatedData = {
        ...interactionState[elementId].startData, 
        ...coords,
        scaleChange,
        amount: Math.round(scaleFactor) * (scaleChange > 0 ? 1 : -1),
        isPreview: false, 
        isFinalUpdate: true 
      };
      
      
      if (ev.scale < 1) {
        triggerFunction(part, "pinch in", updatedData);
      } else if (ev.scale > 1) {
        triggerFunction(part, "pinch out", updatedData);
      } else {
        triggerFunction(part, "pinch", updatedData);
      }
      
      
      delete interactionState[elementId];
    }
  });
  
  manager.on("swipe", function(ev) {
    const coords = getChartCoordinates(ev);
    if (ev.direction === Hammer.DIRECTION_LEFT) {
      triggerFunction(part, "swipe left", { ...data, ...coords });
    } else if (ev.direction === Hammer.DIRECTION_RIGHT) {
      triggerFunction(part, "swipe right", { ...data, ...coords });
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
  
  d3.select("body").selectAll(".layout-container").remove();
  
  
  const content = d3.select("body")
    .append("div")
    .attr("class", "layout-container");
  
  
  content.append("div")
    .attr("id", "chart-container")
    .attr("class", "chart-area");
  
  
  
  
  
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


initializeLayout();
createDropdownMatrix();
renderBarChart();