//"use strict";
// Strict mode breaks Dojo inheritance which we use for pie charts.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DojoSimple
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/superdom", "floria/date", "dijit/dijit", "dojo/dom", "dojo/dom-construct"], function(SuperDOM, FloriaDate, dojoDijit, dojoDom, domConstruct)
    {
      
var dojoSimple = {}; 

dojoSimple.HeaderBodyFooterLayout = function(MainId, initFunc)
 {
   require(["dijit/layout/BorderContainer", "dijit/layout/ContentPane"], function (BorderContainer, ContentPane) {
       try
        {
          var MainContainer   = new BorderContainer({ gutters : false  }, dojoDom.byId(MainId));
          var HeaderContainer = new ContentPane    ({ region : 'top'   }, dojoDom.byId(MainId+"_HEADER"));
          var FooterContainer = new ContentPane    ({ region : 'bottom'}, dojoDom.byId(MainId+"_FOOTER"));
          var ClientContainer = new ContentPane    ({ region : 'center'}, dojoDom.byId(MainId+"_BODY"  ));
          MainContainer.startup();
          if (initFunc != null)
           initFunc();
        }
       catch (e)
        {
          SuperDOM.alertException(e);
        }
    });
   require(["dojox/widget/Dialog","dojo/fx/easing"], function(Dialog, Easing) {});
  }


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.Dialog = function(elementId, enableEsc)
{
  this._elementId = elementId;
  var that = this;
  require(["dojox/widget/Dialog","dojo/fx/easing"], function(Dialog, Easing) {
     that.dlg = dojoDijit.byId(elementId);
     if (that.dlg != null)
      {
        console.warn("DESTROYING DIALOG "+elementId);
        that.dlg.destroy();
      }

     var e = SuperDOM.getElement(elementId);
     if (e == null)
      {
        e = document.createElement('div');
        e.setAttribute("id", elementId);
        document.body.appendChild(e);
      }

     that.dlg = new Dialog({
             title : null,
             showTitle : true,
             closable : true,
             modal : true,
             draggable : false,
             easing : Easing.elasticOut,
             sizeDuration : 200,
             sizeMethod : "combine"
         }, dojoDom.byId(elementId));
     if (enableEsc != true)
      that.dlg._onKey = function() { }
   });
};
dojoSimple.Dialog.prototype.setOnLoad = function(func)
  {
    this.dlg.connect(this.dlg, "load", func);
  };
dojoSimple.Dialog.prototype.setOnHide = function(func)
  {
    this.dlg.connect(this.dlg, "hide", func);
  };

dojoSimple.Dialog.prototype.show = function(Title, Url, WidthPercent, HeightPercent, Contents)
  {
    if (WidthPercent < 0.25)
     WidthPercent = 0.25;
    if (WidthPercent > 1)
      WidthPercent = 1;
    if (HeightPercent < 0.25)
      HeightPercent = 0.25;
    if (HeightPercent > 1)
      HeightPercent = 1;
    var ScreenDim = dojoDijit.getViewport();
    this.dlg.dimensions = [ ScreenDim.w * WidthPercent, ScreenDim.h * HeightPercent ];

    var lthis = this;
    this.dlg.oeFunc = this.dlg.connect(this.dlg, "onDownloadError", function(error)
      { this.disconnect(this.oeFunc);
        if (error.status==401)
         dojoSimple.PopupLogin.show(true, function() { lthis.show(Title, Url, WidthPercent, HeightPercent); });
        else
         alert("Error fetching the page:\n   "+Url+"\n   "+error.status);
      });

    if (Title == null)
      SuperDOM.alertThrow("System error: A dialog is being initialized without a title and/or a URL.");
    this.dlg.set("title", Title);
    if (Url != null)
      this.dlg.set("href", Url);
    else if (Contents != null)
     {
       if (typeof Contents == "string")
        {
          this.dlg.set("content", Contents);
        }
       else
        {
          var contentId = this._elementId+'__CNT__';
          this.dlg.set("content", '<DIV id="'+contentId+'" style="padding: 5px;"></DIV>');
          setTimeout(function() { Contents(contentId); }, 225);
        }
     }
    this.dlg.startup();
    this.dlg.show();
  };
dojoSimple.Dialog.prototype.setContent = function(Str)
  {
    this.dlg.set("content", Str);
  };
dojoSimple.Dialog.prototype.hide = function()
  {
    this.dlg.hide();
  };

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ContentPane
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.ContentPane = function(Id)
  {
    var that = this;
    require(["dijit/layout/BorderContainer", "dijit/layout/ContentPane"],
      function(BorderContainer, ContentPane)
        {
          that.url = null;
          that.pane = new ContentPane({}, Id);
// that.pane = new dojox.layout.ContentPane({}, Id);
        });
  };
dojoSimple.ContentPane.prototype.Load = function(Url, onLoadFunc)
  {
    this.url = Url;
    this.pane.attr("href", Url);
    if (onLoadFunc != null)
     this.pane.olFunc = this.pane.connect(this.pane, "onDownloadEnd", function()
          {
            this.disconnect(this.olFunc);
            OnLoadFunc();
          });
    var lthis = this;
    this.dlg.oeFunc = this.dlg.connect(this.dlg, "onDownloadError", function(error)
      { this.disconnect(this.oeFunc);
        if (error.status==401)
         dojoSimple.PopupLogin.show(true, function() { lthis.show(Title, Url, WidthPercent, HeightPercent); });
        else
         alert("Error fetching the page:\n   "+Url+"\n   "+error.status);
      });
  };
dojoSimple.ContentPane.prototype.setContents = function(Contents)
  {
    this.pane.attr("content", Contents);
  };

  
  
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

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Calendar
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.Calendar = function(containerId, elementId, onValueSelectedFunc, min, datePattern)
  {
    this.elementId = elementId;
    var that = this;
    require(["dojo/parser", "dijit/form/DateTextBox"
        ], function(Parser, Calendar){
           var val = SuperDOM.getElement(elementId, "Cannot find calendar element '"+elementId+"'.").value;
           that.cal = dojoDijit.byId(containerId);
           if (that.cal != null)
             that.cal.destroy();
           that.cal = new Calendar({
                 value: FloriaDate.parseDateTime(val),
                 constraints: {min:min, datePattern : datePattern==null?'yyyy-MMM-dd':datePattern},
                 onChange : function(d) {
                   document.getElementById(elementId).value= d==null?'':d.toISOString();
                 if (onValueSelectedFunc)
                    onValueSelectedFunc(d);
                 }
             }, containerId);
           that.cal.startup();
         });
     this.destroy = function()
      {
        this.cal.destroy();
      }
     this.setValue = function(val)
      {
        if (val == null)
         val = SuperDOM.getElement(elementId, "Cannot find calendar element '"+elementId+"'.").value;
        this.cal.set('value', FloriaDate.parseDateTime(val));
      }
  };

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple PopupLogin
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.PopupLogin = {
  loginUrl  : null,
  logoutUrl : null,
  setUrls : function(basePath, login, logout)
    {
      dojoSimple.PopupLogin.basePath = basePath;
      dojoSimple.PopupLogin.loginUrl = login;
      dojoSimple.PopupLogin.logoutUrl = "/"+basePath+"/"+logout;
      require(["dojo/cookie"], function(Cookie){
          dojoSimple.PopupLogin.dojoCookie = Cookie;
        });
    },
  loggedIn : false,
  dlgHandle: null,
  init: function(elementIdBase)
    {
      var c = this.dojoCookie("REMEMBERME");
      if (c == null)
       return;
      var e = document.getElementById(elementIdBase+"RememberMe");
      if (e != null)
        e.checked = true;
      e = document.getElementById(elementIdBase+"Email");
      if (e != null)
        e.value=c;
      e = document.getElementById(elementIdBase+"Password");
      if (e != null)
       e.focus();
    },
   createPopup : function(onSuccessFunc, errorMessage, title, url, width, height)
    {
      width = width || 0.6;
      height = height || 0.6;
      
      if (url == null)
          SuperDOM.alertThrow(errorMessage);
      if (dojoSimple.PopupLogin.dlgHandle == null)
       dojoSimple.PopupLogin.dlgHandle = new dojoSimple.Dialog("DLG_POPUPLOGIN");
      dojoSimple.PopupLogin.dlgHandle.show(title, url, width, height);
      if (onSuccessFunc != null)
       dojoSimple.PopupLogin.dlgHandle.setOnHide(onSuccessFunc);
    },
  show : function(Timeout, onSuccessFunc)
    {
    this.createPopup(onSuccessFunc, "The default url for the popup Login panel has not been set"
                ,Timeout == true ? "Your session has timed out: please login again" : "Please login"
                ,dojoSimple.PopupLogin.loginUrl);
    },
  signIn : function(elementIdBase)
    {
      var Email = SuperDOM.getElement(elementIdBase+"Email", "Please enter a username and password").value;
      var Pswd = SuperDOM.getElement(elementIdBase+"Password", "Please enter a password").value;

      var e = document.getElementById(elementIdBase+"RememberMe");
      var v = e == null ? false : e.checked;
      this.dojoCookie("REMEMBERME", v==true ? Email:"", { expires : v==true ? 30:-1, path : "/" });
      
      dojoSimple.ajaxUrl("/"+dojoSimple.PopupLogin.basePath+"/svc/Login?email=" + encodeURIComponent(Email) + "&pswd=" + encodeURIComponent(Pswd), "POST", "Cannot login", dojoSimple.PopupLogin.signInOK, dojoSimple.PopupLogin.signInErr);
      return false;
    },
  signInOK : function(data)
    {
      var tenants = data.tenants
      if(tenants != null)
        {
          dojoSimple.PopupLogin.tenantsSelect(data.tenants);
        }
      else
        {
          SuperDOM.setInnerHTML("HEADER_ACCOUNT", '<A href="javascript:dojoSimple.PopupLogin.logout();"><IMG height="50px" src="/static/img/logout.big.png"></A>');
          dojoSimple.PopupLogin.loggedIn = true;
          if (dojoSimple.PopupLogin.dlgHandle != null)
           dojoSimple.PopupLogin.dlgHandle.hide();
        }
    },
  signInErr : function(code, msg, errors)
    {
      if (code == 412)
        {
          dojoSimple.ForgotPswd.show();
          alert("Please reset your password")
        }
    },
  logout : function()
    {
      dojoSimple.ajaxUrl("/"+dojoSimple.PopupLogin.basePath+"/svc/Logout", "GET", "Cannot logout", dojoSimple.PopupLogin.logoutOK, dojoSimple.PopupLogin.logoutErr);
    },
  logoutOK: function(data)
   {
      dojoSimple.PopupLogin.loggedIn = false;
      document.location.href=dojoSimple.PopupLogin.logoutUrl;
   },
  logoutErr: function(data)
   {
      alert("Error logging out!");
   },
  forgotPassword : function()
    {
      alert("Forgot your password");
    },
  createAccount : function()
    {
      alert("Create an account");
    },
  manageAccount : function()
    {
      alert("Manage your account");
    },
  PickTenant: function(TenantId)
    {
      dojoSimple.ajaxUrl("/"+dojoSimple.PopupLogin.basePath+"/svc/Login?tenantUserRefnum=" + TenantId, "POST", "Cannot login", dojoSimple.PopupLogin.signInOK, dojoSimple.PopupLogin.signInErr);
      return false;
    },
  tenantsSelect : function(tenants)
    {
      var popupTitle = "You have successfully logged in and you have access to the following systems. Please select one";
      SuperDOM.setInnerHTML("DLG_POPUPLOGIN_title", popupTitle);
      var child = document.getElementById("loginForm");
      child.parentNode.removeChild(child);
      var html = "<TABLE border=\"0px\" style=\"font-size:125%; color:black; margin: 0px;padding-bottom:8px\">";
      var tds = []
      var i,j,temparray,chunk = 3;
      for(i=0; i<tenants.length;i++)
        {
          var tenant = tenants[i];
          if((i+1) % 3 == 0)
            {
              tds.push("<td style=\"padding: 5px;\"><A href=\"#\" onclick=\"dojoSimple.PopupLogin.PickTenant("+tenant.refnum+");\">"+tenant.name+"</A></td>")
              html = html + "<tr>"+tds.join("")+"</tr>";
              tds = [];
            }
          else
            {
              tds.push("<td style=\"padding: 5px;\"><A href=\"#\" onclick=\"dojoSimple.PopupLogin.PickTenant("+tenant.refnum+");\">"+tenant.name+"</A></td>")
            }
        }
      if(tds.length > 0)
        html = html + "<tr>"+tds.join("")+"</tr>";

      html = html + "</TABLE>";
      SuperDOM.setInnerHTML("selectTenant", html);
    }
}


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple PopupSignup
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.PopupSignup = {
  Token : null,
  Url: null,
  ElementIdBase: null,
  setUrls : function(basePath, Url, Token)
  {
    dojoSimple.PopupSignup.basePath = basePath;
    dojoSimple.PopupSignup.Url = Url;
    dojoSimple.PopupSignup.Token = Token;
  },
  init: function(elementIdBase)
  {
    dojoSimple.PopupSignup.ElementIdBase = elementIdBase;
    this.passwordUI = new dojoSimple.PasswordUI(elementIdBase+"password");
    dojoSimple.PopupSignup.getTokenDetails();
  },
  show: function(onSuccessFunc) 
  {
    dojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Signup has not been set"
        ,"Sign Up"
        ,dojoSimple.PopupSignup.Url);
  },
  getTokenDetails: function() 
  {
    dojoSimple.ajaxUrl("/"+dojoSimple.PopupSignup.basePath+"/svc/user/token?token="+dojoSimple.PopupSignup.Token, "GET", "Failed to fetch details", dojoSimple.PopupSignup.TokenDetailsOK, dojoSimple.PopupSignup.TokenDetailsErr);
  },
  signUp : function(elementIdBase)
  {
    var token = dojoSimple.PopupSignup.Token;
    var Pswd = SuperDOM.getElement(elementIdBase+"password", "Please enter a password").value;
    var confirmPswd = SuperDOM.getElement(elementIdBase+"confirmPassword", "Confirm password").value;
    var phone = SuperDOM.getElement(elementIdBase+"phone", "phone number (Optional)").value;
    if(!this.passwordUI.isValid()){
      return false;
    }
    var params = "password=" + encodeURIComponent(Pswd)+"&token=" + encodeURIComponent(token);
    if(phone != null && phone.length > 0){
      params += "&phone="+encodeURIComponent(phone);
    }
    if(Pswd == confirmPswd){
        dojoSimple.ajaxUrl("/"+dojoSimple.PopupSignup.basePath+"/svc/user/onboarding?"+params, "POST", "Cannot login", dojoSimple.PopupSignup.signUpOK, dojoSimple.PopupSignup.signUpErr);
    }
    else{
      alert("Password and confirm password does not match");
    }
    return false;
  },
  TokenDetailsOK: function(user)
  {
    var elementIdBase = dojoSimple.PopupSignup.ElementIdBase;
// document.getElementById(elementIdBase+"progress").style.display = "none";
// document.getElementById(elementIdBase+"form").style.display = "block";
    document.getElementById(elementIdBase+"email").value = user.email;
    document.getElementById(elementIdBase+"fName").value = user.nameFirst;
    document.getElementById(elementIdBase+"lName").value = user.nameLast;
  },
  TokenDetailsErr: function(code, msg, errors)
  {
    // Hide dialog
    if (dojoSimple.PopupLogin.dlgHandle) dojoSimple.PopupLogin.dlgHandle.hide();
  },
  signUpOK : function(data)
  {
    dojoSimple.PopupLogin.show(false, successLogin);
    alert("Signed up successfully, please login");
  },
  signUpErr : function(data)
  {
    alert("Err: " + SuperDOM.printObject(data));
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Forgot password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.ForgotPswd = {
  Url  : null,
  setUrls : function(basePath, signupUrl)
  { 
    dojoSimple.ForgotPswd.basePath = basePath;
    dojoSimple.ForgotPswd.Url = signupUrl;
  },
  init: function(elementIdBase)
  {
  },
  show : function(onSuccessFunc)
  {
    dojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Forgot password panel has not been set"
                ,"Reset your password"
                ,dojoSimple.ForgotPswd.Url);
  },
  forgot : function(elementIdBase)
  {
    var Email = SuperDOM.getElement(elementIdBase+"Email", "Please enter your registered email id").value;
    if(Email.length > 0){
        dojoSimple.ajaxUrl("/"+dojoSimple.ForgotPswd.basePath+"/svc/user/forgotPswd?email=" + encodeURIComponent(Email), "POST", "Forgot password request failed", dojoSimple.ForgotPswd.OK, dojoSimple.ForgotPswd.Err);
    }
    else{
      alert("Please enter email address");
    }
    return false;
  },
  OK : function(data)
  {
    alert("You should be receiving an email shortly with instructions to reset your password.");
  },
  Err : function(data)
  {
    alert("Err: " + SuperDOM.printObject(data));
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Set password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.SetPassword = {
  Url  : null,
  Token: null,
  passwordUI: null,
  setUrls : function(basePath, signupUrl, token)
  { 
    dojoSimple.SetPassword.basePath = basePath;
    dojoSimple.SetPassword.Token = token;
    dojoSimple.SetPassword.Url = signupUrl;
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new dojoSimple.PasswordUI(elementIdBase+"password");
  },
  show : function(onSuccessFunc)
  {
    dojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Set password password panel has not been set"
            ,"Reset your password"
            ,dojoSimple.SetPassword.Url);

  },
  setPassword : function(elementIdBase)
  {
    var email = SuperDOM.getElement(elementIdBase+"email", "Please enter your registered email id").value;
    var password = SuperDOM.getElement(elementIdBase+"password", "password").value;
    var confirmPswd = SuperDOM.getElement(elementIdBase+"confirmPassword", "confirm password").value;
    var token = dojoSimple.SetPassword.Token;
    if(!this.passwordUI.isValid()){
      return false;
    }
    if(password == confirmPswd){
      dojoSimple.ajaxUrl("/"+dojoSimple.SetPassword.basePath+"/svc/user/setPswd?email=" + encodeURIComponent(email)+"&token="+encodeURIComponent(token)+"&password="+encodeURIComponent(password)
                , "POST", "Forgot password request failed", dojoSimple.SetPassword.OK, dojoSimple.SetPassword.Err);
    }
    else{
      alert("Password and confirm password do not match");
    }
    return false;
  },
  OK : function(data)
  {
    dojoSimple.PopupLogin.show(false, successLogin);
    alert("Password reset was a success, now please login");
  },
  Err : function(data)
  {
    alert("Err: " + SuperDOM.printObject(data));
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Account
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.Account = {
  Url  : null,
  passwordUI: null,
  setUrls : function(basePath, accountUrl, token)
  { 
    dojoSimple.Account.basePath = basePath;
    dojoSimple.Account.Url = accountUrl;
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new dojoSimple.PasswordUI(elementIdBase+"password");
    dojoSimple.Account.fillDetails(elementIdBase);
  },
  show : function(email, title, firstName, lastName, onSuccessFunc)
  {
    dojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Account panel has not been set"
            ,"Account Settings"
            ,dojoSimple.Account.Url, 0.9, 0.9);  
  },
  account : function(elementIdBase)
  {
    var email = SuperDOM.getElement(elementIdBase+"email", "email").value;
    var nameTitle =  SuperDOM.getElement(elementIdBase+"title", "title").value;
    var nameFirst =  SuperDOM.getElement(elementIdBase+"nameFirst", "title").value;
    var nameLast =  SuperDOM.getElement(elementIdBase+"nameLast", "title").value;
    
    var password = SuperDOM.getElement(elementIdBase+"password", "password").value;
    var confirmPswd = SuperDOM.getElement(elementIdBase+"confirmPassword", "confirm password").value;
    var currentPassword = SuperDOM.getElement(elementIdBase+"currentPassword", "confirm password").value;
    if(password.length > 0 && confirmPswd.length > 0 && !this.passwordUI.isValid()){
      return false;
    }
    if(password == confirmPswd){
      params  = "nameTitle="+nameTitle+"&nameLast="+nameLast+"&nameFirst="+nameFirst+"&email="+encodeURIComponent(email);
      params += "&password="+encodeURIComponent(password)+"&currentPassword="+encodeURIComponent(currentPassword); 
      dojoSimple.ajaxUrl("/"+dojoSimple.Account.basePath+"/svc/user/account?"+params , "POST", 
          "Failed to update details", dojoSimple.Account.OK, dojoSimple.Account.Err);
    }
    else{
      alert("Password and confirm password do not match");
    }
    return false;
  },
  fillDetails: function(elementIdBase)
  {
    if (currentUser != null) {
      if (currentUser.person != null && currentUser.person.nameTitle != null)
        document.getElementById(elementIdBase+"title").value = currentUser.person.nameTitle;
      if (currentUser.person != null && currentUser.person.nameFirst != null)
        document.getElementById(elementIdBase+"nameFirst").value = currentUser.person.nameFirst;
      if (currentUser.person != null && currentUser.person.nameLast != null)
        document.getElementById(elementIdBase+"nameLast").value = currentUser.person.nameLast;
      if (currentUser.user != null && currentUser.user.email != null)
        document.getElementById(elementIdBase+"email").value = currentUser.user.email;
    }
  },
  OK : function(data)
  {
    window.location.reload();
  },
  Err : function(data)
  {
    alert("Err: " + SuperDOM.printObject(data));
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Verifications
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.Verifications = {
  token: null,
  reloadPage: function()
  {
    window.location.href = window.homePagePath;
  },
  EmailVerification: function(basePath, token)
  {
    dojoSimple.ajaxUrl("/"+basePath+"/svc/Verifications?action=emailVerification&token="+encodeURIComponent(token), "POST", "Email Verification Failed", dojoSimple.Verifications.OK, dojoSimple.Verifications.Err);
  },
  OK: function(data)
  {
    alert("Successfully Verified")
    dojoSimple.Verifications.reloadPage();
  },
  Err: function(data)
  {
    console.log("Err: " + SuperDOM.printObject(data));
    dojoSimple.Verifications.reloadPage();
  }
}


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxUrl
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.ajaxUrl = function(Url, Method, ErrorMsg, SuccessFunc, ErrorFunc, PostContents)
  {
    if (PostContents != null && Method != 'POST')
     SuperDOM.alertThrow("Error: you cannot post data in a non POST ajax request");
    dojo.xhr(Method, {
      url : Url,
      content: PostContents,
      method : Method,
      errorMsg : ErrorMsg,
      successFunc : SuccessFunc,
      errorFunc : ErrorFunc,
      load : function(data, ioArgs)
        {
          try
            {
              if (data == null)
                throw ("An error occurred: no JSON data for " + this.url);
              if (data.code == undefined)
                throw ("An error occurred: invalid JSON data for " + this.url);
              if (data.code == 401 && Url.indexOf('/svc/Login') == -1)
                {
                  var lthis = this;
                  dojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
                }
              else if (data.code != 200)
                this.error({ code: data.code, message : data.msg, errors: data.errors }, ioArgs);
              else if (this.successFunc != null)
                this.successFunc(data.data);
            }
          catch (e)
            {
              SuperDOM.alertException(e, "Caught exception in dojoSimple.ajaxUrl.load(): ");
            }
        },
      error : function(error, ioArgs)
        {
          try
            {
              if (error != null && error.status == 401 && Url.indexOf('/svc/Login') == -1)
               {
                 var lthis = this;
                 dojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
               }
              else
                {
                  var Str = this.errorMsg;
                  var msg = error == null ? null : error.message != null ? error.message : error.msg;
                  if (msg != null)
                   Str+="\n"+msg;
                  if (error.errors != null && error.errors.length != 0)
                   for (var i = 0; i < error.errors.length; ++i)
                    Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                  if (this.errorMsg != null)
                    alert(Str);
                  if (this.errorFunc != null)
                    this.errorFunc(error.code, msg, error.errors);
                }
            }
          catch (e)
            {
              SuperDOM.alertException(e, "Caught exception in dojoSimple.ajaxUrl.error(): ");
            }
        },
      timeout : 45000,
      handleAs : 'json'
    });
  };
  

dojoSimple.ajaxUrlMulti = function(AjaxInfos, Func)
  {
    var results=[];
    var createNestedFunc = function(ajaxInfo, previousF)
     {
       return function(data) { if (data != null) results.push(data); dojoSimple.ajaxUrl(ajaxInfo.url, "GET", ajaxInfo.error, previousF, previousF); };
     }
    var f = function(data) { if (data != null) results.push(data); Func(results); };
    for (var i = AjaxInfos.length-1; i >= 0; --i)
     f = createNestedFunc(AjaxInfos[i], f);
    setTimeout(f, 1);
  }
  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxForm
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.ajaxForm = function(FormId, ErrorMsg, SuccessFunc, ErrorFunc)
  {
    require(["dojo/io/iframe"], function(dojoIFrame) {
      var f = document.getElementById(FormId);
      var toto = {
        method : "POST",
        form : f,
        url : f.action,
        errorMsg : ErrorMsg,
        successFunc : SuccessFunc,
        errorFunc : ErrorFunc,
        load : function(data, ioArgs)
          {
            try
              {
                if (data == null)
                  throw ("An error occurred: no JSON data from the form" + FormId);
                if (data.code == undefined)
                  throw ("An error occurred: invalid JSON data from the form " + FormId);
                if (data.code == 401 && f.action.indexOf('/svc/Login') == -1)
                  {
                    var lthis = this;
                    dojoSimple.PopupLogin.show(true, function()
                          { 
                            if (f.encoding == "multipart/form-data")
                              dojoIFrame.send(lthis);                            
                            else
                              dojo.xhr(lthis.method, lthis);
                          });
                  }
                else if (data.code != 200)
                  this.error(data, ioArgs);
                else if (this.successFunc != null)
                  this.successFunc(data.data);
              }
            catch (e)
              {
                SuperDOM.alertException(e, "Caught exception in dojoSimple.ajaxForm.load: ");
              }
          },
        error : function(error, ioArgs)
          {
            try
              {
                if (error != null && error.status == 401 && f.action.indexOf('/svc/Login') == -1)
                 {
                    var lthis = this;
                    dojoSimple.PopupLogin.show(true, function()
                        { 
                          if (f.encoding == "multipart/form-data")
                            dojoIFrame.send(lthis);                            
                          else
                            dojo.xhr(lthis.method, lthis);
                        });
                 }
               else
                 {
                    var Str = this.errorMsg;
                    var msg = error == null ? null : error.message != null ? error.message : error.msg;
                    if (msg != null)
                     Str+="\n"+msg;
                    if (error.errors != null && error.errors.length != 0)
                     for (var i = 0; i < error.errors.length; ++i)
                      Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                    if (this.errorMsg != null)
                     alert(Str);
                    if (this.errorFunc != null)
                     this.errorFunc(error.code, msg, error.errors);
                 }
              }
            catch (e)
              {
                SuperDOM.alertException(e, "Caught exception in dojoSimple.ajaxForm.error(): ");
              }
          },
        timeout : 45000,
        handleAs : 'json'
        };
      if (f.encoding == "multipart/form-data")
        dojoIFrame.send(toto);
      else
        dojo.xhr("POST", toto);
    });
  };



// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple URIParameters
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.URIParameters = function()
  {
    var i = window.location.href.indexOf("?");
    this.params = i == -1 ? { } : dojo.queryToObject(p.substring(i + 1, p.length));
  };
dojoSimple.URIParameters.prototype.get = function(name)
  {
    return this.params[name];
  };

  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Editor
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.Editor = function(elementId, h, formId, formElementName)
  {
    this.rte = dojoDijit.byId(elementId);
    if (this.rte != null)
     this.rte.destroy();
    var that = this;
    require(["dijit/Editor", "dijit/_editor/plugins/AlwaysShowToolbar", "dijit/_editor/plugins/LinkDialog", "dojo/domReady!"],
        function(Editor, AlwaysShowToolbar, LinkDialog){
                that.rte = new Editor({
                    height: h,
                    extraPlugins: [AlwaysShowToolbar],
                    plugins : [ 'undo', 'redo', 'cut', 'copy', 'paste', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', '|', 'insertHorizontalRule', 'createLink', 'insertImage' ]
                }, dojoDom.byId(elementId));
                dojo.connect(rte, 'onChange', function()
                      {
                        var e = dojoDom.byId(formId)[formElementName];
                        var v = rte.attr("value");
                        e.value = TextUtil.isNullOrEmpty(v) == true || v.match(/^\s*\<\s*br[^\/]*\/\>\s*$/) != null ? "" : v;
                        if (e.onchange)
                          e.onchange();
                        return true;
                      });
                that.rte.startup();
        });
  };
  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Misc
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.FadeOut = function(elementId, millis, func)
 {
   require(["dojo/_base/fx", "dojo/on"], function(fx, on)
    { 
      var a = fx.fadeOut({node: document.getElementById(elementId), duration: millis==null ? 200 : millis});
      if (func != null)
       on(a, "End", func);
      a.play();
    });
 };

dojoSimple.getViewport = function(elementId, millis, func)
 {
      return dojoDijit.getViewport();
 };

 
 
 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Password UI
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.PasswordUI = function(elementId){
  var that = this;
  var domParser = new DOMParser();
  var element = document.getElementById(elementId);
  this.element = element;
  if(element == null){
    console.error("Unable to find element with ID = "+elementId+".");
    return;
  }
  var passwordRules = window.passwordRules || [];
  this.passwordRules = passwordRules;
  var p = dojo.byId(elementId);

  passwordRules.forEach(function(item, index){
    var doc = domConstruct.toDom("<TR class=\"passwordRules\"><TD colspan=\"1\"" +
        " data-index=\""+index+"\" class=\"error\">"+item.description+"</TD></TR>");
      domConstruct.place(doc, p.closest('tr'), 'after');
  })
  element.addEventListener("keyup", function(){
    var password = this.value;
    var domRules = document.getElementsByClassName("passwordRules");
    for(i=0;i<domRules.length;i++){
      var item = domRules[i];
      var childEle = item.querySelector('td');
      var index = parseInt(childEle.getAttribute('data-index'));
      var passwordRule = passwordRules[index];
      var regexp = new RegExp(passwordRule.rule);
      childEle.classList.remove("success", "error");
      if(regexp.test(password)){
        childEle.classList.add("success");
      } else {
        childEle.classList.add("error");
      }
    }
  });
  this.isValid = function(){
    var password = this.element.value;
    var flag = true;
    for(i=0;i<passwordRules.length;i++){
      var item = passwordRules[i];
      var regexp = new RegExp(item.rule);
      flag = regexp.test(password)
      if(!flag){
        break;
      }
    }
    return flag
  }
}
 
 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tooltip dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dojoSimple.TooltipDialog = function(elementId, content) {

  var that = this;

  require(["dijit/TooltipDialog","dijit/popup","dojo/on","dojo/dom"], function(TooltipDialog, popup, on, dom) {
   that.tooltipDialog = new TooltipDialog({
          id: elementId+"_TD",
          content: content,
          onMouseLeave: function(){
            popup.close(that.tooltipDialog);
          }
    });

    on(dojoDom.byId(elementId), 'click', function(){
        dojoDijit.popup.open({
              popup: that.tooltipDialog,
              around: dom.byId(elementId)
          });
      });
  });
 };
 

 window.dojoSimple = dojoSimple;
 
 return dojoSimple;

});


