//"use strict";
// Strict mode breaks Dojo inheritance which we use for pie charts.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DojoSimple
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/superdom", "floria/textutil", "floria/date", "floria/dojoSimple", "dijit/dijit", "dojo/dom", "dojo/dom-construct"]
     , function(SuperDOM, TextUtil, FloriaDate, dojoSimple, dojoDijit, dojoDom, domConstruct)
    {
      

// var StandardChartTheme = "dojox/charting/themes/Shrooms";
var StandardChartTheme = "floria/charttheme";
  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple TimeSeriesChart
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.TimeSeriesChart = function(Id, TooltipFunc)
  {
    this.min = '3000.01.01_00.00.00';
    this.max = '1000.01.01_00.00.00';
    this.minv = Number.MAX_VALUE;
    this.maxv = Number.MIN_VALUE;
    this.margin = 0;
    this.hours = 0;
    this.id = Id;
    this.tooltipFunc = TooltipFunc;
    this.chart = dojoDijit.byId(Id);
    if (this.chart != null)
      this.chart.destroy();
    var lthis = this;
    require([
    // Require the basic chart class
    "dojox/charting/Chart",

    // Require the theme of our choosing
    StandardChartTheme,

    // We want to plot Lines
    "dojox/charting/plot2d/Lines",
    // Load the Legend, Tooltip, and Magnify classes
    "dojox/charting/widget/SelectableLegend", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Magnify",
    // We want to use Markers
    "dojox/charting/plot2d/Markers",
    // We'll use default x/y axes
    "dojox/charting/axis2d/Default"], function(Chart, Theme, Lines, Legend, Tooltip, Magnify)
      {
        // Create the chart within it's "holding" node
        lthis.chart = new Chart(Id);
        // Set the theme
        lthis.chart.setTheme(Theme);
        // Add the only/default plot
        lthis.chart.addPlot("default", {
          type : Lines,
          markers : true,
          stroke : {
            width : 1
          },
          tension : 2
        });
        // Create the tooltip
        var tip = new Tooltip(lthis.chart);
        // Create the magnifier
        var mag = new Magnify(lthis.chart);
        lthis.legend = Legend;
      });
    this.series = [];
  };

dojoSimple.TimeSeriesChart.prototype.addLegend = function(Horizontal, Outline)
  {
    this.legendPaint = {
      horizontal : Horizontal,
      outline : Outline
    };
  };

dojoSimple.TimeSeriesChart.prototype.addSeries = function(Name, Values)
  {
    for (var i = 0; i < Values.length; ++i)
      {
        var d = Values[i][0];
        if (d < this.min)
          this.min = d;
        if (d > this.max)
          this.max = d;
        var v = Values[i][1];
        if (v < this.minv)
          this.minv = v;
        if (v > this.maxv)
          this.maxv = v;
      }
    this.first = FloriaDate.parseDateTime(this.min).roundDownHour();
    this.last = FloriaDate.parseDateTime(this.max).roundDownHour().addHours(1);
    this.hours = FloriaDate.parseDateTime(this.max).getHoursSince(FloriaDate.parseDateTime(this.min)) + 1;
    this.amplitude = this.maxv - this.minv;

    this.labels = [];
    var h = FloriaDate.parseDateTime(this.min).roundDownHour(); // Make a copy
                                                                // again to
    for (var i = 0; i < this.hours + Math.round(this.hours * 0.1); ++i)
      {
        this.labels.push({
          value : i,
          text : this.hours > 1000 ? h.printShort(false) : h.printShort(true)
        });
        h.addHours(1);
      }
    this.series.push({
      name : Name,
      values : Values
    });
  };
dojoSimple.TimeSeriesChart.prototype.mapDate = function(DateTime)
  {
    return (FloriaDate.parseDateTime(DateTime).getTime() - this.first.getTime()) / (1000 * 60 * 60.0);
  };
dojoSimple.TimeSeriesChart.prototype.mapSeries = function(Values)
  {
    var Vals = [];
    for (var i = 0; i < Values.length; ++i)
      {
        var v = Values[i];
        Vals.push({
          x : this.mapDate(v[0]),
          y : v[1],
          tooltip : this.tooltipFunc == null ? null : this.tooltipFunc(v[0], v[1])
        });
      }
    return Vals;
  };
dojoSimple.TimeSeriesChart.prototype.draw = function()
  {
    var HourMargin = this.hours * (this.hours < 1000 ? 0.025 : this.hours < 5000 ? 0.020 : this.hours < 10000 ? 0.015 : 0.010);
    var AmplitudeMargin = this.amplitude * (this.amplitude < 10 ? 0.025 : this.amplitude < 100 ? 0.020 : this.amplitude < 1000 ? 0.015 : 0.010);

    this.chart.addAxis("x", {
      min : 0 - HourMargin,
      max : this.hours + HourMargin,
      labels : this.labels,
      rotation : -60,
      majorLabels : true,
      majorTicks : true,
      majorTick : {
        length : 10
      },
      minorLabels : false,
      minorTicks : true,
      minorTick : {
        length : 5
      },
      majorTickStep : this.hours <= 100 ? 5 : this.hours <= 500 ? 20 : this.hours <= 1000 ? 50 : Math.round(this.hours / 20),
      minorTickStep : this.hours <= 100 ? 1 : this.hours <= 500 ? 5 : this.hours <= 1000 ? 10 : Math.round(this.hours / 80)
    });
    this.chart.addAxis("y", {
      vertical : true,
      min : this.minv - AmplitudeMargin,
      max : this.maxv + AmplitudeMargin
    });
    for (var i = 0; i < this.series.length; ++i)
      {
        var s = this.series[i];
        this.chart.addSeries(s.name, this.mapSeries(s.values), {
          marker : "m-2,-2 l0,3 3,0 0,-3 z"
        });
      }
    this.chart.render();

    if (this.legendPaint != null)
      new this.legend({
        chart : this.chart,
        outline : this.legendPaint.outline,
        horizontal : this.legendPaint.horizontal
      }, this.id + "_LEGEND");
  };

  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple BasicChart
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var chartList = [];
function addChart(Id, Chart)
 {
   var i = chartList.indexOfSE(Id, "id");
   if (i == -1)
    return chartList.push({id: Id, c: Chart});
   SuperDOM.alertThrow("Trying to add a Chart with an Id '"+Id+"' that already has been registered.")
 }
  
dojoSimple.BasicChart = function(Id)
 {
   var that = this;
   require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", StandardChartTheme],
     function(Chart, Default, Theme)
       {
         dojoSimple.BasicChart.destroy(Id);
         that._chart = new Chart(Id);
         addChart(Id, that._chart);
         that._chart.setTheme(Theme);
         that._chart._actions = [];
       });  
 };
