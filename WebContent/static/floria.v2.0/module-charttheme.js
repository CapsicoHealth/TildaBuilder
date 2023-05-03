"use strict";

//  var colors = ["#45b8cc","#8ecfb0","#cc4482","#7f9599","#48c","#00f","#ff0","#0ff","#f0f","#f77","#0f0","#eee"];

//  var colors = ["#AEE8FE","#8ECEFC","#639DF1","#4C78D9","#3657B6","#2A428C","#1A264E","#dedeed","#F2FDFF","#D8F9FF"];
//  var colors = ["#AEC7E8", "#C5B0D5", "#D62728", "#98DF8A", "#9467BD", "#2CA02C", "#FF7F0E", "#8C564B", "#C49C94", "#1F77B4"];
//    var colors = ["#1395ba", "#a2b86c", "#0d3c55", "#c02e1d", "#f16c20", "#ebc844"];
    
    var colorSchemes = {
           ClassicBlue7: ['#b4d4da', '#7bc8e2', '#67add4', '#3a87b7', '#1c73b1', '#1c5998', '#26456e']
          ,ColorBlind10: ['#1170aa', '#fc7d0b', '#a3acb9', '#57606c', '#5fa2ce', '#c85200', '#7b848f', '#a3cce9', '#ffbc79', '#c8d0d9']
          ,ClassicColorBlind10: ['#006ba4', '#ff800e', '#ababab', '#595959', '#5f9ed1', '#c85200', '#898989', '#a2c8ec', '#ffbc79', '#cfcfcf']
          ,ClassicGreenBlue11: ['#09622a', '#1e7735', '#2f8e41', '#69a761', '#a2c18f', '#cacaca', '#67add4', '#3a87b7', '#1c73b1', '#1c5998', '#26456e']
          ,ClassicCyclic13: ['#1f83b4', '#12a2a8', '#2ca030', '#78a641', '#bcbd22', '#ffbf50', '#ffaa0e', '#ff7f0e', '#d63a3a', '#c7519c', '#ba43b4', '#8a60b0', '#6f63bb']
          ,Capsico: ["#6facc8", "#95b594", "#f0bea6", "#b7bebd", "#e7bdd1", "#b8d9e5", "#b8d9e5", "#c7fffb", "#c9d9fd", "#c4e8c4"]
          ,Capsico2: ['rgba(255, 99, 132, 0.8)' , 'rgba(255, 159, 64, 0.8)' , 'rgba(255, 205, 86, 0.8)', 'rgba(75, 192, 192, 0.8)' , 'rgba(54, 162, 235, 0.8)'
                     ,'rgba(153, 102, 255, 0.8)', 'rgba(201, 203, 207, 0.8)', 'rgba(255, 99, 172, 0.8)', 'rgba(255, 159, 104, 0.8)', 'rgba(255, 205, 126, 0.8)'
                     ,'rgba(75, 192, 232, 0.8)', 'rgba(54, 182, 255, 0.8)', 'rgba(153, 142, 255, 0.8)', 'rgba(201, 203, 247, 0.8)'
                     ]
            };


//  var defaultFill = {type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100};
//  var t =  new Theme({ chart: { fill: "transparent" }
//                      ,plotarea: { fill: "transparent" }
//                      ,seriesThemes: colors //gradientGenerator.generateMiniTheme(colors, defaultFill, 90, 50, 30) 
//                     });
  
export var ChartTheme = {colorSchemes: colorSchemes
                        ,colors: colorSchemes.Capsico
                        };
