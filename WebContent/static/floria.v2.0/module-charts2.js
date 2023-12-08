"use strict";

import { FloriaDOM  } from "./module-dom.js";
import { FloriaText } from "./module-text.js";
import { ChartTheme } from "./module-charttheme.js";

import { Chart, Tooltip , registerables } from "/static/jslibs/chartjs/chart.js";


export var FloriaCharts2 = { ColorSchemes : ChartTheme.colorSchemes };


Chart.register(...registerables);
Tooltip.positioners.cursor = function(chartElements, coordinates) {
   return { x: coordinates.x+(this.xAlign=="left"?12:-12), y: coordinates.y };
 };


FloriaCharts2.chart = function(containerDivId, title, titleFontSize, titleFontWeight, titleFontColor)
 {
   this._containerDivId = containerDivId;
   this._options = {
      responsive: true
     ,maintainAspectRatio: false
     ,plugins: { }
    };
   if (title != null)
    this._options.plugins.title = { display: true, text:title, color:titleFontColor, font: { size: titleFontSize||28, weight: titleFontWeight } }
   this._datasets = [ ];
   
   this.setVerticalBarLine = function(vertical)
     {
       this._options.indexAxis = vertical == true ? 'y' : 'x';
       this._options.interaction = { mode: 'index', axis: this._options.indexAxis };
       return this;
     };
     
    this.setAxisLabels = function(xAxisLabel, yAxisLabel, fontSize, fontWeight, fontColor)
     {
       this._options.scales = {
            x: { title:{ display: true, text:xAxisLabel, color:fontColor, font:{ size: fontSize||16, weight: fontWeight } } }
           ,y: { title:{ display: true, text:yAxisLabel, color:fontColor, font:{ size: fontSize||16, weight: fontWeight } } }
       };
       return this;
     };
     
    this.setLegend = function(display, fontSize)
     {
       this._options.plugins.legend = { display: display, labels: { font: { size: fontSize||18 } } };
       return this;
     };
     
    this.setTooltips = function(titleFontSize, bodyFontSize, footerFontSize)
     {
       this._options.plugins.tooltip = { mode: 'index'
                                       , position: 'cursor'
                                       , boxPadding: 5
                                       , titleFont : { size: titleFontSize ||20 }
                                       , bodyFont  : { size: bodyFontSize  ||(titleFontSize-4)||18  }
                                       , footerFont: { size: footerFontSize||(titleFontSize-8)||14, weight: 'normal'  }
                                       , callbacks: { 
                                           footer: function (context) {
                                              let d = context[0].dataset.dataSrc[context[0].dataIndex]; 
                                              return d.tooltip;
                                           }
                                         }
                                       };
       return this;
     };

    this.addDataset = function(data, label, colorScheme, borderColor)
     {
       this._datasets.push({ label: label
                            ,axis: this._options.indexAxis
                            ,dataSrc: data
                            ,data: data.map(row => row.y)
                            ,borderWidth: 2
                            ,borderColor: borderColor||'rgb(192, 192, 192)'
                            ,backgroundColor: colorScheme||ChartTheme.colorSchemes.ClassicCyclic13
                          });
       return this;
     };
    
    this.draw = function(chartType)
     {
        FloriaDOM.addCSS(this._containerDivId, "chart-container");
        document.getElementById(containerDivId).innerHTML = '<CANVAS id="'+this._containerDivId+'_CNVS" style=""></CANVAS>';
        this._chartType = chartType;

        this._chart = new Chart(document.getElementById(this._containerDivId+'_CNVS'), {
               type: this._chartType
              ,options: this._options
              ,data: {
                  labels: this._datasets[0].dataSrc.map(row => row.x)
                 ,datasets: this._datasets
                }
           });
     };
};


// Define a helper function to recursively build the hierarchical structure
function buildDendroHierarchy(node, sequence)
 {
   if (sequence == null || sequence.length === 0)
    return;

   const element = sequence.shift();
   const child = node.children.find((c) => c.element.value === element.value);

   if (child == null)
    {
      const newChild = { element: element, weight: 1, children: [] };
      node.children.push(newChild);
      buildDendroHierarchy(newChild, sequence);
    } 
   else
    {
      child.weight += 1;
      buildDendroHierarchy(child, sequence);
    }
 }

function parseDendroSequences(sequences)
 {
   // Initialize the root node
   const root = { name: "root", children: [] };

   // Loop through each sequence in the input array
   sequences.forEach((sequence) => {
      buildDendroHierarchy(root, sequence);
   });

   // Return the hierarchical structure (root node's children)
   return root.children[0];
 }



require(["jslibs/d3-7.8.4/d3.min"], function(d3) {

FloriaCharts2.dendrogram = function(containerDivId, nodeClassBase, data, onNodeClickFunc)
 {
   this._containerDivId = containerDivId;
   this._nodeClassBase = nodeClassBase;
   this._data = data;
   this._onNodeClickFunc = onNodeClickFunc;
   this._rootNode = parseDendroSequences(data);
   console.log("this._rootNode: ", this._rootNode);
   
   this.draw = function()
    {
      let div = document.getElementById(this._containerDivId);
      let width = div.offsetWidth;
      let height = div.offsetHeight;

      // Give the data to this cluster layout:
      var root = d3.hierarchy(this._rootNode, function (d) {
        return d.children;
      });

      // Create the cluster layout:
      var cluster = d3.cluster().size([height, width - 100]); // 100 is the margin I will have on the right side
      cluster(root);
      
      // append the svg object to the body of the page
      var svg = d3.select("#"+this._containerDivId)
                  .append("svg")
                  .attr("xmlns", "http://www.w3.org/2000/svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(40,0)") // bit of margin on the left = 40
                  ;
        
      // Add the links between nodes:
      svg.selectAll("path")
         .data(root.descendants().slice(1))
         .enter()
         .append("path")
         .attr("class", this._nodeClassBase+"_path")
         .attr("d", function (d) { return "M" + d.y + "," + d.x
                                          // 50 and 150 are coordinates of inflexion, play with it to change links shape
                                         +"C" + (d.parent.y + 25) + "," + d.x + " "
                                              + (d.parent.y + 50) + "," + d.parent.x + " "
                                              +  d.parent.y +       "," + d.parent.x
                                         ;
                                 })
        .style("stroke-width", function (d) {
            return d.data.weight * 3;
         })
        ;
    
      // Add a node for each node.
      let node = svg.selectAll("g")
         .data(root.descendants())
         .enter()
         .append("g");
      
      node.attr("class", this._nodeClassBase+"_node")
          .attr("transform", function (d) {
             return "translate(" + d.y + "," + d.x + ")";
           })
          .append("circle")
          .append("title") // Add a title element for each circle
          .text(function (d) {
             return FloriaText.isNoE(d.data.element.title) == false ? d.data.element.title 
                  : FloriaText.isNoE(d.data.element.label) == false ? d.data.element.label
                  : null; // d.data.element.value;
           })
          ;
         
      if (this._onNodeClickFunc != null)
       {
         let that = this;
         node.on("click", function(target, nodeElement) {
            that._onNodeClickFunc(nodeElement.data.element);
          })
       }
    
      // Add labels
      svg.selectAll("t")
         .data(root.descendants())
         .enter()
         .append("g")
         .attr("class", this._nodeClassBase+"_label")
         .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
          })
         .append("text")
         .text(function (d) {
            return FloriaText.isNoE(d.data.element.label) == false ? d.data.element.label : d.data.element.value;
          })
         .attr("y", -15)
         ;

    }
 };
 
});