dojoSimple.BasicChart.destroy = function(Id)
 {
   var i = chartList.indexOfSE(Id, "id");
   if (i == -1)
    return;
   var c = chartList[i].c;
   chartList.remove(i);
   if (c._actions != null)
    for (var i = 0; i < c._actions.length; ++i)
     c._actions[i].destroy();
   c.destroy();
   for (var i = 0; i < 5; ++i)
    {
      var e = SuperDOM.getElement("dijit__MasterTooltip_"+i);
      if (e == null)
       break;
      e.parentNode.removeChild(e);
    }
 }

dojoSimple.BasicChart.prototype.setXAxis = function(title, labelFunc, minorTicks, minorLabels, majorTickStep)
 {
   var that = this;
   require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", StandardChartTheme], function() {
    if(minorTicks != null && minorLabels != null){
      that._chart.addAxis("x", {title:title, rotation : -30, titleOrientation:"away", majorTickStep: majorTickStep, minorTicks: minorTicks, minorLabels: minorLabels, labelFunc: labelFunc, font: "normal 12pt Tahoma"});
    } else{
      that._chart.addAxis("x", {title:title, rotation : -30, titleOrientation:"away", minorTicks: true, minorLabels: true, labelFunc: labelFunc, font: "normal 12pt Tahoma"});
    }
   });
 };
dojoSimple.BasicChart.prototype.setYAxis = function(title, labelFunc, min, max, majorTickStep)
 {
  var that = this;
  require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", StandardChartTheme], function() {
    var params = {title:title, vertical: true, minorTicks: true, minorLabels: true, labelFunc: labelFunc, font: "normal 12pt Tahoma"}
    if (min != null) params.min = min;
    if (max != null) params.max = max;
    if (majorTickStep != null) params.majorTickStep = majorTickStep;
    that._chart.addAxis("y", params);
   });
 };
