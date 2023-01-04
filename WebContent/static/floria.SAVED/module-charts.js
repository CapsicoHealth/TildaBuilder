"use strict";

import { FloriaText } from "./module-text.js";
import { FloriaDOM } from "./module-dom.js";
import { ChartTheme } from "./module-charttheme.js";
//import { DojoSimple } from "./module-dojosimple.js";


define(["jslibs/popper", "d3/d3.min", "dojo/text!json/floria-config.json"]
     , function(Popper, d3, FloriaConfig)
{
  FloriaConfig = JSON.parse(FloriaConfig).data;
  var charts = {};
  var globalLegend = {};
// ///////////////// Legend Logic
  function setLegend(tileId, data, current, horizontal, pie, offsetValue){
    var chart = current;
    var e = FloriaDOM.getElement(tileId);
    var offset = (typeof offsetValue == 'undefined' || offsetValue == null) ? 40 : offsetValue;
    chart.legend4 = d3.select("#"+tileId).append("div").attr("class", "legend")
    if(typeof data != 'undefined'){
      for (var i = 0; i < data.length; i++) {
        var legendDiv = chart.legend4.append('div')
           if(horizontal) {
          legendDiv.attr("class", "legend-rect horizontal")
             chart.legend4.append('div').attr("class", "legend-text horizontal").text(data[i])
           } else {
          legendDiv.attr("class", "legend-rect vertical")
             chart.legend4.append('div').attr("class", "legend-text vertical").text(data[i])
           }  
        legendDiv.style("background-color", function(){
          return (typeof chart.colorOvr == 'undefined' || chart.colorOvr == null) ? chart.color(i) : chart.colorOvr(i);})
      }
      if(chart.subscribable) globalLegend = chart.legend4;
    }    
  }
  
  function noDataDetection(chart, width, height){
    chart.svg.append("text").html("No data available at this time")
              .attr("x",width).attr("y",height) 
              .attr("class", "nodata")
                    .attr("align","absmiddle")
    chart.svg.append("image")
            .attr("xlink:href", "/static/img/x-warning.png")
            .attr("height","50px").attr("width","50px")
            .attr("x",width-60).attr("y",height-34)
  }
  
// //////////////////// Pie chart \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  
  function angles(ir, rx, ry, startAngle, endAngle) {
    return {sx : ir*rx*Math.cos(startAngle), sy : ir*ry*Math.sin(startAngle), ex : ir*rx*Math.cos(endAngle), ey :  ir*ry*Math.sin(endAngle) };
  }
    /////3d chart functions for all angles
  
  function pieSlice(chart, d, rx, ry, h, ir, slice) {
    var sangle = (typeof d.startAngle == 'undefined' )? 3.14 : d.startAngle;
    var startAngle = (slice == "top") ? sangle : ((slice == "outer") ? (sangle > Math.PI ? Math.PI : sangle) 
                                    : (sangle < Math.PI ? Math.PI : sangle));
    var eangle = (typeof d.endAngle == 'undefined' )? 3.14 : d.endAngle.toFixed(10);
    var endAngle = (slice == "top") ? eangle : ((slice == "outer") ? (eangle > Math.PI ? Math.PI : eangle) 
                                     : (eangle < Math.PI ? Math.PI : eangle));
    var a = [];
    if((slice == "top") && (d.endAngle - d.startAngle == 0) ) return "M 0 0";
    a = angles((slice == "inner") ? ir : 1 , rx, ry, startAngle, endAngle);
    var ret =[];
    (slice == "top") ? ret.push("M",a.sx,a.sy,"A",rx,ry,"0",(endAngle-startAngle > Math.PI? 1: 0),"1",a.ex,a.ey,"L",ir*a.ex,ir*a.ey,"A",ir*rx,ir*ry,"0",(endAngle-startAngle > Math.PI? 1: 0), "0",ir*a.sx,ir*a.sy,"z")
        : ((slice == "outer") ? ret.push("M",a.sx,h+a.sy,"A",rx,ry,"0 0 1",a.ex,h+a.ey,"L",a.ex,a.ey,"A",rx,ry,"0 0 0",a.sx,a.sy,"z")
                   : ret.push("M",a.sx, a.sy,"A",ir*rx,ir*ry,"0 0 1",a.ex,a.ey, "L",a.ex,h+a.ey,"A",ir*rx, ir*ry,"0 0 0",a.sx,h+a.sy,"z"))
    return ret.join(" ");
  }

  function getPercent(d){ 
    return (d.endAngle-d.startAngle > 0.2 ? Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2))/10+'%' : '');
  }  
  
