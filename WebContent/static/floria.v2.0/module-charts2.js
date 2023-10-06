"use strict";

import { FloriaDOM  } from "./module-dom.js";
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
   FloriaDOM.addCSS(this._containerDivId, "chart-container");
   document.getElementById(containerDivId).innerHTML = '<CANVAS id="'+this._containerDivId+'_CNVS" style=""></CANVAS>';
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