dojoSimple.BasicChart.prototype.addIndicatorPlot = function(title, vertical, color, value, front)
 {
   var that = this;
   require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", StandardChartTheme, "dojox/charting/plot2d/Indicator"], 
     function(Chart, Default, Theme, Indicator) {
       that._chart.addPlot(title, { type: Indicator,
                                    vertical: vertical,
                                    lineStroke: { color: color },
                                    labels: "none",
                                    values: value
                                  });
       if (front == true)
        that._chart.movePlotToFront(title);
   });
 }
/*
 * Indicator Plot
 * 
 * The indicator plot type will draw horizontal or vertical lines on the chart
 * at a given position. Optionally a label as well as markers can also be drawn
 * on the indicator line. These indicators are typically used as threshold
 * indicators showing the data displayed by the chart are reaching particular
 * threshold values.
 * 
 * To display a horizontal threshold dashed line at data coordinate 15 on the
 * vertical axis you can do the following:
 * 
 * require(["dojox/charting/plot2d/Indicator", ...], function(Indicator, ...){
 * chart.addPlot("threshold", { type: Indicator, vertical: false, lineStroke: {
 * color: "red", style: "ShortDash"}, stroke: null, outline: null, fill: null,
 * offset: { y: -7, x: -10 }, values: 15}); });
 * 
 * The offset property allows to adjust the position of the label with respect
 * to its default position (that is the end of the threshold line). To hide the
 * label, set the labels property to “none”:
 * 
 * require(["dojox/charting/plot2d/Indicator", ...], function(Indicator, ...){
 * chart.addPlot("threshold", { type: Indicator, vertical: false, lineStroke: {
 * color: "red", style: "ShortDash"}, labels: "none", values: 15}); });
 * 
 * If you want to display markers on the indicator line you can specify a series
 * for the indicator which will contain the marker coordinates. In the following
 * example a vertical indicator is rendered data coordinate 15 on the horizontal
 * axis and on the threshold line markers are rendered at coordinates 8, 17 and
 * 30 along the vertical axis.
 * 
 * require(["dojox/charting/plot2d/Indicator", "dojox/charting/Series", ...],
 * function(Indicator, Series, ...){ chart.addPlot("threshold", { type:
 * Indicator, lineStroke: { color: "red", style: "ShortDash"}, labels: "none",
 * values: 15}); chart.addSeries("markers", [ 8, 17, 30 ], { plot: "threshold"
 * }); });
 * 
 */ 


function addTooltip(chart, plotName, tooltips)
 {
   require(["dojox/charting/action2d/Tooltip"], function(Tooltip) {
     if (tooltips == true)
      chart._actions.push(new Tooltip(chart, plotName));
     else if (SuperDOM.isFunction(tooltips) == true)
      chart._actions.push(new Tooltip(chart, plotName, { text: tooltips }));
   });
 }

dojoSimple.BasicChart.prototype.addLinePlot = function(labelFunc, markers, strokeWidth, tension, tooltips)
 {
   if (this._linePlot == true)
    SuperDOM.alertThrow("A line plot has already been created for this chart");
   var that = this;
   require(["dojox/charting/plot2d/Lines", "dojox/charting/action2d/Tooltip"], function(LineChart, Tooltip) {
      that._linePlot == true;
      that._chart.addPlot("PlotLine", {type: LineChart, markers: markers, stroke: { width: strokeWidth }, tension: tension, labelStyle: 'outside', labelOffset: 5, labels: labelFunc!=null, labelFunc: labelFunc });
      addTooltip(that._chart, "PlotLine", tooltips);
      that._chart.movePlotToFront("PlotLine");
      
// var chart1 = new Chart("simplechart");
// chart1.addPlot("default", {type: Lines, markers:true, styleFunc:
// function(item {
// if(item <= 2){
// return { fill : "red" };
// }else if(item > 3){
// return { fill: "green" };
// }
// return {};
// }});
    });
 };