/////////////pie chart initiater  
  charts.PieChart = function(tileId, isDonut, isLabelInside) {
     var chart = this; chart.id = tileId;
    var e = FloriaDOM.getElement(tileId); chart.isDonut = isDonut; chart.legend4; chart.isLabelInside = isLabelInside;
    chart.width = e.offsetWidth;
    chart.height = e.offsetHeight;
     chart.color = d3.scaleOrdinal().range(ChartTheme.colors); 
     ///radius of all the pie charts     
     chart.pie = d3.pie().sort(null).value(function(d){return +d.y;});
     if(isDonut) chart.pie.padAngle(.01);
     var tooltipPlot = (document.getElementById(tileId).parentNode.id != "") ? document.getElementById(tileId).parentNode.id : tileId ;
      chart.svg = d3.select("#"+tileId).append("svg").attr("id", tileId+"svg")
              .attr("class", "svg-css")
            .attr("width", 0.95*chart.width).attr("height", 0.95*chart.height)
              .append("g").attr("id",tileId+"group")
            .attr("transform", "translate("+(chart.width) / 2  +"," + (chart.height) / 2+ ")");
    chart.tooltip =  d3.select("#"+tooltipPlot)
                       .append("div")
                       .attr("id", tileId+"tool")
                       .attr("width", chart.width)
                       .attr("height", chart.height)
                       .style("max-width", chart.width+"px")
                       ;
     }
  
     charts.PieChart.prototype.addSeries = function(seriesName, seriesData, innerPercentage, innerPercentageFontSize) {
      var chart = this;
      var isSeriesEmpty = false;
      var count = 0;
      var maxtxt = "";
      var mintxt = "";
      var txt = null;
      for ( var i = 0; i < seriesData.length; i++ ) {
        seriesData[i]["name"] = seriesName; 
        if(seriesData[i]["y"] == "0" || isNaN(seriesData[i]["y"])) count++; 
        txt = seriesData[i].text+"";
          if(maxtxt.length < txt.length) maxtxt = txt;
      }
      mintxt = maxtxt;
      for ( var i = 0; i < seriesData.length; i++ ) {
        txt = seriesData[i].text+"";
        if(mintxt.length > txt.length) mintxt = txt;
      }
      if(seriesData.length == count) isSeriesEmpty = true;  
      chart.maxtxt = maxtxt;
      chart.mintxt = mintxt;
      chart.isSeriesEmpty = isSeriesEmpty;
      chart.series = seriesData;
      chart.innerPercentage = innerPercentage;
      chart.innerPercentageFontSize = ( typeof innerPercentageFontSize != "undefined" && typeof (+innerPercentageFontSize) == "integer") ? innerPercentageFontSize : "100%" ;
     }
      
     function getTxtWidth(txt) {
       var canvas = document.createElement('canvas');
       var ctx = canvas.getContext("2d");
       var txtwidth = ctx.measureText(txt).width;
       canvas.remove();
       return txtwidth;
     }
     
     charts.PieChart.prototype.draw3d = function(width, inc, thickness) {
     if (width == null) width=FloriaConfig.charts.piechart.width3D;
     if (inc == null) inc = FloriaConfig.charts.piechart.inc3D;
     if (thickness == null) thickness = FloriaConfig.charts.piechart.thickness3D;
      // chart width // inclination // thickness
       var divWidth =0;
      var chart = this;
      var maxtxtwidth = getTxtWidth(chart.maxtxt);
      var mintxtwidth = getTxtWidth(chart.mintxt);
      var isWidthMin  = (document.getElementById(chart.id).clientWidth < document.getElementById(chart.id).clientHeight) ? true : false;
  //    chart.radius = Math.min((chart.width)*0.95, (chart.height)*0.95)/2 - 35;
    chart.radius = Math.min((chart.width), (chart.height))/2 - 35- 0.20*maxtxtwidth;  

    var rx = chart.radius - 15;
      var hrx = chart.radius - 13;
      var ry, h , hh , hir, ir, hry;
      var inclination;
      //ry = chart.radius - 35;
      inclination =  (inc < 0 || inc > 90) ? FloriaConfig.charts.piechart.inc3D : inc;
      
      if(inc == 0 || thickness == 0){
        inc = 0;
        inclination = inc;
        thickness = 0;
      }
      ir = (chart.isDonut) ?  width/100 : 0;
        hir = (chart.isDonut) ? (width/100)-0.05 : 0;
      hh = thickness/10;  
        h = thickness/10;// h is thickness of pieChart
      ry = (rx  - (inclination/90)*rx);  // ry is radius in y- direction , when inclination is 0 ry = rx 
      hry = (rx  - (inclination/90)*rx)+2;
          
      ///No data detection
      if(chart.series == null || typeof chart.series == undefined || chart.isSeriesEmpty){
        noDataDetection(chart, 0, 0);             
      }else{
        (chart.series.length == 1) ? chart.series.push({"tooltip":"", "text":"", "y":"0"}) :chart.series;
        var pieChartData = chart.pie(chart.series);
        var chartsInner = chart.svg.selectAll(".innerSlice")
                  .data(pieChartData).enter()
                  .append("path")
                    .attr("class", "innerSlice")
                    .style("fill", function(d, i) { return d3.hsl(chart.color(i)).darker(0.7); })
                    .attr("d",function(d){return pieSlice(chart, d, rx+0.5, ry+0.5, h, ir, "inner");})
                    .each(function(d){this._current=d;});
        var chartsTop = chart.svg.selectAll(".outerSlice")
                .data(pieChartData).enter()
                .append("path")
                .attr("class", "outerSlice")
                .style("fill", function(d, i) { return d3.hsl(chart.color(i)).darker(0.7); })
                .attr("d",function(d){return pieSlice(chart, d, rx-0.5, ry-0.5, h, ir, "outer");})
                .each(function(d){this._current=d;})
        chart.topchart = chart.svg.selectAll(".topSlice")
                  .data(pieChartData).enter()
                  .append("path")
                  .attr("id",function(d, i){return chart.series[i].tooltip})
                  .attr("class", "topSlice")
                  .style("fill", function(d, i) { return chart.color(i); })
                  .style("stroke", function(d, i) { return chart.color(i); })
                  .attr("d",function(d){ return pieSlice(chart, d, rx, ry, h, ir, "top");})
                  .on("mouseover", function(d, i) {
                            d3.select(this).transition().duration(100)
                                .attr("d",function(d){ return pieSlice(chart, d, hrx, hry, h, hir, "top");})
                               .style("fill","#FA8072").style("stroke", "#FA8072");
                            d3.select(chartsInner._groups[0][i]).transition().duration(100)
                               .attr("d",function(d){ return pieSlice(chart, d, hrx+0.5, hry+0.5, hh, hir, "inner");})
                               .style("fill",d3.hsl("#FA8072").darker(0.7));
                            d3.select(chartsTop._groups[0][i]).transition().duration(100)
                               .attr("d",function(d){ return pieSlice(chart, d, hrx-0.5, hry-0.5, hh, ir, "outer");})
                               .style("fill",d3.hsl("#FA8072").darker(0.7));
                           ////////////highlighting the text/////////////
               //             if(chart.subscribable){
               //              d3.select(globalLegend._groups[0][i]).transition().duration(500).style("fill",d3.hsl("#FA8072").darker(0.7));
               //             }else {
               //              d3.select(chart.legend4._groups[0][i]).transition().duration(500).style("fill",d3.hsl("#FA8072").darker(0.7));
               //             }
                            var txt = d.data.tooltip;
                            if(txt != "")
                             {
                               chart.tooltip.style("display", "block")
                                    .attr("class","back-shadow tooltip")
                                    .html(d.data.tooltip);
                               var tooltip = FloriaDOM.getElement(chart.id+"tool"); 
                               var rect = FloriaDOM.getElement(txt) ;//FloriaDOM.getElement(chart.series[i].tooltip+i+"topSlice") ;
                               var container = FloriaDOM.getElement(chart.id);
                               var popper = Popper.createPopper(rect, tooltip, {
                                                placement: 'top-end',
                                                modifiers: { 
                                                   flip: { behavior: ['left-end', 'right-start', 'top', 'bottom'] },
                                                   preventOverflow: {  
                                                      enable : true,
                                                      //priority : ['left', 'right'],
                                                      padding : 10,
                                                      boundariesElement: container,
                                                      offset: { offset: '50px,10px' } 
                                                   },
                                                }
                                            });
                            //popper.disableEventListeners();
                            }
                      })
                      .on("mouseout", function(d, i) {
                            d3.select(this).transition()
                               .duration(500)
                               .attr("d",function(d){ return pieSlice(chart, d, rx, ry, h, ir, "top");})
                               .style("fill", function(d) { return chart.color(i); })
                               .style("stroke", function(d) { return chart.color(i); });
                            d3.select(chartsInner._groups[0][i]).transition()
                               .duration(500)        
                               .attr("d",function(d){ return pieSlice(chart, d, rx+0.5, ry+0.5, h, ir, "inner");})
                               .style("fill", d3.hsl(chart.color(i)).darker(0.7));
                            d3.select(chartsTop._groups[0][i]).transition()
                              .duration(500)
                              .attr("d",function(d){ return pieSlice(chart, d, rx-0.5, ry-0.5, h, ir, "outer");})
                              .style("fill", d3.hsl(chart.color(i)).darker(0.7));
                            chart.tooltip.style("position", "absolute")
                                         .style("display", "none");
               //              if(chart.subscribable){
               //               d3.select(globalLegend._groups[0][i]).transition().duration(500).style("fill", "black");
               //              } else{
               //               d3.select(chart.legend4._groups[0][i]).transition().duration(500).style("fill", "black");
               //              }
                        })
              chart.textLines1 = chart.svg.selectAll(".line1")
                    .data(chart.pie(chart.series)).enter()
                    .append("line")
                    .attr("class", "line1")
                    .attr("x1",function(d){ return (d.value == 0)? 0: 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                    .attr("y1",function(d){ return (d.value == 0)? 0: 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));})
                    .attr("x2",function(d){
                        if(d.value == 0) return 0;
                        var  x = 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));
                        return (isWidthMin) ? x : (x > 0 ? x+2: x-2);
                    }).attr("y2",function(d){ 
                      if(d.value == 0) return 0;
                      var y = 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));
                    var  y = (y < document.getElementById(chart.id).clientWidth) ? y : document.getElementById(chart.id).clientHeight;
                    return (isWidthMin) ? (y > 0 ? y+10 : y-10) : y;
                    }).style("stroke","black");  
          chart.textLines2 = chart.svg.selectAll(".line12")
                       .data(chart.pie(chart.series)).enter()
                    .append("line")
                    .attr("class", "line12")
                    .attr("x1",function(d){
                      if(d.value == 0) return 0;
                        var  x = 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));
                        return (isWidthMin) ? x : (x > 0 ? x+2: x-2);
                      })
                    .attr("y1",function(d){ 
                      if(d.value == 0) return 0;
                        var y = 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));
                        var y = (y < document.getElementById(chart.id).clientWidth) ? y : document.getElementById(chart.id).clientHeight;
                        return (isWidthMin) ? (y > 0 ? y+10 : y-10) : y;
                    }).attr("x2",function(d){
                      if(d.value == 0) return 0;
                        var  x = 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));
                      var offset = (1.5*chart.radius+getTxtWidth((d.value == 0)? "": d.data.text) > chart.width/2) ? 0.5*chart.radius : chart.radius;
                      return (isWidthMin) ? ( x > 0? ((x > 0.5*chart.radius)? x : (0.5*chart.radius)) : ((x < -0.5*chart.radius) ? x : -0.5*chart.radius))
                                : (x > 0 ? (((x+2) > offset)? x+2: offset) : ((x-2) < (-offset) ? x-2 : (-offset)));
                    })
                      .attr("y2",function(d){
                      if(d.value == 0) return 0;
                        var y = 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));
                      var  y = (y < document.getElementById(chart.id).clientWidth) ? y : document.getElementById(chart.id).clientHeight;
                      return (isWidthMin)? (y > 0 ? y+10 : y-10) : y;
                      }).style("stroke","black");              
        var sign, labelX;
          chart.textLabels =  chart.svg.selectAll(".percent")
                        .data(chart.pie(chart.series)).enter()
                        .append("text").attr("class", "percent")
                        .attr("x",function(d){
                          if(d.value == 0) return 0;
                          var  x = 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));
                          var offset = (1.5*chart.radius+getTxtWidth((d.value == 0)? "": d.data.text) > chart.width/2) ? 0.5*chart.radius : chart.radius;
                          return (isWidthMin) ? (x > 0? ((x > 0.5*chart.radius)? x+5 : (0.5*chart.radius+5)) : ((x < -0.5*chart.radius) ? x-5 : -0.5*chart.radius-5)) 
                                    : (x > 0 ? (((x+2) > offset+5)? x+2: offset+5) : ((x-2) < (-offset-5) ? x-2 : (-offset-5)));
                        })
                        .attr("y",function(d){ 
                          if(d.value == 0) return 0;
                          var y = 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));
                        var  y = (y < document.getElementById(chart.id).clientWidth) ? y : document.getElementById(chart.id).clientHeight;
                          return (isWidthMin) ? (y > 0 ? y+10 : y-10) : y;
                        }).text(function(d){ return (d.value == 0)? "": d.data.text;})
                       .style("font-size", function(d){ 
//                            var tile = chart.radius;
//                            var svgw = parseFloat(window.getComputedStyle(document.getElementById(chart.id+"svg"), null).getPropertyValue("width"), 10);
//                            var svgh = parseFloat(window.getComputedStyle(document.getElementById(chart.id+"svg"), null).getPropertyValue("height"), 10);
//                            var diff = Math.abs(tile - Math.min(svgw, svgh)/2)/3;
//                            console.log("FONT_SIZE--> d.data.text: "+d.data.text+"; tile: "+tile+"; svgw: "+svgw+"; svgh: "+svgh+"; diff: "+diff+";");
                            return "14px";
//                            return diff+"px";
                        })
                        .style("text-anchor", function(d){
                          var  x = 1.3*rx*Math.cos(Math.atan2(0.9*rx*Math.sin(0.5*(d.startAngle+d.endAngle)), 1*ry*Math.cos(0.5*(d.startAngle+d.endAngle))));  
                          x = (x > 0) ? chart.width*0.15 : -chart.width*0.15;
                          var restrict = Math.abs(x) >= (chart.width *0.2) ? true : false;
                          return (x>0 && !restrict) ? "start" : ( (restrict) ?  "middle" : "end" );});
      }
      var alpha = 7, spacing = 95 , again , a , da, y1, b, db, y2, deltaY, adjust, sign; // params for anti collision
      function adjust() {
        again = false;
        chart.textLabels.each(function (d, i) {
          a = this;
            da = d3.select(a);
            y1 = da.attr("y");
            chart.textLabels.each(function (d, j) {
              b = this;
              if (a == b) return;
              db = d3.select(b);
              if (da.attr("text-anchor") != db.attr("text-anchor")) return;
              y2 = db.attr("y");
              deltaY = y1 - y2;
              if (Math.abs(deltaY) > spacing) return;
              again = true;
              sign = deltaY > 0 ? 1 : -1;
              adjust = sign * alpha;
              da.attr("y",+y1 + adjust);
              db.attr("y",+y2 - adjust);
            });
        });
      if(again) {
        var labelElements = chart.textLabels._groups[0];
          chart.textLines1.attr("y2",function(d,i) {
            if(labelElements[i].attributes.y.value == 0 || labelElements[i].attributes.x.value == 0) return 0;
            return (labelElements[i].attributes.y.value > 0 ) ? (labelElements[i].attributes.y.value + 5) : (labelElements[i].attributes.y.value - 5); });
          chart.textLines2.attr("y2",function(d,i) {
            if(labelElements[i].attributes.y.value == 0 || labelElements[i].attributes.x.value == 0) return 0;
            return (labelElements[i].attributes.y.value > 0 ) ? (labelElements[i].attributes.y.value + 5) : (labelElements[i].attributes.y.value - 5); });
          chart.textLines2.attr("y1",function(d,i) {
            if(labelElements[i].attributes.y.value == 0 || labelElements[i].attributes.x.value == 0) return 0;
            return (labelElements[i].attributes.y.value > 0 ) ? (labelElements[i].attributes.y.value + 5) : (labelElements[i].attributes.y.value - 5); });
          chart.textLabels.attr("y",function(d,i) {
            if(labelElements[i].attributes.y.value == 0 || labelElements[i].attributes.x.value == 0) return 0;
          return (labelElements[i].attributes.y.value > 0 ) ? (labelElements[i].attributes.y.value + 5) : (labelElements[i].attributes.y.value - 5); });
        setTimeout(adjust,1000)
       }
    }
      if(!chart.isSeriesEmpty  && chart.isSeriesEmpty != undefined) {
        adjust();
        chart.textLabels.append("title") /// to center the text in a pie chart
          .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return (d.endAngle + d.startAngle)/2 > Math.PI ? "end" : "start"; })
        .html(function(d, i) { return (d.value == 0)? "": d.data.tooltip; }).attr("text-anchor", "end");
        ///This code calculates inner font percentage, probably be used in the future
        /*var innerFont = 10;
        if(rx > chart.innerPercentage.length){
          innerFont = ((rx) / chart.innerPercentage.length) ;
      }else{
        innerFont = 8*( chart.innerPercentage.length.length / (3/2*rx));
      }*/
        chart.svg.append("text")
        .attr("class", "percent").text(chart.innerPercentage)
        .attr("text-anchor", "middle")
        //part of the inner font code
            //.style("font-size", innerFont+"px").attr("x", 0).attr("y", 10);
      //  .style("font-size", chart.innerPercentageFontSize)
        .attr("x", 0)
        .attr("y", 10);
        chart.legendData = [];
          for (var i = 0; i < chart.series.length; i++) {
            if(typeof chart.series[i].legend != "undefined" ) chart.legendData[i] = chart.series[i].legend;
          }
      }
   }
     
     charts.PieChart.prototype.addClickHandler = function(handlerFunc) { 
      var chart = this;       
      chart.svg.on("click",  function(d) {
                  var elements = document.querySelectorAll(':hover');
                  var len = elements.length - 1 ;
                  handlerFunc(elements[len].__data__.index, elements[len].__data__.data,elements[len].__data__.data.name, elements[len].__data__.data, elements[len]);});
     };
     
     charts.PieChart.prototype.subscribable = function() {
       var chart = this;  chart.subscribable = true;
     }
          
     charts.PieChart.prototype.legend = function(tileId, series, horizontal, height, width) {
      setLegend(tileId, this.legendData, this, horizontal, true);
     }
     
    function transform(chart , type, values)
     {
       if(type == "x")
        {
          var valueTransform = chart.xLabelFunction(values);
          if (valueTransform == null)
           valueTransform = "";
          if(chart.maxXLayout < valueTransform.length)
           chart.maxXLayout = valueTransform.length;
          return valueTransform;
        }
       else if(type == "y")
        {
          var valueTransform = chart.yLabelFunction(values);
          if (valueTransform == null)
           valueTransform = "";
          if(chart.maxYLayout < valueTransform.length)
           chart.maxYLayout = valueTransform.length;
          return valueTransform;
        }
    }

