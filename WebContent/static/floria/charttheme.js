"use strict";

define(["dojox/charting/SimpleTheme"], function(SimpleTheme){

//  var colors = ["#45b8cc","#8ecfb0","#cc4482","#7f9599","#48c","#00f","#ff0","#0ff","#f0f","#f77","#0f0","#eee"];

//  var colors = ["#AEE8FE","#8ECEFC","#639DF1","#4C78D9","#3657B6","#2A428C","#1A264E","#dedeed","#F2FDFF","#D8F9FF"];
  var colors = ["#AEC7E8", "#FF7F0E", "#2CA02C", "#98DF8A", "#D62728", "#9467BD", "#C5B0D5", "#8C564B", "#C49C94", "#1F77B4"];

//  var defaultFill = {type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100};
//  var t =  new Theme({ chart: { fill: "transparent" }
//                      ,plotarea: { fill: "transparent" }
//                      ,seriesThemes: colors //gradientGenerator.generateMiniTheme(colors, defaultFill, 90, 50, 30) 
//                     });
  
  var t = new SimpleTheme({colors: colors});

  return t;  
});