dojoSimple.BasicChart.prototype.addLineSeries = function(name, data, overrideColor)
 {
   var that = this;
   require(["dojox/charting/plot2d/Lines", "dojox/charting/action2d/Tooltip"], function() {
     that._chart.addSeries(name, data, {plot:"PlotLine", color: overrideColor });
   });
 };
 
 dojoSimple.BasicChart.prototype.addLineClickHandler = function(handlerFunc, highlight, magnify)
 {
   var that = this;
   require(["dojox/charting/plot2d/Lines", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Magnify"],
     function(Plot, Highlight, Tooltip, Magnify) {
       if (that._linePlot == true)
        SuperDOM.alertThrow("Trying to add a line series when a line plot hasn't been created yet");
       if (highlight == true)
        that._chart._actions.push(new Highlight(that._chart, "PlotLine"));     
       if (magnify == true)
        that._chart._actions.push(new Magnify(that._chart, "PlotLine"));
       that._chart.connectToPlot("PlotLine", function(evt) {
           if(evt.type == "onclick")
            handlerFunc(evt.index, evt.run.data[evt.index], evt.run.name);
         });
   });
 }
 
dojoSimple.BasicChart.prototype.addScatterPlot = function(labelFunc, tooltips)
 {
   if (this._scatterPlot == true)
    SuperDOM.alertThrow("A scatter plot has already been created for this chart");
   var that = this;
   require(["dojox/charting/plot2d/Scatter", "dojox/charting/action2d/Tooltip"], function(ScatterChart, Tooltip) {
      that._scatterPlot == true;
      that._chart.addPlot("PlotScatter", {type: ScatterChart, labels: labelFunc!=null, labelFunc: labelFunc});
      addTooltip(that._chart, "PlotScatter", tooltips);
    });
 };
dojoSimple.BasicChart.prototype.addScatterSeries = function(name, data, samplingPercentWindow)
 {
   var that = this;
   require(["dojox/charting/plot2d/Scatter", "dojox/charting/action2d/Tooltip"], function() {
     if (that._scatterPlot == true)
       SuperDOM.alertThrow("Trying to add a scatter series when a scatter plot hasn't been created yet");
     if (samplingPercentWindow != null)
       {
         var min = Number.MAX_VALUE;
         var max = Number.MIN_VALUE;
         for (var i = 0; i < data.length; ++i)
          {
            var v = data[i].y;
            if (min > v)
             min = v;
            if (max < v)
             max = v;
          }
         var rangeX = samplingPercentWindow*(data.length)/100;
         var rangeY = samplingPercentWindow*(max-min)/100;
         
         var newData = [];
         var lastX = -100000;
         var lastY = 0;
         for (var i = 0; i < data.length; ++i)
          {
            var d = data[i];
            if (i-lastX > rangeX || Math.abs(d.y-lastY) > rangeY)
              {
                lastX = i;
                lastY = d.y;
                newData.push(d);
              }
          }
         console.log("Simplified Scatter data series from "+data.length+" points to "+newData.length+".");
         data = newData;
       }
     that._chart.addSeries(name, data, {plot:"PlotScatter", markers: false, stroke: {width: 1, color: "grey"} });
   });
 };

dojoSimple.BasicChart.prototype.addScatterClickHandler = function(handlerFunc, highlight, magnify)
 {
   var that = this;
   require(["dojox/charting/plot2d/Scatter", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Magnify"], 
     function(ScatterPlot, Highlight, Tooltip, Magnify) {
       if (that._scatterPlot == true)
        SuperDOM.alertThrow("Trying to add a scatter series when a scatter plot hasn't been created yet");
       if (highlight == true)
        that._chart._actions.push(new Highlight(that._chart, "PlotScatter"));     
       if (magnify == true)
        that._chart._actions.push(new Magnify(that._chart, "PlotScatter"));
       that._chart.connectToPlot("PlotScatter", function(evt) {
            if(evt.type == "onclick")
             handlerFunc(evt.index, evt.run.data[evt.index], evt.run.name);
         });
   });
 }
/*
 * dojoSimple.BasicChart.prototype.addBarPlot = function(labelFunc, tooltips,
 * gap) { if (this._barPlot == true) SuperDOM.alertThrow("A bar plot has already
 * been created for this chart"); var that = this;
 * require(["dojox/charting/plot2d/ClusteredColumns",
 * "dojox/charting/action2d/Tooltip"], function(BarChart, Tooltip) {
 * that._barPlot == true; if (labelFunc != null) that._chart.addPlot("PlotBar",
 * {type: BarChart, gap: gap==null?5:gap, labels: true, labelStyle: 'outside',
 * labelOffset: 5, labelFunc: labelFunc }) else that._chart.addPlot("PlotBar",
 * {type: BarChart, gap: gap==null?5:gap }) addTooltip(that._chart, "PlotBar",
 * tooltips); }); };
 */

dojoSimple.BasicChart.prototype.addBarPlot = function(labelFunc, tooltips, gap, horizontal)
 {
   if (this._barPlot == true)
    SuperDOM.alertThrow("A bar plot has already been created for this chart");
   var that = this;
   if(horizontal){
    require(["dojox/charting/plot2d/Bars", "dojox/charting/action2d/Tooltip" ], function(BarChart, Tooltip) {
       that._barPlot == true;
       if (labelFunc != null)
        that._chart.addPlot( "PlotBar", {type: BarChart, gap: gap==null?5:gap, labels: true , labelStyle: 'outside', minBarSize: 3, labelOffset: 20, precision: 0, labelFunc: labelFunc , hAxis: "y", vAxis: "x"})
       else
        that._chart.addPlot( "PlotBar", {type: BarChart, gap: gap==null?5:gap, labels: true , labelStyle: 'columns', minBarSize: 3, labelOffset: 5, hAxis: "y", vAxis: "x",})
       if (tooltips == true)
        new Tooltip(that._chart, "PlotBar");
     });
   }else {
    require(["dojox/charting/plot2d/ClusteredColumns", "dojox/charting/action2d/Tooltip"], function(BarChart, Tooltip) {
       that._barPlot == true;
       if (labelFunc != null)
        that._chart.addPlot("PlotBar", {type: BarChart, gap: gap==null?5:gap, labels: true, labelStyle: 'outside', labelOffset: 5, labelFunc: labelFunc })
       else
        that._chart.addPlot("PlotBar", {type: BarChart, gap: gap==null?5:gap })
       addTooltip(that._chart, "PlotBar", tooltips);
     });
   }
 };
 
 dojoSimple.BasicChart.prototype.addBarSeries = function(name, data)
 {
   var that = this;
   require(["dojox/charting/plot2d/ClusteredColumns", "dojox/charting/action2d/Tooltip"], function() {
     that._chart.addSeries(name, data, {plot:"PlotBar"});
   });
 };
 
 dojoSimple.BasicChart.prototype.addBarClickHandler = function(handlerFunc, highlight, magnify)
 {
   var that = this;
   require(["dojox/charting/plot2d/ClusteredColumns", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Magnify"],
     function(Plot, Highlight, Tooltip, Magnify) {
       if (that._barPlot == true)
        SuperDOM.alertThrow("Trying to add a bar series when a bar plot hasn't been created yet");
       if (highlight == true)
        that._chart._actions.push(new Highlight(that._chart, "PlotBar"));     
       if (magnify == true)
        that._chart._actions.push(new Magnify(that._chart, "PlotBar"));
       that._chart.connectToPlot("PlotBar", function(evt) {
           if(evt.type == "onclick")
            handlerFunc(evt.index, evt.run.data[evt.index], evt.run.name);
         });
   });
 }

 dojoSimple.BasicChart.prototype.draw = function()
 {
  var that = this;
  require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", StandardChartTheme, "dojox/charting/plot2d/Indicator"], function() {
     that._chart.render();
   });
 }
 
 dojoSimple.BasicChart.prototype.legend = function(legendId, horizontal ){
     var that = this;
     require([ "dojox/charting/Chart", 
              "dojox/charting/axis2d/Default",
              "dojox/charting/action2d/Highlight",
              "dojox/charting/action2d/MoveSlice" , 
              "dojox/charting/action2d/Tooltip",
              "dojox/charting/widget/Legend",
              StandardChartTheme
      ], function(Chart, Default, Highlight, MoveSlice, Tooltip, Legend, Theme) {
     var legend = dijit.byId(legendId); 
      if (legend) { 
         legend.destroyRecursive(true); 
      } 
      
     legend = new Legend({chart: that._chart, horizontal:  horizontal == null ? true : horizontal }, legendId);
     
    });
}


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple PieChart
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.PieChart = function(Id, isDonut, chartTitle, chartTitlePos, tooltips) {
  var that = this;
  require([ "dojo/_base/declare",
            "dojox/charting/Chart", 
            "dojox/charting/axis2d/Default",
            "dojox/charting/action2d/Highlight",
            "dojox/charting/action2d/MoveSlice" , 
            "dojox/charting/action2d/Tooltip",
            "dojox/charting/widget/Legend",
            StandardChartTheme,
            "dojox/charting/plot2d/Pie"
      ], function(Declare, Chart, Default, Highlight, MoveSlice, Tooltip, Legend, Theme, Pie) {
              var ChartType;

              var e = SuperDOM.getElement(Id);
              var h = chartTitle == null ? e.offsetHeight : e.offsetHeight-70;
              var baseWwidth = e.offsetWidth > h ? Math.min(e.offsetWidth*0.5, h) // margins
                                                                                  // on
                                                                                  // each
                                                                                  // sides
                                                                                  // for
                                                                                  // labels
                                                 : Math.min(e.offsetWidth, h)*0.5
                                                 ;
              var radius = baseWwidth/2; // (width * diameter/100)/2
// alert("baseWwidth= "+baseWwidth+"; e.offsetWidth: "+e.offsetWidth+";
// e.offsetHeight: "+e.offsetHeight+"; radius: "+radius+";");
              
              if(isDonut == true)
               {
                 var ChartType = Declare(Pie, {
                        render: function (dim, offsets) {
                            // Call the Pie's render method
                            this.inherited(arguments);

                            // Draw a white circle in the middle
                            var rx = (dim.width - offsets.l - offsets.r) / 2;
                            var ry = (dim.height - offsets.t - offsets.b) / 2;
                            var circle = {cx: offsets.l + rx, cy: offsets.t + ry, r: radius*0.75 };
                            this.group.createCircle(circle).setFill("#fff").setStroke("gray");
                        }
                    });
               } 
              else
               {
                 ChartType = Pie;
               }
              that._chart = new Chart(Id, chartTitle == null ? null : { title: chartTitle, titlePos: chartTitlePos==null?"top":chartTitlePos, titleGap: 5, titleFont: "italic normal normal 11pt Tahoma", });
              that._chart.setTheme(Theme);
              that._chart.addPlot("default", { type: ChartType, radius: radius, labels: true, font: "normal 8pt Tahoma", fontColor: "black", stroke:"gray", labelWiring: "#FEBE22", labelStyle: "columns" });
              new MoveSlice(that._chart, "default");
              new Highlight(that._chart, "default");
              if (tooltips != false)
               new Tooltip(that._chart, "default");
      });
  };
  
  dojoSimple.PieChart.prototype.addSeries = function(title, data)
   {
     this._chart.addSeries(title, data);
   };
  
  dojoSimple.PieChart.prototype.addClickHandler = function(handlerFunc)
    {
      var that = this;
      require(["dojo/_base/declare",
               "dojox/charting/Chart", 
               "dojox/charting/axis2d/Default",
               "dojox/charting/action2d/Highlight",
               "dojox/charting/action2d/MoveSlice" , 
               "dojox/charting/action2d/Tooltip",
               "dojox/charting/widget/Legend",
               StandardChartTheme,
               "dojox/charting/plot2d/Pie"], function() {
        that._chart.connectToPlot("default", function(evt) {
          if(evt.type == "onclick")
           handlerFunc(evt.index, evt.run.data[evt.index], evt.run.name);
        });
      });
    }
  
        
  dojoSimple.PieChart.prototype.draw = function(legendId) {
    var that = this;
    require([ "dojox/charting/Chart", 
              "dojox/charting/axis2d/Default",
              "dojox/charting/action2d/Highlight",
              "dojox/charting/action2d/MoveSlice" , 
              "dojox/charting/action2d/Tooltip",
              "dojox/charting/widget/Legend",
              StandardChartTheme,
              "dojox/charting/plot2d/Pie"
        ], function(Chart, Default, Highlight, MoveSlice, Tooltip, Legend, Theme, ChartType) {
      that._chart.render();
      if (legendId != null)
       new Legend({chart: that._chart}, legendId);
    });
};

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple SpiderChart
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    dojoSimple.SpiderChart = function(Id) {
      var that = this;
      require([ "dojox/charting/Chart", 
                "dojox/charting/axis2d/Default", 
                StandardChartTheme,
                "dojox/charting/plot2d/Spider"
          ], function(Chart, Default, Theme, Spider) {
        that._chart = new Chart(Id);
        that._chart.addPlot("default", {
            type: Spider,
            labelOffset: -10,
          // divisions: 2,//params.divisions,
            seriesFillAlpha: 0.2,
            markerSize: 3,
            precision: 0,
            spiderType: "polygon"
          });
      });
    };
    
    dojoSimple.SpiderChart.prototype.addSeries = function(title, data, fill) {
      this._chart.addSeries(title, {  data : data}, fill);
    };
          
    dojoSimple.SpiderChart.prototype.draw = function() {
      this._chart.render();
    };

 return dojoSimple;

});