// ///////////// Chart basic setup functions
    function axisSetup(chart){
      chart.maxXLayout = 0; chart.maxYLayout = 0;
      if(chart.horizontal){
        chart.seriesY = chart.seriesY.map(function(values){ return ((chart.XaxisAvailable) ? transform(chart , "x", values) : values);});
          chart.seriesX = chart.seriesX.map(function(values){ return ((chart.YaxisAvailable) ? transform(chart , "y", values) : values);});
      }else{
        chart.seriesX = chart.seriesX.map(function(values){ return ((chart.XaxisAvailable) ? transform(chart , "x", values) : values);});
        chart.seriesY = chart.seriesY.map(function(values){ return ((chart.YaxisAvailable) ? transform(chart , "y", values) : values);});
      }
    }

// ///////////// Chart basic setup functions
    
    function mainLayout(chart){
      var e = FloriaDOM.getElement(chart.id);
      chart.margin = {top: 25, right: 20, bottom: (50+(chart.maxXLayout+20)), left: (50+chart.maxYLayout+25), front: 0, back: 0};
      chart.width = e.offsetWidth - chart.margin.left - chart.margin.right - 7; 
      chart.height = e.offsetHeight - chart.margin.top - chart.margin.bottom;
      chart.depth = 100 - chart.margin.front - chart.margin.back; chart.padding = 100;         
      chart.color = d3.scaleOrdinal().range(ChartTheme.colors);         
    }
    
    function drawLayout(chart, type, horizontal) {      
      mainLayout(chart);
       if(chart.height < 0) chart.height = chart.width/2.40;
       // Set the ranges
      chart.x = (type && (typeof horizontal == "undefined" || horizontal == null || horizontal == false)) ? d3.scaleBand().range([0, chart.width])
                                                      : d3.scaleLinear().range([0, chart.width]).nice();
      chart.y = (horizontal) ?  d3.scaleBand().range([chart.height, 0]) : d3.scaleLinear().range([chart.height, 0]).nice();

     // Define the line
     chart.valueline = d3.line().x(function(d) { return chart.x(d.x); })
                 .y(function(d) { return chart.y(d.y); });
      var tooltipPlot = document.getElementById(chart.id).parentNode;
      if(tooltipPlot.id == ""){
       tooltipPlot = document.getElementById(chart.id);
      }else{
      while(tooltipPlot.parentNode.tagName != "B" && tooltipPlot.parentNode.tagName != "BODY"){
        tooltipPlot = tooltipPlot.parentNode;
      }  
      }   
      chart.main = d3.select("#"+chart.id).append("svg")
              .attr("id", chart.id+"svg")
              .attr("class","svg-css")
            .attr("width", (chart.width + chart.margin.left + chart.margin.right))
            .attr("height", (chart.height +  chart.margin.top + chart.margin.bottom - 25))
            .attr("pointer-events", "all")
            .style("padding-top", "1%")
            .style("overflow", "visible");
     chart.svg = chart.main.append("g")
            .attr("id",chart.id+"group")
            .attr("transform", "translate(" + chart.margin.left + "," +chart.margin.top+ ")");
     chart.tooltip =  d3.select("#"+chart.id)
                .append("div").attr("id", chart.id+"tool")
               .attr("class" , "tooltip").attr("width", chart.width).attr("height", chart.height)
                .style("max-width", chart.width+"px")
    }
    
    function setAxis(chart, type, horizontal){      
      var maxLabelLength = 0;
      function getTicks(ticks, length){
        return (typeof ticks == "undefined" || ticks == null ) ? ( length <= 10 ? length : 10 ) : ticks;
      }
      chart.yTitle = (typeof chart.yTitle == 'undefined') ? "" : chart.yTitle;
      chart.main.append("text")
          .attr("text-anchor", "end")
          .style("bottom", 0).style("right", 0).style("left", 100)
          .attr("transform", "translate("+ ((chart.padding/2) + (chart.yTitle.length))+","+20+")rotate(0)")  
          .text(chart.yTitle)
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", 10).attr("x", -40)
          //.style("font-size","1.2em");

      if(chart.XaxisAvailable) {
        chart.main.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "translate("+ (chart.width+ chart.margin.left  + chart.margin.right - (chart.xTitle.length*4)) +","+(chart.height + chart.margin.top + chart.margin.bottom-20)+")")
            .text(chart.xTitle)
            .attr("y", 4)
            //.style("font-size","1.2em")
            .attr("text-anchor", "end");
       chart.xAxis = d3.axisBottom(chart.x)
               .ticks(getTicks(chart.xticks, chart.seriesX.length))
               .tickSize(-chart.height,1,1)//.ticks((chart.width + 2) / (chart.height + 2) * 10)
               .tickPadding(10)
               .tickFormat(function(d, i) {
                 return chart.xLabelFunction(d); });
      }else {
        chart.xAxis = d3.axisBottom(chart.x)
              .ticks((chart.width + 2) / (chart.height + 2) * 10)
              .tickSize(-chart.height,1,1)
              .tickPadding(10).tickFormat(function(d, i) { return d; });
      }
      
      (horizontal) ? chart.x.domain([0, d3.max(chart.yDomain, function(d) { return d; })])
              : ((type) ? chart.x.domain(chart.xDomain) : chart.x.domain(d3.extent(chart.xDomain, function(d) { return d; })));

     chart.svg.append("g")
         .attr("class", "x axis")
         .attr('id', "axis--x")
         .attr("transform", "translate(0," + chart.height + ")")
         .call(chart.xAxis)
         .style("font-size","75%")
         .selectAll("text")
         .attr("dx", "-.8em")
         .attr("dy", ".15em")
         .style("text-anchor", "end")
         .attr("transform", "rotate("+(chart.xLabelAngle == null || chart.xLabelAngle < 20 || chart.xLabelAngle > 70 ? -30 : -chart.xLabelAngle)+")")
         ;

//     alert("chart.yticks: "+chart.yticks+"; chart.seriesY.length: "+chart.seriesY.length+"; getTicks(): "+getTicks(chart.yticks, chart.seriesY.length)+";")
     chart.yAxis = d3.axisLeft(chart.y)
             .ticks(getTicks(chart.yticks, chart.seriesY.length))
             .tickPadding(10)
             .tickSize(-chart.width-10,0,0)
             .tickFormat(function(d) { return ((chart.YaxisAvailable) ? chart.yLabelFunction(d) : d); })
             ;
  
     (horizontal) ? chart.y.domain(chart.xDomain.map(function(d) { return d; }))
            : ( (typeof chart.max == "undefined" || chart.max == null) ? chart.y.domain([chart.undefinedMin, chart.undefinedMax])
                                          : chart.y.domain([chart.min, chart.max]) );
      chart.svg.append("g")
        .attr("class", "y axis")
         .call(chart.yAxis)
         .style("font-size","75%")
         .selectAll("text")
         .attr("text-anchor", "end")
    }
    
// ///////////////////////// Chart initiators
    charts.ChartBase = function(id) {
     var chart = this; chart.id = id; chart.seriesX = [];  chart.seriesY = [], chart.max;
    chart.seriesLineData = []; chart.seriesScatterData = []; chart.seriesbarData = [];
    chart.type = []; chart.undefinedMax = 0; chart.seriesArray = [];
     chart.series = []; chart.first = false;
     chart.overridecolor = [];chart.colorOvr = null;
    }
   
   charts.ChartBase.prototype.setXAxis = function(title, labelFunction, labelAngle, diffAxis, LabelFontSize, ticks) {
       var chart = this; chart.xTitle = title; chart.xLabelFunction = labelFunction; chart.xticks = ticks;
       chart.xDiffAxis = diffAxis; chart.xLabelAngle = labelAngle; chart.XaxisAvailable = true;
   }
   
   charts.ChartBase.prototype.setYAxis = function(title, labelFunction, min,  max, labelAngle, diffAxis, LabelFontSize, ticks) {  
       var chart = this; chart.yTitle = title; chart.yLabelFunction = labelFunction; chart.yticks = ticks;
     chart.yDiffAxis = diffAxis; chart.yLabelAngle = labelAngle; chart.min = min;
     chart.max = max; chart.YaxisAvailable = true;
   }
   
   function setSeriesData(chart, seriesData, seriesName, tooltip, seriesLabels){
       if(typeof seriesData[0] == 'object'){
          seriesData.forEach(function(d, i){
            seriesData[i].x = (typeof +d.x == 'undefined' || isNaN(d.x) ? i : +d.x);
            chart.xDomain[i] = (typeof +d.x == 'undefined' || isNaN(d.x) ? i : +d.x);          
            seriesData[i].y = +d.y;
            chart.yDomain[i] = +d.y;
            seriesData[i].name = seriesName;
            chart.seriesX[i] = seriesData[i]["x"];
            chart.seriesY[i] = seriesData[i]["y"];
           chart.series[i] = +seriesData[i]["y"];
           if(typeof seriesLabels != 'undefined' && seriesLabels != null && seriesLabels != ""){ seriesData[i].text = seriesLabels[i] }
           if(typeof chart.undefinedMin == "undefined") { 
               chart.undefinedMin = d.y 
           }
           if(chart.undefinedMax < +d.y) { 
                chart.undefinedMax = +d.y;
           }
           if(chart.undefinedMin > +d.y) { 
               chart.undefinedMin = +d.y;
           }
          })
          if(chart.undefinedMin > 0){
              chart.undefinedMin = 0; 
          }
          return seriesData;
       } else {
          seriesData.forEach(function(d, i){
            chart.seriesArray.push({
              "x":+i,
            "y":+seriesData[i],
            "name":seriesName,
              "text"  : (typeof seriesLabels != 'undefined' && seriesLabels != null && seriesLabels != "") ? seriesLabels[i] : "",
            "tooltip" : ( typeof tooltip == 'undefined' ||  tooltip == null) ? null : tooltip[i]
          });
          chart.xDomain[i] = +i;
          chart.yDomain[i] = +seriesData[i];
          chart.seriesX[i] = chart.seriesArray[i]["x"];
          chart.seriesY[i] = chart.seriesArray[i]["y"];
          chart.series[i] = +chart.seriesArray[i]["y"];
          
          if(typeof chart.undefinedMin == "undefined") { 
              chart.undefinedMin = +seriesData[i] 
          }
          if(chart.undefinedMax < +seriesData[i]) { 
              chart.undefinedMax = +seriesData[i];
          }
          if(chart.undefinedMin > +seriesData[i]) { 
              chart.undefinedMin = +seriesData[i];
          }
          })
          if(chart.undefinedMin > 0){
              chart.undefinedMin = 0; 
          }
          return chart.seriesArray;
     }
   }
 // /////////////////////////// Line series and plotter
 charts.ChartBase.prototype.addLineSeries = function(seriesName, seriesData, overrideColor, tooltip, tunerLabel, tunerValue) {  
      var chart = this; chart.xDomain = []; chart.yDomain = []; chart.seriesXY = []; chart.seriesArray = []; 
      chart.tunerlabel = tunerLabel; chart.tunerValue = tunerValue;
      if(overrideColor != "undefined" && overrideColor != null && overrideColor != []){
        chart.overridecolor.push(overrideColor);
       chart.colorOvr = d3.scaleOrdinal().range(chart.overridecolor); 
      }else{
          chart.colorOvr = d3.scaleOrdinal().range(ChartTheme.colors);         
      }
      chart.seriesLineData.push(setSeriesData(chart, seriesData, seriesName, tooltip, null));
      chart.type.push("Line");
    }
    
 charts.ChartBase.prototype.drawLine = function(line, dot) {
    var chart = this;
    var dotSize = (typeof dot == 'undefined' && dot == null) ? 3 : dot;
    var lineThickness = (typeof line == 'undefined' && line == null) ? 2 : line;
    if(!chart.first){
          axisSetup(chart);
          drawLayout(chart, false, false);
          setAxis(chart, false, false);
      chart.first = true;
       }
    chart.tooltipFloating = d3.select("#"+chart.id).append("rect")
                  .attr("id" , chart.id+"tooltip-floating")
    chart.Line = chart.svg.append("g");
    if((chart.type.indexOf("Line") != -1) && (chart.type.indexOf("Scatter") == -1 && chart.type.indexOf("Bar") == -1)){
      var mouseG = chart.svg.append("g").attr("class", "mouse-over-effects"+chart.id)
      mouseG.append("path").attr("id", chart.id+"mouse-line")
          .attr("class", "mouse-line"+chart.id).style("stroke", "black")
          .style("stroke-width", "1px").style("opacity", "1");  
     }     
    chart.dot = chart.svg.selectAll("dot");
    var lines = null;
    if(chart.seriesLineData == null || typeof chart.seriesLineData == undefined || chart.isSeriesEmpty){
        noDataDetection(chart, 0, 0);             
      }else{
        for (var i = 0; i < chart.seriesLineData.length; i++){    
          var mousePerLine;
         chart.Line.append("path").attr("class", "line plot"+chart.id)
             .style('stroke-width', lineThickness).style("stroke", function(d){ return chart.colorOvr(i); })//return  (typeof chart.overridecolor[i] == 'undefined' || chart.overridecolor[i] == null)?  chart.color(i) : chart.colorOvr(i);})
             .style("pointer-events", "all").attr("d", chart.valueline(chart.seriesLineData[i]));
         if((chart.type.indexOf("Line") != -1) && (chart.type.indexOf("Scatter") == -1 && chart.type.indexOf("Bar") == -1)){
           mousePerLine = mouseG.selectAll('.mouse-per-line'+chart.id)
                        .data(chart.seriesLineData).enter()
                        .append("g").attr("class", "mouse-per-line"+chart.id);
           mousePerLine.append("circle").attr("r", 7)
            .style("stroke", function(d, i) { return chart.colorOvr(i); })
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "0");
         }
         var mouseOverFn = function(d, z, that){
           var x0 = chart.x.invert(d3.mouse(that)[0]);
             var mouse = chart.x(x0.toFixed(0));
           var dataString = " <div style='background-color : #D3D3D3; color : #000000;'><center>"+chart.xLabelFunction(x0.toFixed(0)) +"</center></div>";
           var position  = null;
           var block = chart.tooltipFloating
                     .attr("class","back-shadow tooltip")
                 .style("display","block")
                 .style("width", "").style("height", "")
               d3.select(".mouse-line"+chart.id).attr("d", function() {
                                     var d = "M" + mouse + "," + chart.height;
                                     d += " " + mouse + "," + 0;
                                     return d;});       
               d3.selectAll(".mouse-per-line"+chart.id)
                 .attr("transform", function(d, i) {
                   var beginning = 0, end = (typeof lines[i] == 'undefined') ? chart.width : lines[i].getTotalLength(), target = null;
                   while (true){
                     target = Math.floor((beginning + end) / 2);
                     var pos =(typeof lines[i] == 'undefined') ? chart.height : lines[i].getPointAtLength(target);
                     if ((target === end || target === beginning) && pos.x !== mouse) { break; }
                     if (pos.x > mouse)      end = target;
                     else if (pos.x < mouse) beginning = target;
                     else break; //position found
                   }
                   var currentData = chart.seriesLineData;
                     if(typeof pos.y == "undefined"){
                       d3.select(that).remove();
                     } else {
                         var index = chart.x.invert(pos.x).toFixed(0);     
                         var tuner = (typeof chart.tunerlabel == 'undefined') ? "": chart.tunerlabel;
                          var xindex = chart.x.invert(pos.x).toFixed();
                          var tunerValue = "";
                          for (var n = 0; n < currentData[i].length; n++) {
                          if(currentData[i][n].x == xindex)
                            tunerValue = currentData[i][n].tooltip == null ? currentData[i][n].y : currentData[i][n].tooltip;
                          }
                        dataString += " <div style='color : "+chart.colorOvr(i)+";'>  "+tunerValue +"</div>";
                          d3.select(that).select('text').text(chart.y.invert(pos.y).toFixed(0));
                        return "translate(" + mouse + "," + pos.y +")";
                    }
                  })
                  block.html(dataString).style("stroke-width","2px")
                       .style("border","1px").style("stroke","black");
              var tooltip = document.getElementById(chart.id+"tooltip-floating"); 
                var rect = document.getElementById(chart.id+"mouse-line");
                var container = document.getElementById(chart.id);
              var popper = Popper.createPopper(rect, tooltip, {
                            placement: 'left-start',
                        removeOnDestroy: true,
                            modifiers: {
                                  flip: { behavior: ['left', 'right', 'bottom-middle'],
                                       padding: 0 },
                            preventOverflow: { boundariesElement: container },
                             offset: { offset: '0px,50px' }
                                  },
                });
              //popper.disableEventListeners();
         }
         if((chart.type.indexOf("Line") != -1) && (chart.type.indexOf("Scatter") == -1 && chart.type.indexOf("Bar") == -1)){
           mouseG.data(chart.seriesLineData[i]).append('rect')
             .attr('width', chart.width)
          .attr('height', chart.height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on("mousemove",function(d,z){
            var that = this;      
            mouseOverFn(d, z, that);})
          .on('mouseout', function() { // on mouse out hide line, circles and text
             d3.select(".mouse-line"+chart.id).transition().duration(500).style("opacity", "0");
             d3.selectAll(".mouse-per-line"+chart.id+" circle").transition().duration(500).style("opacity", "0");
             d3.selectAll(".mouse-per-line"+chart.id+" text").transition().duration(500).style("opacity", "0");  
                  chart.tooltipFloating.style("position", "absolute").style("display","none"); })  
          .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line"+chart.id).transition().duration(500).style("opacity", "1");
            d3.selectAll(".mouse-per-line"+chart.id+" circle").transition().duration(500).style("opacity", "1");
            d3.selectAll(".mouse-per-line"+chart.id+" text").transition().duration(500).style("opacity", "1");
            chart.tooltipFloating.attr("class","tooltip").style("display","block")})  
         }
        chart.dot.data(chart.seriesLineData[i])      
             .enter().append("circle")
             .attr("id",function(d, i){ return chart.id+""+ (chart.x(d.x) + chart.y(d.y)) +""+i })
             .attr("class", "scatterLineSrc")
             .classed("dot", true)
             .style("fill", function(d){ return d.color!=null ? d.color : d3.hsl(chart.colorOvr(i)).darker(1);})
             .attr("r", function(d){ return d.size!=null ? d.size : dotSize; })
             .on("mouseover", function(d, i) {
                  var mouse = d3.select(this);
                  d3.select(this).transition().duration(500).attr("r", dotSize + 4);
                  chart.tooltip.style("display", "inline-block")
                               .attr("class","back-shadow tooltip")
                               .html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip);
                  var tooltipDot = document.getElementById(chart.id+"tool");
                  var rect = document.getElementById(chart.id+""+(chart.x(d.x) + chart.y(d.y)) +""+i);
                  var container = document.getElementById(chart.id);
                  var popperDot = Popper.createPopper(rect, tooltipDot
                                                     ,{placement: 'left'
                                                      ,removeOnDestroy: true
                                                      ,modifiers: { flip: { behavior: ['left', 'right','top'] },
                                                                    preventOverflow: { boundariesElement: container }
                                                                  }
                                                      }
                                                     );
                  //popperDot.disableEventListeners();
                })
             .on("mouseout", function(d) {
                   d3.select(this).transition().duration(500).attr("r", function(d){ return d.size!=null ? d.size : dotSize; });
                   chart.tooltip.style("position", "absolute").style("display","none");
                 })
               .attr("cx", function(d) { return chart.x(d.x); })     
               .attr("cy", function(d) { return chart.y(d.y); })
      }
    lines = document.getElementsByClassName('plot'+chart.id);
    }
   }
 
 
 charts.ChartBase.prototype.drawMarkers = function(data, vertical)
  {
 
  }
 
    
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////Bar series and plotter
// ////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  charts.ChartBase.prototype.addBarSeries = function(seriesName, seriesData, seriesLabels, tooltip, overrideColor) {     
    var chart = this;    
    var zScale =d3.scaleBand().domain([0, 1, 2]).range([0, chart.depth], .4);
    chart.xDomain = []; chart.yDomain = []; chart.series = []; chart.seriesXY = []; chart.seriesArray = [];
    if(overrideColor != "undefined" && overrideColor != null && overrideColor != []){
      chart.overridecolor.push(overrideColor);
    chart.colorOvr = d3.scaleOrdinal().range(chart.overridecolor); 
    }else{
        chart.colorOvr = d3.scaleOrdinal().range(ChartTheme.colors);        
    }
    var count = 0;
    chart.seriesCount = (typeof chart.seriesCount == 'undefined') ? 0 : chart.seriesCount;
    var isSeriesDataEmpty = false;
    seriesData.forEach(function(d, i){
      if(typeof seriesData[0] == 'object'){
        if(+seriesData[i]["y"] == 0) count++;
      }else{
          if(+seriesData[i] == 0 || isNaN(seriesData[i])) count++; 
      }
    })        
    if(seriesData.length == count) chart.seriesCount++; 
    chart.seriesbarData.push(setSeriesData(chart, seriesData, seriesName, tooltip, seriesLabels));
    chart.isSeriesDataEmpty =  (chart.seriesbarData.length == chart.seriesCount) ?  true : false;
    var current = Math.max.apply(null, chart.yDomain);    
    if(chart.undefinedMax < current) chart.seriesXY.push(chart.series);    
    chart.type.push("Bar"); 
   }
    
//////////////////////////////////////////////
  ////////top layer of 3d bar chart/////////////
  //////////////////////////////////////////////
  
  function getPositivePoint(chart, d, i, horizontal) {
    return ((chart.height < chart.y(d.y) && !horizontal)) ?  [ [{"x": 0 , "y": 0}, {"x": 0 , "y": 0},
                                         {"x": 0 , "y": 0}, {"x": 0 , "y": 0},
                                         {"x": 0 , "y": 0}, {"x": 0 , "y": 0}] ]
        : ( (horizontal) ? [   [{"x":  chart.x(d.y) - chart.y1(0)       ,    "y":  chart.y(d.x) + chart.y1(0)                }, //1
                      {"x":  (chart.x(d.y) + 4 - chart.y1(0)) ,   "y":  (chart.y(d.x) + chart.y1(0) + 4)              }, //2
                        {"x":  (chart.x(d.y) + 4 - chart.y1(0)) ,    "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)  }, //3
                      {"x":  4 - chart.y1(0)                  ,   "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)  }, //4
                      {"x":  - chart.y1(0)                    ,   "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))    }, //5
                      {"x":  chart.x(d.y) - chart.y1(0)       ,    "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))    }]] //6   
                 : [   [{"x": chart.x(d.x)                     ,  "y":chart.y(d.y)    },
                     {"x": chart.x(d.x) + 4                   ,  "y":chart.y(d.y) - 4  },
                     {"x": chart.x(d.x) + (chart.x1.bandwidth()*80)/100 + 4  ,  "y": chart.y(d.y) - 4  },
                     {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100 + 4   ,  "y": chart.y(0) - 4  },
                     {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100     ,  "y": chart.y(0)    },
                     {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100     ,  "y": chart.y(d.y)     }] ]);
     }

  function getNegativePoint(chart, d, i, horizontal) {
        return ((chart.height < chart.y(d.y) && !horizontal)) ?  [ [{"x": 0 , "y": 0}, {"x": 0 , "y": 0},
                                             {"x": 0 , "y": 0}, {"x": 0 , "y": 0},
                                             {"x": 0 , "y": 0}, {"x": 0 , "y": 0}] ]
            : ( (horizontal) ? [   [{"x":  chart.x(d.y) - chart.y1(0)       ,    "y":  chart.y(d.x) + chart.y1(0)                }, //1
                          {"x":  (chart.x(d.y) + 4 - chart.y1(0)) ,   "y":  (chart.y(d.x) + chart.y1(0) + 4)              }, //2
                            {"x":  (chart.x(d.y) + 4 - chart.y1(0)) ,    "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)  }, //3
                          {"x":  4 - chart.y1(0)                  ,   "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)  }, //4
                          {"x":  - chart.y1(0)                    ,   "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))    }, //5
                          {"x":  chart.x(d.y) - chart.y1(0)       ,    "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))    }]] //6   
                     : [   [{"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100 ,   "y": chart.y(0)    },
                         {"x": chart.x(d.x) + (chart.x1.bandwidth()*80)/100 + 4,  "y": chart.y(0) + 4  },
                         {"x": chart.x(d.x) + (chart.x1.bandwidth()*80)/100 + 4,  "y": chart.y(d.y) + 4  },
                         {"x": chart.x(d.x) + 4   ,  "y": chart.y(d.y) + 4 },
                         {"x": chart.x(d.x)    ,  "y": chart.y(d.y)    },
                         {"x": chart.x(d.x) + (chart.x1.bandwidth()*80)/100     ,  "y": chart.y(d.y)     }] ]);
         }
 

charts.ChartBase.prototype.drawBar = function(horizontal)
 {
   var chart = this;
   if(typeof horizontal == "undefined" || horizontal == null ){
       horizontal = false;
   }
   chart.horizontal = horizontal; 
   axisSetup(chart);
   if(chart.isSeriesDataEmpty || chart.seriesbarData == null || chart.seriesbarData ==  undefined)
    {      
      mainLayout(chart);
      noDataDetection(chart, 0.4*chart.width, 0.5*chart.height);  
      return;
    }
   drawLayout(chart, true, horizontal);
   setAxis(chart, true, horizontal);
   chart.first = true;     
   chart.x1 =  d3.scaleBand().padding(0.05);
   chart.y1 =  d3.scaleBand().padding(0.05);
   if (horizontal == true)
    chart.y1.domain(d3.range(chart.seriesbarData.length)).rangeRound([0, chart.y.bandwidth()]);
   else
    chart.x1.domain(d3.range(chart.seriesbarData.length)).rangeRound([0, (chart.x.bandwidth()-5)]);       
   chart.rect = chart.svg.append("g").selectAll("g")
                     .data(chart.seriesbarData).enter().append("g")
                     .style("fill", function(d, i) { return chart.colorOvr(i); /*ChartTheme.colors[i];*/ })
                     .style("stroke-width", 0.5)
                     .attr("transform", function(d, i) {
                               return (horizontal) ? "translate(0, " + chart.y1(i) + ")"
                                                   : "translate(" + chart.x1(i) + ",0)";
                          })
                     .selectAll(".bar").data(function(d) { return d; }).enter()
                     ;        
   if(horizontal == false)
    {        
      // dotted lines
      chart.rect.append("line")
           .attr("x1", function(d, i){
                         if ((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1)
                          return chart.x(d.x)+chart.x1(chart.seriesbarData.length-1) + (chart.x1.bandwidth()*80)/100 + 5;
                })
           .attr("y1", 0)
           .attr("x2", function(d, i){
                         if((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1)
                          return chart.x(d.x) + chart.x1(chart.seriesbarData.length-1) + (chart.x1.bandwidth()*80)/100 + 5;
                })
           .attr("y2", function(d, i){
                         if((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1)
                          return chart.height;
                 })
           .style("stroke-dasharray", ("3, 3"))
           .style("stroke-width", function(d, i){ 
                         if((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1) return 0.5; 
                 })
           .style("stroke","black")
           ;  
    }  
   chart.rect = chart.rect.append("rect")
                     .attr("id",function(d, i){
                                  return chart.id+""+((horizontal) ? (chart.x(d.y) + chart.y(d.x))
                                                                   : (chart.x(d.x) + chart.y(d.y)))+""+(i+""+d.name);
                          })  
                     .attr("class", "bar")
                     .attr("x", function(d) { return (horizontal) ? 0 : chart.x(d.x);})
                     .attr("width", function(d) { 
                                 return (horizontal) ? chart.x(d.y) : (chart.x1.bandwidth()*80)/100; 
                          })
                     .attr("y", function(d) { 
                         if(horizontal)
                             return chart.y(d.x); 
                         else if(d.y >= 0)
                             return chart.y(d.y);
                         else 
                             return chart.y(0);
                      })
                     .attr("height", function(d) { 
                         return (horizontal) ? chart.y1.bandwidth() : Math.abs(chart.height - chart.y(chart.undefinedMin + d.y)); 
                    })
                  //   .attr("y", function(d) { return (horizontal) ? chart.y(d.x) : chart.y(d.y); })
                  //   .attr("height", function(d) { return (horizontal) ? chart.y1.bandwidth() : chart.height - chart.y(chart.undefinedMin + d.y) ; })
                     ;
   chart.rect = (horizontal) ?  chart.rect :  chart.rect.text(function(d) { return "The x "+ d.x +"The y "+d.y; })
   chart.rect.on("mouseover", function(d, i) {
                       d3.select(this).transition().duration(500).style("fill","#FA8072");
                       chart.tooltip.style("display", "inline-block")
                                    .attr("class","back-shadow tooltip")
                                    .html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip)
                                    ;
                       var tooltip = document.getElementById(chart.id+"tool"); 
                       var rect = (horizontal) ? document.getElementById(chart.id+""+(chart.x(d.y) + chart.y(d.x)) +""+(i+""+d.name))
                                               : document.getElementById(chart.id+""+(chart.x(d.x) + chart.y(d.y)) +""+(i+""+d.name))
                                               ;
                       var container = document.getElementById(chart.id);
                       var popper = Popper.createPopper(rect, tooltip, { placement: (horizontal) ? 'top-start' : 'right'
                                                               ,modifiers: { flip: { behavior: ['top', 'right', 'bottom', 'left'] }
                                                                            ,preventOverflow: { enable : true
                                                                                               ,priority : ['left', 'right']
                                                                                               ,padding : 10
                                                                                               ,boundariesElement: container
                                                                                              }
                                                                            ,offset: { offset: '0px 0px' }
                                                                           },
                                                              });
                       //popper.disableEventListeners();
                })
             .on("mouseout", function(d, i) {
                      d3.select(this).transition().duration(500).style("fill", /*chart.colorOvr(d)*/ ChartTheme.colors[d])
                      chart.tooltip.style("position", "absolute").style("display", "none");}
                );
   chart.topLayer = chart.svg.append("g").selectAll("g")
                         .data(chart.seriesbarData).enter().append("g")
                         .style("fill", function(d, i) {
                                             var c=d3.hsl(chart.colorOvr(i)/*ChartTheme.colors[i]*/);
                                             return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));
                               })
                         .style("stroke", function(d, i) {
                                             var c=d3.hsl(chart.colorOvr(i)/*ChartTheme.colors[i]*/);
                                             return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));
                               })
                         .style("stroke-width", 0.5)
                         .attr("transform", function(d, i) {
                                              return (horizontal) ? "translate("+(chart.y1(0))+","+ (chart.y1(i)-chart.y1(0))+")"
                                                                  : "translate(" + chart.x1(i) + ",0)"; 
                              })
                         .append("g").selectAll("g")
                         .data(function(d){ return d;}).enter()
                         .append("g").selectAll("g")
                         .data(function(d, i){ 
                                    return (d.y >= 0) ? getPositivePoint(chart, d, i, horizontal) :  getNegativePoint(chart, d, i, horizontal);
                              })
                         .enter().append("polygon").attr("class", "polygon")
                                 .attr("points", function(d){ 
                                            return d.map(function(d) { return[d.x,d.y].join(","); }).join(" ");
                                      })
                         ;
 }
    
charts.ChartBase.prototype.addBarClickHandler = function(handlerFunc) {
      if(!this.isSeriesDataEmpty)
        this.rect.on("click",  function(d) {
          var elements = document.querySelectorAll(':hover');
              handlerFunc(d.x, d, d.name, d, elements[16]);
        });
     };
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////Scatter series and plotter
// ///////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addScatterSeries = function(seriesName, seriesData, maxlimit, dotSize, overrideColor) {  
    var chart = this; chart.xDomain = []; chart.yDomain = []; chart.dotSize = dotSize; chart.seriesXY = []; chart.series = [];  
    chart.overrideTheColor = false;
    /////////////  to add customised color of dots /////////////////////////
    if(overrideColor != "undefined" && overrideColor != null && overrideColor != []){
        chart.overrideTheColor = true;
        chart.overridecolor = overrideColor;
         chart.colorOvr = d3.scaleOrdinal().range(chart.overridecolor); 
      }else{
        chart.colorOvr = d3.scaleOrdinal().range(ChartTheme.colors);         
      }
  
    if (maxlimit != null) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var i = 0; i < seriesData.length; ++i) {
           var v = seriesData[i].y;
           if (min > v) min = v;
           if (max < v) max = v;
         } 
        var rangeX = maxlimit*(seriesData.length)/100;
        var rangeY = maxlimit*(max-min)/100;
        
        var newseriesData = [], lastX = -100000, lastY = 0;
        for (var i = 0; i < seriesData.length; ++i) {
          var d = seriesData[i];
          if (i-lastX > rangeX || Math.abs(d.y-lastY) > rangeY) {
            lastX = i;
            lastY = d.y;
            newseriesData.push(d);
            }
        }
        seriesData = newseriesData;
      }
    chart.seriesScatterData.push(setSeriesData(chart, seriesData, seriesName, null, null));
    var current = Math.max.apply(null, chart.yDomain);    
    if(chart.undefinedMax < current)
    chart.seriesXY.push(chart.series);   
    chart.type.push("Scatter");
   }
    
    charts.ChartBase.prototype.drawScatterPlot = function() {
       var chart = this;       
       if(!chart.first){
         axisSetup(chart);
         drawLayout(chart, false, false);
         setAxis(chart, false, false);
         chart.first = true;
         
       }     
       var dot = (typeof chart.dotSize != 'undefined' &&  chart.dotSize != null) ? chart.dotSize : 4;
         // Add the scatterplot
       for (var i = 0; i < chart.seriesScatterData.length; i++) {
         chart.dot = chart.svg.selectAll("dot") 
                 .data(chart.seriesScatterData[i])   
                 .enter().append("circle")
                 .attr("id",function(d, i){ return chart.id+""+ (chart.x(d.x) + chart.y(d.y)) +"tool" })
                 .attr("class", "scatterLineSrc")
               //  .style("fill", function(d){ return chart.color(i); })
                 .style("fill", function(d){ return d.color==null ? chart.colorOvr(i) : d.color; })
                 .style("stroke", "black")
                 .style("stroke-width", 0.5)
                 .attr("r", dot)
                 .on("mouseover", function(d) {
                   d3.select(this).transition().duration(500).attr("r", 7);               
                   chart.tooltip.style("display", "inline-block")
                     .attr("class","back-shadow tooltip")
                     .html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip)
                   //  .style("word-wrap","break-down"); 
                   var tooltipDot = document.getElementById(chart.id+"tool"); 
                   var rect = document.getElementById(chart.id+""+(chart.x(d.x) + chart.y(d.y)) +"tool");
                   var container = document.getElementById(chart.id);
                   var popperDot = Popper.createPopper(rect, tooltipDot, {
                               placement: 'left',
                             removeOnDestroy: true,
                             modifiers: { flip: { behavior: ['left', 'right','top'] },
                                      preventOverflow: { boundariesElement: container } },
                   });
                   //popperDot.disableEventListeners();
                })
                .on("mouseout", function() {
                  d3.select(this).transition().duration(500).attr("r", dot);
                  chart.tooltip.style("position", "absolute").style("display","none");})
                .attr("cx", function(d, i) { return chart.x(d.x); }).attr("cy", function(d) {  return chart.y(d.y); })
       }
      }
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////// Click handler
// //////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addScatterOrLineClickHandler = function(handlerFunc) {
      this.svg.on("click",  function(d) {
        var elements = document.querySelectorAll(':hover');
        for(var i = 0; i <  elements.length ; i++ ) {
          if(elements[i].tagName == "circle" && elements[i].classList[0] == "scatterLineSrc") {
              var circle = elements[i].__data__;
                    handlerFunc(circle.x, circle.y, circle.name, circle);
            }
        }  
      });
     };
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////// Legend Initiator
// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.legend = function(tileId, series, horizontal) {
      var chartSeries = [];
      (typeof series == 'undefined' || series == null) ? chartSeries = chart.seriesX : chartSeries = series;
     setLegend(tileId, chartSeries, this, horizontal);
    }
     return charts;
});
