"use strict";



define(["floria/textutil", "floria/superdom", "floria/charttheme", "floria/propper"], function(FloriaText, SuperDOM, Colors, Popper)
{
	var charts = {};
	var globalLegend = {};
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////// Legend Logic
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function setLegend(tileId, data, current, horizontal, pie, offsetValue){

		var chart = current;
		var e = SuperDOM.getElement(tileId);
		var offset = (typeof offsetValue == 'undefined' || offsetValue == null) ? 40 : offsetValue;
		
		var svgLegned4 = d3.select("#"+tileId).append("div")
						.attr("width" , "100%")
						.style("position", "relative");
						//.style("margin", "0 auto");

		chart.legend4 = svgLegned4;
		
		if(horizontal){
			
			for (var i = 0; i < data.length; i++) {
				chart.legend4.append('div')
			    .style("background-color", chart.color(i))
			    .style("float", "left")
			    .style("width", "13px")
			    .style("height", "15px")
			    	
			   chart.legend4.append('div')
			   	.style("height", "10px")
			    .style("float", "left")
				.text(data[i])
			    .style("font-family", "Lato")	
			    .style("font-size", "14px")
				.style("padding","0px 5px 1px 5px")
				
			}
			if(chart.subscribable){
				globalLegend = chart.legend4;
			}
			
		}else{	
			for (var i = 0; i < data.length; i++) {
				chart.legend4.append('div')
			    .style("background-color", chart.color(i))
			    .style("float", "left")
			    .style("width", "13px")
			    .style("padding-bottom", "15px")
			     
			   chart.legend4.append('div')
			   	.style("height", "10px")
				.text(data[i])
			    .style("font-family", "Lato")
			    .style("font-size", "14px")
			    .style("padding-bottom", "15px")
			}
			if(chart.subscribable){
				globalLegend = chart.legend4;
			}
		 }
	}
	
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// Pie chart \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////3d chart functions for all angles
	function pieTop(chart, d, rx, ry, ir ){
  		console.log("Pie Top slice");
  		console.dir(d);
		var startAngle = (typeof d.startAngle == 'undefined' )? 3.14 : d.startAngle;
		var endAngle = (typeof d.endAngle == 'undefined' )? 3.14 : d.endAngle.toFixed(10);
		var scos = Math.cos(startAngle), ssin = Math.sin(startAngle), ecos = Math.cos(endAngle), esin = Math.sin(endAngle);

		if(d.endAngle - d.startAngle == 0 ) return "M 0 0";
		var sx = rx*scos,
			sy = ry*ssin,
			ex = rx*ecos,
			ey = ry*esin;
		
		var ret =[];
		ret.push("M",sx,sy,"A",rx,ry,"0",(endAngle-startAngle > Math.PI? 1: 0),"1",ex,ey,"L",ir*ex,ir*ey);
		ret.push("A",ir*rx,ir*ry,"0",(endAngle-startAngle > Math.PI? 1: 0), "0",ir*sx,ir*sy,"z");
		
		return ret.join(" ");
	}

	function pieOuter(d, rx, ry, h ){
		console.log("Pie Outer slice");
  		console.dir(d);
		var startAngle = (typeof d.startAngle == 'undefined' )? 3.14 : (d.startAngle > Math.PI ? Math.PI : d.startAngle);
		var endAngle =  (typeof d.endAngle == 'undefined' )? 3.14 : (d.endAngle > Math.PI ? Math.PI : d.endAngle.toFixed(10));
		
		var sx = rx*Math.cos(startAngle),
			sy = ry*Math.sin(startAngle),
			ex = rx*Math.cos(endAngle),
			ey = ry*Math.sin(endAngle);
			
		var ret =[];
		ret.push("M",sx,h+sy,"A",rx,ry,"0 0 1",ex,h+ey,"L",ex,ey,"A",rx,ry,"0 0 0",sx,sy,"z");
		var logThis = ret.join("");
		console.log
		
		return ret.join(" ");
	}

	function pieInner(d, rx, ry, h, ir ){
  		console.log("Pie Inner slice");
  		console.dir(d);
  		console.log(d.endAngle.toFixed(10));
		var startAngle = (typeof d.startAngle == 'undefined' )? 3.14 : (d.startAngle < Math.PI ? Math.PI : d.startAngle);
		var endAngle = (typeof d.endAngle == 'undefined' )? 3.14 :  (d.endAngle < Math.PI ? Math.PI : d.endAngle.toFixed(10));
		
		var sx = ir*rx*Math.cos(startAngle),
			sy = ir*ry*Math.sin(startAngle),
			ex = ir*rx*Math.cos(endAngle),
			ey = ir*ry*Math.sin(endAngle);

		var ret =[];
		ret.push("M",sx, sy,"A",ir*rx,ir*ry,"0 0 1",ex,ey, "L",ex,h+ey,"A",ir*rx, ir*ry,"0 0 0",sx,h+sy,"z");
		
		return ret.join(" ");
	}

	function getPercent(d){
		return (d.endAngle-d.startAngle > 0.2 ? Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2))/10+'%' : '');
	}	
	
/////////////pie chart initiater	
	charts.PieChart = function(tileId, isDonut, isLabelInside)
     {
 		var chart = this;
 		chart.tileId = tileId;
		var e = SuperDOM.getElement(tileId);
		chart.isDonut = isDonut;
		chart.legend4;
		chart.isLabelInside = isLabelInside;
		
		var margin = {top: 10, right: 40, bottom: 10, left: 40};
 		// /////measurements
		chart.width = e.offsetWidth * 0.95; //- margin.left - margin.right,
		chart.height = e.offsetHeight; //- margin.top - margin.bottom;
 		chart.radius = Math.min((chart.width * 0.8), (chart.height * 0.8)) / 2; //Math.min(chart.width - (chart.width * 0.2), chart.height - (chart.height * 0.2)) / 2;

 		chart.color = d3.scaleOrdinal().range(Colors.colors); 
	 	
 		///radius of all the pie charts 
 		var arcOuterRadius = chart.radius - 10,
 		arcInnerRadius = chart.radius - 30,
 		
 		arcOverOuterRadius = chart.radius - 5,
 		arcOverInnerRadius = chart.radius - 30;
 		
 		chart.arcInnerOuterRadius = chart.radius - 30;
 		chart.arcInnerInnerRadius = chart.radius - 35;
 		
	 	chart.pie = d3.pie()
	 	    		.sort(null)
	 	    		.value(function(d){return +d.y;});
	 	if(isDonut)
	 		chart.pie.padAngle(.02);
	 	
	 	chart.svg =  d3.select("#"+tileId )	
	 					.append("svg")
	 					.attr("id", tileId+"svg")
	 					.attr("width", chart.width+"px")
	 					.attr("height", chart.height+"px")
	 				//	.style("margin", "0 "+chart.maxtxtlength+"px auto")

	 					.style("margin", "0 auto")
	 					//.style("padding-top", "1%")
	 					.append("g")
	 					.attr("transform", "translate(" + ( ( (chart.width) / 2)) + "," + (chart.height) / 2 + ")");
	 	
	 	chart.tooltip = d3.select("#"+tileId)
	 					  .append("rect")
	 					  .attr("id",chart.tileId+"tool")
	 					  .attr("class" , "tooltip")
	 					  .attr("width", chart.width)
	 					  .attr("height", chart.height)
	 					  .style("position", "absolute")
	 					  .style("display", "none")
	 					  .style("padding","5px 5px 5px 5px")
	 					  .style("background-color","white")
	 					  .style("font-family", "Lato")
     }
     
     charts.PieChart.prototype.addSeries = function(seriesName, seriesData, innerPercentage, innerPercentageFontSize)
     {
  		var chart = this;
  		var isSeriesEmpty = false;
  		var count = 0;

  		for ( var i = 0; i < seriesData.length; i++ ) {
  			seriesData[i]["name"] = seriesName; 
  			if(seriesData[i]["y"] == "0" || isNaN(seriesData[i]["y"])){
  				count++; 
  			}
  		}
  		if(seriesData.length == count){
  	  		 isSeriesEmpty = true;	
  		}
  		chart.isSeriesEmpty = isSeriesEmpty;
    	chart.series = seriesData;
    	chart.innerPercentage = innerPercentage;
    	chart.innerPercentageFontSize = ( typeof innerPercentageFontSize != "undefiend" && typeof (+innerPercentageFontSize) == "integer") ? innerPercentageFontSize : 20
     }
     
     charts.PieChart.prototype.draw3d = function()
	 {
  		var chart = this;
  		var maxtxtlength = 0;

  		for ( var i = 0; i < chart.series.length; i++ ) {
	  		if(maxtxtlength < chart.series[i].text.length){
					maxtxtlength = chart.series[i].text.length;
			}
  		}
  		chart.radius = chart.radius - maxtxtlength;
  		var rx = chart.radius - 15, 
  		    ry = chart.radius - 25, 
  		    h = 10, 
  		    ir = 0.8;
  		
  		var hrx = chart.radius - 13, 
		    hry = chart.radius - 23, 
		    hh = 10, 
		    hir = 0.75;
  		
  		chart.is3d = true;
  		console.log("Radius: "+chart.radius+" rx : ry "+rx+" : "+ry);	
  	if(chart.series == null || typeof chart.series == undefined || chart.isSeriesEmpty){
			
		chart.svg.append("text").html("No data available")
			.style("margin", "0 auto")
			.style("font-size", "18px")
			.style("font-weight", "bold")
			.style("padding","5px 5px 5px 5px")
            .style("word-wrap","break-down")
  			.attr("align","absmiddle")
  			
  		chart.svg
	  		.append("image")
	  		.attr("xlink:href", "/static/img/warning.gif")
	  		.attr("height","50px")
	  		.attr("width","50px")
	  		.attr("x","-60")
	  		.attr("y","-34")
  			 			
  	}else{
  		(chart.series.length == 1) ? chart.series.push({
  			"tooltip":"",
  			"text":"",
  			"y":"0"}) :chart.series;
  			

  		var pieChartData = chart.pie(chart.series);
  		var chartsInner = chart.svg.selectAll(".innerSlice")
	    	.data(pieChartData)
	    	.enter()
	    	.append("path")
	      	.attr("class", "innerSlice")
	      	.style("fill", function(d, i) { return d3.hsl(chart.color(i)).darker(0.7); })
	      	.attr("d",function(d){return pieInner(d, rx+0.5,ry+0.5, h, ir);})
	      	.each(function(d){this._current=d;});
  		
  		var chartsTop = chart.svg.selectAll(".outerSlice")
			.data(pieChartData)
			.enter()
			.append("path")
			.attr("class", "outerSlice")
			.style("fill", function(d, i) { return d3.hsl(chart.color(i)).darker(0.7); })
			.attr("d",function(d){return pieOuter(d, rx-.5,ry-.5, h);})
			.each(function(d){this._current=d;})
				
  		chart.topchart = chart.svg.selectAll(".topSlice")
			.data(pieChartData)
			.enter()
			.append("path")
			.attr("id",function(d, i){return chart.series[i].tooltip+"topSlice";})
			.attr("class", "topSlice")
			.style("fill", function(d, i) { return chart.color(i); })
			.style("stroke", function(d, i) { return chart.color(i); })
			.attr("d",function(d){ return pieTop(chart, d, rx, ry, ir);})
			.on("mouseover", function(d, i) {
            	d3.select(this).transition()
	               .duration(500)
             	   .attr("d",function(d){ return pieTop(chart, d, hrx, hry, hir);})
	               .style("fill","#FA8072").style("stroke", "#FA8072");
            		
            	d3.select(chartsInner._groups[0][i]).transition()
	               .duration(500)
	               .attr("d",function(d){ return pieInner(d, hrx+0.5,hry+0.5, hh, hir);})
	               .style("fill",d3.hsl("#FA8072").darker(0.7));
            	
            	d3.select(chartsTop._groups[0][i]).transition()
	               .duration(500)
	               .attr("d",function(d){ return pieOuter(d, hrx-.5,hry-.5, hh);})
	               .style("fill",d3.hsl("#FA8072").darker(0.7));
            	
            ////////////highlighting the text/////////////
//            	if(chart.subscribable){
//            		d3.select(globalLegend._groups[0][i]).transition()
//	            		.duration(500)
//	            		.style("fill",d3.hsl("#FA8072").darker(0.7));
//            	}else {
//	            	d3.select(chart.legend4._groups[0][i]).transition()
//	            		.duration(500)
//	            		.style("fill",d3.hsl("#FA8072").darker(0.7));
//            	}
            var txt = d.data.tooltip;
            console.log("the data tooltip txt is :");
            console.dir(txt);
           if(txt != ""){
            chart.tooltip.style("display", "inline-block")
	      		.attr("class","back-shadow")
	      		.html(d.data.tooltip)
                .style("padding","5px 5px 5px 5px")
                .style("word-wrap","break-down");
            	
            	var tooltip = SuperDOM.getElement(chart.tileId+"tool"); 
	      		var rect = SuperDOM.getElement(chart.series[i].tooltip+"topSlice") ;
	      		var container = SuperDOM.getElement(chart.tileId);      		

      			var popper = new Popper(rect, tooltip, {
	      		    placement: 'left',
    	      		  modifiers: {
    	      	        flip: {
    	      	            behavior: ['left', 'bottom','top']
    	      	        },
    	      	        preventOverflow: {
    	      	            boundariesElement: container,
    	      	        },
    	      	    },
	      		});
      			console.log(" popper :"+popper); 
			}
      			
             })
             .on("mouseout", function(d, i) {
            	d3.select(this).transition()
	               .duration(500)
	               .attr("d",function(d){ return pieTop(chart, d, rx, ry, ir);})
	               .style("fill", function(d) { return chart.color(i); })
	               .style("stroke", function(d) { return chart.color(i); });
            		
            	d3.select(chartsInner._groups[0][i]).transition()
	               .duration(500)	      	
	               .attr("d",function(d){ return pieInner(d, rx+0.5,ry+0.5, h, ir);})
	               .style("fill", d3.hsl(chart.color(i)).darker(0.7));

            	
            	d3.select(chartsTop._groups[0][i]).transition()
	              .duration(500)
	              .attr("d",function(d){ return pieOuter(d, rx-.5,ry-.5, h);})
	              .style("fill", d3.hsl(chart.color(i)).darker(0.7));
	              
            chart.tooltip.style("position", "absolute")
				  .style("display", "none");
            	 
//            	 if(chart.subscribable){
//            		 d3.select(globalLegend._groups[0][i]).transition()
//             		  .duration(500)
//             		  .style("fill", "black");
//            	 } else{
//            		 d3.select(chart.legend4._groups[0][i]).transition()
//             		  .duration(500)
//             		  .style("fill", "black");
//            	 }
//            	
             })
  			
  		chart.textLines = chart.svg.selectAll(".line1")
				  			.data(chart.pie(chart.series))
				  			.enter()
				  			.append("line")
				  			.attr("class", "line1")
				  			.attr("x1",function(d){ return (d.value == 0)? 0: 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
				  			.attr("y1",function(d){ return (d.value == 0)? 0: 1*ry*Math.sin(0.5*(d.startAngle+d.endAngle));})
				  			.attr("x2",function(d){
				  					var	x = 1.3*rx*Math.cos(Math.atan2(0.9*rx*Math.sin(0.5*(d.startAngle+d.endAngle)), 1*ry*Math.cos(0.5*(d.startAngle+d.endAngle))));  				
				  					return (d.value == 0)? 0: x;})
				  			.attr("y2",function(d){ 			
				  					var	y = 1.3*ry*Math.sin(Math.atan2(0.9*ry*Math.sin(0.5*(d.startAngle+d.endAngle)), 1*rx*Math.cos(0.5*(d.startAngle+d.endAngle))));
				  					return (d.value == 0)? 0:y;})
				  			.style("stroke","black");
  		
		var sign;
		var labelX;
  		chart.textLabels =	chart.svg.selectAll(".percent")
					  			.data(chart.pie(chart.series))
					  			.enter()
					  			.append("text")
					  			.attr("class", "percent")
					  			.attr("x",function(d){
					  				var txt = d.data.text.toString();
					  				var tile = chart.tileId+"svg";
					  				if(d.value == 0)
					  					return 0;
					  						
					  				var	x = 1.3*rx*Math.cos(Math.atan2(0.9*rx*Math.sin(0.5*(d.startAngle+d.endAngle)), 1*ry*Math.cos(0.5*(d.startAngle+d.endAngle))));  	
					  				return x + 5;
					  			})
					  			.attr("y",function(d){ 
					  				var	y = 1.3*ry*Math.sin(Math.atan2(0.9*ry*Math.sin(0.5*(d.startAngle+d.endAngle)), rx*Math.cos(0.5*(d.startAngle+d.endAngle))));	
					  				y = ( y > 0 ) ? y : y;
					  				return (d.value == 0)? 0: y;
					  			})
					  			.text(function(d){ return(d.value == 0)? "": d.data.text;})
					  			.style("font-size", "11px")
					  			.style("text-anchor", function(d){
					  				var	x = 1.3*rx*Math.cos(Math.atan2(0.9*rx*Math.sin(0.5*(d.startAngle+d.endAngle)), 1*ry*Math.cos(0.5*(d.startAngle+d.endAngle))));  	
					  				var restrict = Math.abs(x) > (chart.width*0.5 *0.7) ? true : false;
					  				
					  				if(x>0 && !restrict){
					  					return "start";
					  				}else if(restrict){
					  					return "middle";
					  				}else{
					  					return "end";
					  				}
					  			})
					  			.style("padding","5px 5px 5px 5px");
  	}
  		var alpha = 4, spacing = 45 , again , a , da, y1, b, db, y2, deltaY, adjust, sign; // params for anti collision
  			
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
  				
  		    chart.textLines.attr("y2",function(d,i) {
	  		    if(labelElements[i].attributes.y.value == 0 || labelElements[i].attributes.x.value == 0)
	  		      return 0;
  			    return (labelElements[i].attributes.y.value > 0 ) ? (labelElements[i].attributes.y.value - 10) : (labelElements[i].attributes.y.value + 12);
		    });
  			    
		    setTimeout(adjust,1000)
		   }
		}
  		
  		if(!chart.isSeriesEmpty  && chart.isSeriesEmpty != undefined){
  			console.log("entered when isSeriesEmpty is false  "+chart.isSeriesEmpty);
	  		adjust();
	  			
	  		chart.textLabels.append("title") /// to center the text in a pie chart
	  			.attr("dy", ".35em")
				.attr("text-anchor", function(d) { return (d.endAngle + d.startAngle)/2 > Math.PI ? "end" : "start"; })
				.html(function(d, i) { return (d.value == 0)? "": d.data.tooltip; })
				.style("text-anchor", "end")
			//	.style("font-size", "8px")
				.style("font-family", "Lato")
			    .style("padding","5px 5px 5px 5px");
	
	  		///This code calculates inner font percentage, probably be used in the future
	  		/*var innerFont = 10;
	  		if(rx > chart.innerPercentage.length){
	  			innerFont = ((rx) / chart.innerPercentage.length) ;
			}else{
				innerFont = 8*( chart.innerPercentage.length.length / (3/2*rx));
			}*/
	  		
	  		chart.svg.append("text")
				.attr("class", "percent").text(chart.innerPercentage)
				.style("text-anchor", "middle")
				//part of the inner font code
		        //.style("font-size", innerFont+"px").attr("x", 0).attr("y", 10);
				.style("font-size", chart.innerPercentageFontSize)
				.style("font-family", "Lato")
				.style("padding","5px 5px 5px 5px")
				.attr("x", 0)
				.attr("y", 10);
	
	  			
	  		chart.legendData = [];
	  	    for (var i = 0; i < chart.series.length; i++) {
	  	    	if(typeof chart.series[i].legend != "undefined" )
	  	    		chart.legendData[i] = chart.series[i].legend;
	  	    }
  		}
  		
	 }
     charts.PieChart.prototype.addClickHandler = function(handlerFunc)
	 { 
    	 var chart = this;    	 
    	 if(chart.is3d){
    		 chart.svg.on("click",  function(d) {
  				var elements = document.querySelectorAll(':hover');
  				var len = elements.length - 1 ;
                handlerFunc(elements[len].__data__.index, elements[len].__data__.data,elements[len].__data__.data.name, elements[len].__data__.data, elements[len]);
      	    });
    	 }else{
    		 chart.g.on("click",  function(d) {
 				var elements = document.querySelectorAll(':hover');
                handlerFunc(d.index, d.data, d.data.name, d, elements[15]);
     	    });
    	 }
     };
     
     charts.PieChart.prototype.subscribable = function(){
    	 var chart = this;
    	 chart.subscribable = true;
     }
          
     charts.PieChart.prototype.legend = function(tileId, series, horizontal, height, width){
		var chart = this;
 	 	setLegend(tileId, chart.legendData, chart, horizontal, true);
     }
     
// ////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////// Other used resources
// ///////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////
     var contains = function(hay) {
    	    // Per spec, the way to identify NaN is that it is not equal to
	    // itself
    	var findNaN = hay !== hay;
    	var indexOf;

    	if(!findNaN && typeof Array.prototype.indexOf === 'function') {
    		indexOf = Array.prototype.indexOf;
    	} else {
    		indexOf = function(hay) {
    	    var i = -1, index = -1;

    	    for(i = 0; i < this.length; i++) {
    	    	var item = this[i];

    	        if((findNaN && item !== item) || item === hay) {
    	        	index = i;
    	            break;
    	         }
    	     }

    	     return index;
    	    };
    	 }

    	  return indexOf.call(this, hay) > -1;
    	};

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////// Chart basic setup functions
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function axisSetup(chart){
    	
    	chart.maxXLayout = 0;
    	chart.maxYLayout = 0;
    	
    	if(chart.horizontal){
    		if(chart.XaxisAvailable){
    			chart.seriesY = chart.seriesY.map(function(values){ 
    				var valueTransform = chart.xLabelFunction(values);
    	    		if(chart.maxXLayout < valueTransform.length)
    	    			chart.maxXLayout = valueTransform.length;
    	    		return valueTransform});
        	}
        	
        	if(chart.YaxisAvailable){
    	    	chart.seriesX = chart.seriesX.map(function(values){ 
    	    		var valueTransform = chart.yLabelFunction(values);
    	    		if(chart.maxYLayout < valueTransform.length)
    	    			chart.maxYLayout = valueTransform.length;
    	    		return valueTransform});
        	}
    	}else{
	    	
	    	if(chart.XaxisAvailable){
		    	chart.seriesX = chart.seriesX.map(function(values){ 
		   // 		var valueTransform = (chart.xLabelFunction(values)=="N/A"?values:chart.xLabelFunction(values));
		    		var valueTransform = chart.xLabelFunction(values);
		    		if(chart.maxXLayout < valueTransform.length)
		    			chart.maxXLayout = valueTransform.length;
		    		return valueTransform});
	    	}
	    	
	    	if(chart.YaxisAvailable){
		    	chart.seriesY = chart.seriesY.map(function(values){ 
		    	//	var valueTransform = (chart.yLabelFunction(values)=="N/A"?values:chart.yLabelFunction(values));
		    		var valueTransform = chart.yLabelFunction(values);
		    		if(chart.maxYLayout < valueTransform.length)
		    			chart.maxYLayout = valueTransform.length;
		    		return valueTransform});
	    	}
    	}
    	
    }
    
    function mainLayout(chart){
        var e = SuperDOM.getElement(chart.id);
       chart.margin = {top: 30, right: 20, bottom: (50+(chart.maxXLayout+20)), left: (50+chart.maxYLayout+25), front: 0, back: 0};
         chart.width = e.offsetWidth - chart.margin.left - chart.margin.right,
         chart.height = e.offsetHeight - chart.margin.top - chart.margin.bottom;
         chart.depth = 100 - chart.margin.front - chart.margin.back;
         chart.padding = 100;
         
        // Adds the svg canvas
      chart.main = d3.select("#"+chart.id)
          .append("svg")
          .attr("width", chart.width + chart.margin.left + chart.margin.right)
          .attr("height", chart.height + chart.margin.top + chart.margin.bottom);
      
      chart.svg = chart.main.append("g")
		.attr("id",chart.id+"group")
		.attr("width", chart.width)
		.attr("height", chart.height)
		.style("pointer-events", "all")
		.attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");
   	 
      chart.color = d3.scaleOrdinal().range(Colors.colors); 			  
    }
    
    function drawLayout(chart, type, horizontal){
     	
    	mainLayout(chart);
    	
     	if(chart.height < 0){
     		chart.height = chart.width / 2.40;
     	}
     	
     	// Set the ranges
		if(type && (typeof horizontal == "undefined" || horizontal == null || horizontal == false))
	    	chart.x = d3.scaleBand().range([0, chart.width]);
		else 
			chart.x = d3.scaleLinear().range([0, chart.width]).nice();
		
 		if(horizontal)
	    	chart.y = d3.scaleBand().range([chart.height, 0]);
 		else
 			chart.y = d3.scaleLinear().range([chart.height, 0]).nice();
 		

 		// Define the line
 		chart.valueline = d3.line().x(function(d) { return chart.x(d.x); })
 			    			.y(function(d) { return chart.y(d.y); });
 		

 		chart.tooltip = d3.select("#"+chart.id)
						  .append("div").attr("id", chart.id+"tool")
						  .attr("class" , "tooltip")
						  .style("position", "absolute")
						  .style("display", "none")
						  .style("background", "white")
    }
    
    function setAxis(chart, type, horizontal){
    	
    	var maxLabelLength = 0;
    	
    	chart.main.append("text")
	        .attr("text-anchor", "end")
	        .style("bottom", 0)
	        .style("right", 0)
	        .style("left", 100)
	        .attr("transform", "translate("+ ((chart.padding/2) + (chart.yTitle.length))+","+20+")rotate(0)")  
	        .text(chart.yTitle)
	        .style("font-family", "Lato")
 			.style("padding","5px 5px 5px 5px")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 20)
	        .attr("x", -10);
    	
    	if(chart.XaxisAvailable){
	    	chart.main.append("text")
	        	.attr("text-anchor", "end")
	        	.attr("transform", "translate("+ (chart.width+ chart.margin.left  + chart.margin.right - (chart.xTitle.length*4)) +","+(chart.height + chart.margin.top + chart.margin.bottom-10)+")")
	        	.text(chart.xTitle)
	        	.style("font-family", "Lato")
	        	.style("padding","5px 5px 5px 5px");
	 		chart.xAxis = d3.axisBottom(chart.x)
	 						.ticks(chart.seriesX.length)
	 						.tickSize(-chart.height,1,1)//.ticks((chart.width + 2) / (chart.height + 2) * 10)
	 						.tickPadding(10)
	 						.tickFormat(function(d, i) {
	 							return chart.xLabelFunction(d); 
	 							});
    	}else{
    		chart.xAxis = d3.axisBottom(chart.x)
							.ticks((chart.width + 2) / (chart.height + 2) * 10).tickSize(-chart.height,1,1)
							.tickPadding(10).tickFormat(function(d, i) { return ""; });
    	}
    	
 		if(horizontal)
 			chart.x.domain([0, d3.max(chart.yDomain, function(d) { return d; })]);
 		else if(type)
 			chart.x.domain(chart.xDomain);
 		else
 			chart.x.domain(d3.extent(chart.xDomain, function(d) { return d; }));

 		chart.svg.append("g")
	     	.attr("class", "x axis")
	     	.attr('id', "axis--x")
	     	.attr("transform", "translate(0," + chart.height + ")")
	     	.call(chart.xAxis)
	     	.selectAll("text")
	     	.attr("dx", "-.8em")
	     	.attr("dy", ".15em")
	     	.style("text-anchor", "end")
	     	.attr("transform", "rotate("+(-45)+")")
	     	.style("text-anchor", "end")
	     //	.style("font-size","10px")
	     	.style("font-family", "Lato")
		    .style("padding","5px 5px 5px 5px");
		
 		chart.yAxis = d3.axisLeft(chart.y)
 						.ticks(10)
 						.tickPadding(10)
 						.tickSize(-chart.width,0,0)
 						.tickFormat(function(d) { return chart.yLabelFunction(d); });
 		
 		if(horizontal)
 			chart.y.domain(chart.xDomain.map(function(d) { return d; }));
 		else if(chart.max == "undefined" || chart.max == null){
 			chart.y.domain([0 , chart.undefinedMax]);
 		} else 
 			chart.y.domain([chart.min, chart.max]);
 	 	   
 	 	chart.svg
 	 		.append("g")
 		 	.attr("class", "y axis")
 		    .call(chart.yAxis).selectAll("text")
 		    .style("text-anchor", "end")
 		//    .style("font-size", "10px")
 		    .style("font-family", "Lato")
 		    //.style("padding","5px 5px 5px 5px");
    }
    
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////// Chart initiators
// ///////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase = function(id)
    {
 		var chart = this;	
 		chart.id = id;
		chart.seriesX = [],  chart.seriesY = [], chart.max = 0;
		chart.seriesLineData = [];
		chart.seriesScatterData = [];
		chart.seriesbarData = [];
		chart.type = [];
 		chart.undefinedMax = 0;
 		chart.seriesArray = [];
 		chart.series = [];
 		chart.first = false;
    }
   
   charts.ChartBase.prototype.setXAxis = function(title, labelFunction, labelAngle, diffAxis, LabelFontSize)
   {
  	 	var chart = this;
  	 	chart.xTitle = title;
  	 	chart.xLabelFunction = labelFunction;
  	 	chart.xDiffAxis = diffAxis;
  	 	chart.xLabelAngle = labelAngle;
  	 	chart.XaxisAvailable = true;
   }
   
   charts.ChartBase.prototype.setYAxis = function(title, labelFunction, min,  max, labelAngle, diffAxis, LabelFontSize)
   {	
  	 	var chart = this;
  	 	chart.yTitle = title;
	 	chart.yLabelFunction = labelFunction;
	 	chart.yDiffAxis = diffAxis;
	 	chart.yLabelAngle = labelAngle;
	 	chart.min = min;
	 	chart.max = max;
  	 	chart.YaxisAvailable = true;
   }
   
 // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 // /////////////////////////// Line series and plotter
    // ///////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addLineSeries = function(seriesName, seriesData, overrideColor, tooltip, tunerLabel, tunerValue)
    {	
    	console.dir("entered in to addLineSeries");
    	console.dir("the seriesName is "+seriesName);
    	console.dir("the seriesData  is "+seriesData);
    	var chart = this;
	    chart.xDomain = [];
	    chart.yDomain = [];
	    chart.seriesXY = []
		chart.seriesArray = [];
	    chart.tunerlabel = tunerLabel;
	    chart.tunerValue = tunerValue;
	    
	    if(overrideColor != "undefined" && overrideColor != null && overrideColor != []){
	    	chart.colors = overrideColor;
	    }
	    
		if(typeof seriesData[0] == 'object'){
			
		    seriesData.forEach(function(d, i){
		      seriesData[i].x = (typeof +d.x == 'undefined' ? i : +d.x);
		      seriesData[i].name = seriesName;
		      chart.xDomain[i] = +d.x;
		      seriesData[i].y = +d.y;
		      chart.yDomain = +d.y;
		      chart.seriesX[i] = seriesData[i]["x"];
		      chart.seriesY[i] = seriesData[i]["y"];
		      
		      if(chart.undefinedMax < +seriesData[i]["y"])
					chart.undefinedMax = +seriesData[i]["y"];
		    })
		    chart.seriesLineData.push(seriesData);
		    
	    }else{
	    	
	    	seriesData.forEach(function(d, i){
	    		
	    		chart.seriesArray.push({
	    			"x":+i,
					"y":+seriesData[i],
					"name":seriesName,
					"tooltip" : ( typeof tooltip == 'undefined' ||  tooltip == null) ? null : tooltip[i]
				});
	    		
				chart.xDomain[i] = +i;
				chart.yDomain[i] = +seriesData[i];
				chart.seriesX[i] = chart.seriesArray[i]["x"];
				chart.seriesY[i] = chart.seriesArray[i]["y"];
				chart.series[i] = +chart.seriesArray[i]["y"];
				
				if(chart.undefinedMax < +seriesData[i])
						chart.undefinedMax = +seriesData[i];
	    	})
		    chart.seriesLineData.push(chart.seriesArray);
	    }
		
	    chart.type.push("Line");
    }
    
    charts.ChartBase.prototype.drawLine = function()
	 {
		var chart = this;
		
		if(!chart.first){
 	   		axisSetup(chart);
 	   		drawLayout(chart, false, false);
 	   		setAxis(chart, false, false);
			chart.first = true;
 	    }
		
		chart.tooltipFloating = d3.select("#"+chart.id)
							  .append("rect")
							  .attr("id" , chart.id+"tooltip-floating")
							  .attr("class" , "tooltip-floating")
							  .style("position", "absolute")
							  .style("display", "none")
							  .style("background", "white")
							  .style("font-family", "Lato")
							  .style("padding","5px 5px 5px 5px")

		chart.Line = chart.svg.append("g");
		var mouseG = chart.svg.append("g")
							.attr("class", "mouse-over-effects"+chart.id)
		
			mouseG.append("path") // this is the black vertical line to follow mouse
			      .attr("id", chart.id+"mouse-line")
				  .attr("class", "mouse-line"+chart.id)
			      .style("stroke", "black")
			      .style("stroke-width", "1px")
			      .style("opacity", "1");	
		 		
		chart.dot = chart.svg.selectAll("dot");
		var lines = null;
	    for (var i = 0; i < chart.seriesLineData.length; i++){		
		   chart.Line.append("path")
					 .attr("class", "line plot"+chart.id)
					 .style('stroke-width', 2)
					 .style("stroke", function(d){ return chart.color(i); })
					 .style("pointer-events", "all")
					 .attr("d", chart.valueline(chart.seriesLineData[i]));
			    
		   var mousePerLine = mouseG.selectAll('.mouse-per-line'+chart.id)
						      	.data(chart.seriesLineData)
						      	.enter()
						      	.append("g")
						      	.attr("class", "mouse-per-line"+chart.id);
		   		
		   mousePerLine.append("circle")
				.attr("r", 7)
				.style("stroke", function(d, i) {
					return chart.color(i); })
				.style("fill", "none")
				.style("stroke-width", "1px")
				.style("opacity", "0");
		   var popper;
		   var tooltip;
		 //  mousePerLine.append("text").attr("transform", "translate(10,3)");
		   mouseG.data(chart.seriesLineData[i]).append('rect')
		   		.attr('width', chart.width)
				.attr('height', chart.height)
				.attr('fill', 'none')
				.attr('pointer-events', 'all')
				.on("mousemove",function(d,z){
				      	 //var mouse = (d3.mouse(this)[0]);
				      	 var x0 = chart.x.invert(d3.mouse(this)[0]);
				      	 var mouse = chart.x(x0.toFixed(0));
						
						 var dataString = "";
						 var position  = null;
						 
						 tooltip = document.getElementById(chart.id+"tooltip-floating"); 
				          if(tooltip == null){
				            	chart.tooltipFloating = d3.select("#"+chart.id)
								  .append("rect")
								  .attr("id" , chart.id+"tooltip-floating")
								  .attr("class" , "tooltip-floating")
								  .style("position", "absolute")
								  .style("display", "none")
								  .style("background", "white");
				          }
				            
						 var block = chart.tooltipFloating
	            		 				.attr("class","back-shadow")
						 				.style("display","block")
						 				.style("color",function(d,i){return chart.color(d);});
						 if(tooltip == null){
				            	tooltip = document.getElementById(chart.id+"tooltip-floating"); 
						 }
				         d3.select(".mouse-line"+chart.id)
				         	.attr("d", function() {
				         		var d = "M" + mouse + "," + chart.height;
				         		d += " " + mouse + "," + 0;
				         		return d; });	     
				         
				         d3.selectAll(".mouse-per-line"+chart.id)
				         	.attr("transform", function(d, i) {
				         		var beginning = 0,
				                end = (typeof lines[i] == 'undefined') ? chart.width : lines[i].getTotalLength(),
				                target = null;
				         		while (true){
				         			target = Math.floor((beginning + end) / 2);
				         			var pos =(typeof lines[i] == 'undefined') ? chart.height : lines[i].getPointAtLength(target);
				         			if ((target === end || target === beginning) && pos.x !== mouse) {
				         				break;
				         			}
				         			if (pos.x > mouse)      end = target;
				         			else if (pos.x < mouse) beginning = target;
				         			else break; //position found
				         		}
				         		var currentData = chart.seriesLineData;
			            	   
				               if(typeof pos.y == "undefined"){
				            	   d3.select(this).remove();
				               }  else {
				            	   var index = chart.x.invert(pos.x).toFixed(0);	   
				            	   var tuner = (typeof chart.tunerlabel == 'undefined') ? "": chart.tunerlabel;
				                    var tunerValue = (typeof chart.tunerValue == 'undefined') ? "": chart.tunerValue;
//				                    dataString += " <div style='color : "+chart.color(i)+";'> "+tuner+" "+ currentData[i][0].name + "   : " +tunerValue+""+ chart.y.invert(pos.y).toFixed(0) 
//				                    +"</div><br style='line-height :  0px;'>";	
				                  var xindex = chart.x.invert(pos.x).toFixed();
				                  var tunerValue = "";
				                  for (var n = 0; n < currentData[i].length; n++) {
				                	  if(currentData[i][n].x == xindex){
				                		  tunerValue = currentData[i][n].tooltip == null ? currentData[i][n].y : currentData[i][n].tooltip;
				                	  }
				                  }
					             // var tunerValue = currentData[i][+xindex].tooltip == null ? currentData[i][+xindex].y : currentData[i][+xindex].tooltip;
				            	    dataString += " <div style='color : "+chart.color(i)+";'>  "+tunerValue 
				                    +"</div>";
				            	   d3.select(this).select('text').text(chart.y.invert(pos.y).toFixed(0));
					               return "translate(" + mouse + "," + pos.y +")";

				              }
				            })
				            
				            block.html(dataString)
			                 	.style("stroke-width","2px")
			                 	.style("padding","5px 5px 5px 5px")
			                 	.style("word-wrap","break-down")
			                 	.style("border","1px")
			                 	.style("stroke","black");
				         
				            
		    	      		var rect = document.getElementById(chart.id+"mouse-line");
		    	      		var container = document.getElementById(chart.id);
		    	      		
	    	      			popper = new Popper(rect, tooltip, {
		    	      		    placement: 'left-start',
		    	      		    removeOnDestroy: true,
		    	      		    
			    	      		modifiers: {
			    	      	        flip: {
			    	      	            behavior: ['left', 'right'],
			    	      	            padding: 0
			    	      	        },
			    	      	        preventOverflow: {
			    	      	            boundariesElement: container,
			    	      	        },
			    	      	        offset: { offset: '0px,50px' }

			    	      	    },
			    	      	    
		    	      		});
	    	      			
	    	      			popper.disableEventListeners();
	    	      				    	      			
					   })
					   .on('mouseout', function() { // on mouse out hide line, circles and text
						   d3.select(".mouse-line"+chart.id).transition()
						   		.duration(500)
							    .style("opacity", "0");
						   d3.selectAll(".mouse-per-line"+chart.id+" circle").transition()
						        .duration(500)
							    .style("opacity", "0");
						   d3.selectAll(".mouse-per-line"+chart.id+" text").transition()
						   		.duration(500)
							    .style("opacity", "0");  
						 // chart.tooltipFloating.style("display","none")
						  
						  popper.destroy(tooltip);
						  
						})
						.on('mouseover', function() { // on mouse in show line, circles and text
							d3.select(".mouse-line"+chart.id).transition()
						    	.duration(500)
							    .style("opacity", "1");
							 d3.selectAll(".mouse-per-line"+chart.id+" circle").transition()
						     	.duration(500)
							    .style("opacity", "1");
							 d3.selectAll(".mouse-per-line"+chart.id+" text").transition()
						      	.duration(500)
							     .style("opacity", "1");
							 chart.tooltipFloating.style("display","block")

						  })			
			var popperDot;
		   	var tooltipDot;
			chart.dot.data(chart.seriesLineData[i])			
	        	.enter().append("circle")
	        	.attr("id",function(d, i){
	    	     	return chart.id+""+ (chart.x(d.x) + chart.y(d.y)) +""+i })
	    	    .classed("dot", true)
	        	.style("fill", function(d){ return d3.hsl(chart.color(i)).darker(1)})
	        	.attr("r", 3)
	        	.on("mouseover", function(d, i) {
	        		var mouse = d3.select(this);

	        		d3.select(this).transition()
			        	.duration(500)
			            .attr("r", 7);
	        		
	    	      	chart.tooltip.style("display", "inline-block")
	    	      		.attr("class","back-shadow")
	    	      		.html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip)
		                .style("padding","5px 5px 5px 5px")
		                .style("font-family", "Lato")
		                .style("word-wrap","break-down");  
	    	      		
	    	      	tooltipDot = document.getElementById(chart.id+"tool"); 
	    	      		var rect = document.getElementById(chart.id+""+(chart.x(d.x) + chart.y(d.y)) +""+i);
	    	      		var container = document.getElementById(chart.id);
	    	      		
	    	      		popperDot = new Popper(rect, tooltipDot, {
	    	      		    placement: 'left',
	    	      		    removeOnDestroy: true,
		    	      		modifiers: {
		    	      	        flip: {
		    	      	            behavior: ['left', 'right','top']
		    	      	        },
		    	      	        preventOverflow: {
		    	      	            boundariesElement: container,
		    	      	        },
		    	      	    },
	    	      		});

		         })
		         .on("mouseout", function(d) {
		            d3.select(this).transition()
			             .duration(500)
			             .attr("r", 3);
		            
		            chart.tooltip.style("position", "absolute")
		            	.style("display","none");
		            popper.destroy(tooltipDot);
		            
		         })	
		         .attr("cx", function(d) { return chart.x(d.x); })		 
		         .attr("cy", function(d) { return chart.y(d.y); })
		         
	    	     
		}
		 lines = document.getElementsByClassName('plot'+chart.id);
   }
    
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////Bar series and plotter
// ////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addBarSeries = function(seriesName, seriesData, seriesLabels, tooltip)
    {   	
	  var chart = this;	  
	  var zScale =d3.scaleBand().domain([0, 1, 2]).range([0, chart.depth], .4);
	  
	  chart.xDomain = [];
	  chart.yDomain = [];
	  chart.series = [];
	  chart.seriesXY = []
	  chart.seriesArray = [];
	  var count = 0;
	  chart.seriesCount = (typeof chart.seriesCount == 'undefined') ? 0 : chart.seriesCount;
	  var isSeriesDataEmpty = false;

	  seriesData.forEach(function(d, i){
		  if(typeof seriesData[0] == 'object'){
				if(+seriesData[i]["y"] == 0)
					count++;
		  }else{
			  	if(+seriesData[i] == 0 || isNaN(seriesData[i]))
					count++; 
		  }
	  })	  
	  if(seriesData.length == count){
		  chart.seriesCount++;
		  //isSeriesDataEmpty = true;
	  }

	  if(typeof seriesData[0] == 'object'){
		  seriesData.forEach(function(d, i){
		      seriesData[i].x = ((typeof +d.x == 'undefined' || isNaN(d.x)) ? i : +d.x);
			  chart.xDomain[i] = ((typeof +d.x == 'undefined' ||  isNaN(d.x)) ? i : +d.x);
			  seriesData[i].y = +d.y;
			  chart.yDomain[i] = +d.y;
			  seriesData[i].name = seriesName;
			  chart.seriesX[i] = seriesData[i]["x"];
			  chart.seriesY[i] = seriesData[i]["y"];
			  chart.series[i] = +seriesData[i]["y"];
			  if(typeof seriesLabels != 'undefined' && seriesLabels != null && seriesLabels != ""){
				  seriesData[i].text = seriesLabels[i]
			  }
			  if(chart.undefinedMax < +d.y)
				  chart.undefinedMax = +d.y;
		 })
		 chart.seriesbarData.push(seriesData);
	  }else{
		  seriesData.forEach(function(d, i){
			  chart.seriesArray.push({
				  "x"		: +i,
				  "y"		: +seriesData[i],
				  "name"	: seriesName,
				  "text"	: (typeof seriesLabels != 'undefined' && seriesLabels != null && seriesLabels != "") ? seriesLabels[i] : "",
				  "tooltip" : ( typeof tooltip == 'undefined' ) ? null : tooltip[i]
			  }); 
			  chart.xDomain[i] = +i;
			  chart.yDomain[i] = +seriesData[i];
			  chart.seriesX[i] = chart.seriesArray[i]["x"];
			  chart.seriesY[i] = chart.seriesArray[i]["y"];
			  chart.series[i] = +chart.seriesArray[i]["y"];
			  if(chart.undefinedMax < +seriesData[i])
					chart.undefinedMax = +seriesData[i];
		  })
		  chart.seriesbarData.push(chart.seriesArray);
	  }	  
	  
	  if(chart.seriesbarData.length == chart.seriesCount)
		  chart.isSeriesDataEmpty = true;
	  else 
		  chart.isSeriesDataEmpty = false;

	  var current = Math.max.apply(null, chart.yDomain);	  
	  if(chart.undefinedMax < current)
		  chart.seriesXY.push(chart.series);	  
	  chart.type.push("Bar"); 
   }   
    charts.ChartBase.prototype.drawBar = function(horizontal)
	 {
    	var chart = this;
    	chart.horizontal = horizontal; 
    	if(chart.isSeriesDataEmpty || chart.seriesbarData == null || chart.seriesbarData ==  undefined){  		
    		axisSetup(chart);
    		mainLayout(chart);
        	
    		chart.svg.append("text").html("No data available")
    			.attr("x",0.4*chart.width)
    	  		.attr("y",0.5*chart.height) 
    			.style("margin", "0 auto")
    			.style("font-size", "18px")
    			.style("font-weight", "bold")
    			.style("padding","5px 5px 5px 5px")
                .style("word-wrap","break-down")
      			.attr("align","absmiddle")
      			
      		chart.svg
    	  		.append("image")
    	  		.attr("xlink:href", "/static/img/warning.gif")
    	  		.attr("height","50px")
    	  		.attr("width","50px")
    	  		.attr("x",0.4*chart.width-60)
    	  		.attr("y",0.5*chart.height-34)    	
    	  		
    	}else{
    		
 	   	axisSetup(chart);
 	   	drawLayout(chart, true, horizontal);
	   	setAxis(chart, true, horizontal);
		chart.first = true;
 		chart.x1 =  d3.scaleBand().padding(0.05);
 		chart.y1 =  d3.scaleBand().padding(0.05);

     	if(horizontal){    		
    		chart.y1.domain(d3.range(chart.seriesbarData.length)).rangeRound([0, chart.y.bandwidth()]);  	
    		
    		chart.rect = chart.svg.append("g").selectAll("g")
	 	    				.data(chart.seriesbarData).enter().append("g")
	    	       			.style("fill", function(d, i) { return Colors.colors[i]; })
    	       				.style("stroke-width", 0.5)
	 	    				.attr("transform", function(d, i){ return "translate(0, " + chart.y1(i) + ")"})
	 	    				.selectAll(".bar")
	    	       			.data(function(d) { return d; })
	 	    				.enter(); 

    		chart.rect = chart.rect.append("rect")
				     		.attr("id",function(d, i){
				     			return chart.id+""+ (chart.x(d.y) + chart.y(d.x)) +""+(i+""+d.name) })	
				     		.attr("class", "bar")
						    .attr("x", 0)
						    .attr("width", function(d) { 
						    	return chart.x(d.y); })
						    .attr("y", function(d) { return chart.y(d.x); })
						    .attr("height", function(d) { 
						    	return chart.y1.bandwidth(); })			
					  		.text(function(d) { return "The x "+ d.x +"The y "+d.y; })
					  		.on("mouseover", function(d, i) {
					  		   d3.select(this).transition()
					             .duration(500).style("fill","#FA8072")
					             
					           chart.tooltip.style("display", "inline-block")
				    	      		.attr("class","back-shadow")
				    	      		.html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip)
					                .style("padding","5px 5px 5px 5px")
					                .style("word-wrap","break-down");  
				    	      		var thisArea = d3.select(this);
				    	      		var pos = +thisArea.attr("k") + chart.y1.bandwidth();
				    	      		var tooltip = document.getElementById(chart.id+"tool"); 
				    	      		var rect = document.getElementById(chart.id+""+(chart.x(d.y) + chart.y(d.x)) +""+(i+""+d.name));
				    	      		var container = document.getElementById(chart.id);
				    	      		
			    	      			var popper = new Popper(rect, tooltip, {
				    	      		    placement: 'top',
					    	      		  modifiers: {
					    	      	        flip: {
					    	      	            behavior: ['left', 'right','top']
					    	      	        },
					    	      	        preventOverflow: {
					    	      	            boundariesElement: container,
					    	      	        },
					    	      	    },
				    	      		});
			    	      			console.log(" popper :"+popper);
					  		})
					  		.on("mousemove", function(d, i){    	      		
				    	      		var offset = this.getBoundingClientRect();
				    	      		var mouse = d3.mouse(this);
				    	      		var datalength = (d.tooltip == null ) ? (d.y).toString().length : d.tooltip.length;
				    	      		var thisArea = d3.select(this);
				    	      		var pos = +thisArea.attr("k") + chart.y1.bandwidth();
				    	      		datalength = (typeof datalength == 'undefined') ? 50 : datalength;    	      			 	    	      				    	      			
					  		})
					        .on("mouseout", function(d, i) {
					        	d3.select(this).transition()
						          .duration(500).style("fill", Colors.colors[d])
						          
						     chart.tooltip.style("position", "absolute")
		    	      			.style("display", "none");
					        });
    		

    		//////////////////////////////////////////////
    		////////top layer of 3d bar chart/////////////
    		//////////////////////////////////////////////
    		
    		function getPoint(d, i){
    			var generatedPoints = [];
				if(d.y == 0){	
					generatedPoints =  [
											[{"x": 0 , "y": 0},
											 {"x": 0 , "y": 0},
											 {"x": 0 , "y": 0},
											 {"x": 0 , "y": 0},
											 {"x": 0 , "y": 0},
											 {"x": 0 , "y": 0}]
										]; 
				} else  {
					generatedPoints= [
			   	    					[{"x":  chart.x(d.y) - chart.y1(0)       ,   "y":  chart.y(d.x) + chart.y1(0)								}, //1
			   	   						 {"x":  (chart.x(d.y) + 4 - chart.y1(0)) ,	 "y":  (chart.y(d.x) + chart.y1(0) + 4)							}, //2
			   	   					     {"x":  (chart.x(d.y) + 4 - chart.y1(0)) , 	 "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)	}, //3
			   	   					     {"x":  4 - chart.y1(0)                  ,	 "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0) + 4)	}, //4
			   	   					     {"x":  - chart.y1(0)                    ,	 "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))		}, //5
			   	   					     {"x":  chart.x(d.y) - chart.y1(0)       ,   "y":  (chart.y(d.x) + chart.y1.bandwidth() + chart.y1(0))		}] //6
		   	    					]; 	
				}
	   	    	return generatedPoints;
   	      	} 
    		
    		chart.topLayer = chart.svg.append("g").selectAll("g")
					.data(chart.seriesbarData).enter().append("g")
					.style("fill", function(d, i) {
						var c=d3.hsl(Colors.colors[i]);
	      				return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));})
					.style("stroke", function(d, i) {
						var c=d3.hsl(Colors.colors[i]);
		      			return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));})
		 			.style("stroke-width", 0.5)
					.attr("transform", function(d, i) { return "translate("+(chart.y1(0))+","+ (chart.y1(i)-chart.y1(0))+")"; })
					.append("g")
					.selectAll("g")
					.data(function(d){ return d;}).enter()
					.append("g").selectAll("g")
					.data(function(d, i){ 
						return getPoint(d, i);
					}).enter().append("polygon").attr("class", "polygon")
					.attr("points", function(d){ return d.map(function(d) { return[d.x,d.y].join(","); }).join(" ");} )
     	} else {
     		
	     	chart.x1.domain(d3.range(chart.seriesbarData.length)).rangeRound([0, (chart.x.bandwidth()-5)]);
    			
	     	chart.rect = chart.svg.append("g").selectAll("g")
		    	       				.data(chart.seriesbarData).enter().append("g")
		    	       				.style("fill", function(d, i) { return Colors.colors[i]; })
		    	       				.style("stroke-width", 0.5)
		    	       				.attr("transform", function(d, i){ return  "translate(" + chart.x1(i) + ",0)" })
		    	       				.selectAll(".bar")
		    	       				.data(function(d) { return d; })
		    	       				.enter();
	     	
	     			chart.rect.append("line")
	     					.attr("class", "line")
							.attr("x1", function(d, i){
								if((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1)
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
								if((d  == chart.seriesbarData[0][i]) && chart.seriesbarData.length != 1)
									return 0.5})
							.style("stroke","black");
	     	
		    chart.rect = chart.rect.append("rect")
		    	     		.attr("id",function(d, i){
		    	     			return chart.id+""+ (chart.x(d.x) + chart.y(d.y)) +""+(i+""+d.name) })
		    	     		.attr("class", "bar")
			    	      	.attr("x", function(d) { return chart.x(d.x);})
			    	      	.attr("width", (chart.x1.bandwidth()*80)/100)
			    	      	.attr("y", function(d) { return chart.y(d.y); })
			    	      	.attr("height", function(d) { 
			    	      		return chart.height - chart.y(d.y); })   
			    	      	.on("mouseover", function(d, i) {
			    	      		var thisArea =  d3.select(this);
			    	      		d3.select(this).transition()
			    	      			.duration(500).style("fill","#FA8072")
			    	      		
			    	      	chart.tooltip.style("display", "inline-block")
			    	      		.attr("class","back-shadow")
			    	      		.html((typeof d.tooltip == 'undefined' || d.tooltip == null) ? d.y : d.tooltip)
				                .style("padding","5px 5px 5px 5px")
				                .style("word-wrap","break-down");  
			    	      		var thisArea = d3.select(this);
			    	      		var tooltip = document.getElementById(chart.id+"tool"); 
			    	      		var rect = document.getElementById(chart.id+""+(chart.x(d.x) + chart.y(d.y)) +""+(i+""+d.name));
			    	      		var container = document.getElementById(chart.id);
			    	      		
		    	      			var popper = new Popper(rect, tooltip, {
			    	      		    placement: 'top',
				    	      		  modifiers: {
				    	      	        flip: {
				    	      	            behavior: ['left', 'right','top']
				    	      	        },
				    	      	        preventOverflow: {
				    	      	            boundariesElement: container,
				    	      	        },
				    	      	    },
			    	      		});
		    	      			console.log(" popper :"+popper);
			    	      	})
			    	      	.on("mousemove", function(d, i){    	      		
			    	      		var offset = this.getBoundingClientRect();
			    	      		var mouse = d3.mouse(this);
			    	      		var datalength = (d.tooltip == null ) ? (d.y).toString().length : d.tooltip.length;
			    	      		var thisArea = d3.select(this);
			    	      		var pos = +thisArea.attr("k") + chart.x1.bandwidth();
			    	      		datalength = (typeof datalength == 'undefined') ? 50 : datalength;    	      			 	    	      			
		    	      			
			    	      	})
			    	      	.on("mouseout", function(d, i) {
			    	      		d3.select(this).transition()
			    	      		.duration(500).style("fill", Colors.colors[d])
			    	      		
			    	      		 chart.tooltip.style("position", "absolute")
			    	      			 .style("display", "none");
			    	      	});
			  
		      	      //////////////////////////////////////////////////////////
		      	      ////////top layer of 3d bar chart////////////////////////
		      	      /////////////////////////////////////////////////////////
		    	      
		    	      function getPoint(d, i){
		    	    	var generatedPoints = [];
		    	    	if(chart.height == chart.y(d.y)){	
		  					generatedPoints =  [
		  										[{"x": 0 , "y": 0},
		  										 {"x": 0 , "y": 0},
		  										 {"x": 0 , "y": 0},
		  										 {"x": 0 , "y": 0},
		  										 {"x": 0 , "y": 0},
		  										 {"x": 0 , "y": 0}]
		  										]; 
		  				} else {
		  					
		  					generatedPoints= [
		  										[{"x": chart.x(d.x) 										,	"y":chart.y(d.y)		},
		  										 {"x": chart.x(d.x) + 4 								,	"y":chart.y(d.y) - 4	},
		  										 {"x": chart.x(d.x) + (chart.x1.bandwidth()*80)/100 + 4	,	"y": chart.y(d.y) - 4	},
		  										 {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100 + 4 	,	"y": chart.height - 4	},
		  										 {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100 		,	"y": chart.height		},
		  										 {"x": chart.x(d.x) +(chart.x1.bandwidth()*80)/100 		,	"y": chart.y(d.y) 		}]
		  									];
		  				}
		    	    	  return generatedPoints;
		    	      }
		      	
		    	      
			         chart.topLayer = chart.svg.append("g").selectAll("g")
							.data(chart.seriesbarData).enter().append("g")
							.style("fill", function(d, i) {var c=d3.hsl(Colors.colors[i]);
		  	      			return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));})
							.style("stroke", function(d, i) {
								var c=d3.hsl(Colors.colors[i]);
			  	      			return d3.hsl((c.h+5), (c.s -.07), (c.l -.15));})
			  				.style("stroke-width", 0.5)
			  	 			.style("stroke-width", 0.5)
							.attr("transform", function(d, i) { 
								return "translate(" + chart.x1(i) + ",0)"; 
							})
							.append("g")
							.selectAll("g")
							.data(function(d){ return d;}).enter()
							.append("g").selectAll("g")
			         		.data(function(d, i){ 
			         			return getPoint(d, i);
			         		}).enter().append("polygon").attr("class", "polygon")
							.attr("points", function(d){ return d.map(function(d) { return[d.x,d.y].join(","); }).join(" ");} )					
						
     		}
    	}
	 }
    
    charts.ChartBase.prototype.addBarClickHandler = function(handlerFunc)
	{
    	var chart = this;
    	if(!chart.isSeriesDataEmpty)
	    	chart.rect.on("click",  function(d) {
	    		var elements = document.querySelectorAll(':hover');
	            handlerFunc(d.x, d, d.name, d, elements[16]);
	    	});
     };
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////Scatter series and plotter
// ///////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addScatterSeries = function(seriesName, seriesData, maxlimit, dotSize)
    {  
	  var chart = this;
	  chart.xDomain = [];
	  chart.yDomain = [];
	  chart.dotSize = dotSize;
	  chart.seriesXY = [];
	  chart.series = [];
	  
	  if (maxlimit != null)
      {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var i = 0; i < seriesData.length; ++i)
         {
           var v = seriesData[i].y;
           if (min > v)
            min = v;
           if (max < v)
            max = v;
         }
        var rangeX = maxlimit*(seriesData.length)/100;
        var rangeY = maxlimit*(max-min)/100;
        
        var newseriesData = [];
        var lastX = -100000;
        var lastY = 0;
        for (var i = 0; i < seriesData.length; ++i)
        {
        	var d = seriesData[i];
        	if (i-lastX > rangeX || Math.abs(d.y-lastY) > rangeY)
            {
        		lastX = i;
        		lastY = d.y;
        		newseriesData.push(d);
            }
        }
        seriesData = newseriesData;
      }
	 
		  seriesData.forEach(function(d, i){
		      seriesData[i].x = ((typeof +d.x == 'undefined' || isNaN(d.x)) ? i : +d.x);
			  chart.xDomain[i] = ((typeof +d.x == 'undefined' ||  isNaN(d.x)) ? i : +d.x);
			  seriesData[i].y = +d.y;
			  chart.yDomain[i] = +d.y;
			  seriesData[i].name = seriesName;
			  chart.seriesX[i] = seriesData[i]["x"];
			  chart.seriesY[i] = seriesData[i]["y"];
			  chart.series[i] = +seriesData[i]["y"];
			  if(typeof seriesLabels != 'undefined' && seriesLabels != null && seriesLabels != ""){
				  seriesData[i].text = seriesLabels[i]
			  }
			  if(chart.undefinedMax < +d.y)
				  chart.undefinedMax = +d.y;
		 })
		 chart.seriesScatterData.push(seriesData);
	 
//	  seriesData.forEach(function(d, i){
//		  				seriesData[i].x = +d.x;
//		  				chart.xDomain[i] = +d.x;
//		  				seriesData[i].y = +d.y;
//		  				chart.seriesX[i] = seriesData[i]["x"];
//		  				chart.seriesY[i] = seriesData[i]["y"];
//	  })
	  
//	  chart.seriesScatterData.push(seriesData);
		  
		  var current = Math.max.apply(null, chart.yDomain);	  
		  if(chart.undefinedMax < current)
			  chart.seriesXY.push(chart.series);	 
		  
	  chart.type.push("Scatter");
   }
    
   charts.ChartBase.prototype.drawScatterPlot = function()
	{
	   var chart = this;
	   
	   if(!chart.first){
	   		axisSetup(chart);
	   		drawLayout(chart, false, false);
	   		setAxis(chart, false, false);
			chart.first = true;
	   }
	   
	   var dot = (typeof chart.dotSize != 'undefined') ? chart.dotSize : 4;
		    // Add the scatterplot
	   for (var i = 0; i < chart.seriesScatterData.length; i++) {
			chart.dot = chart.svg.selectAll("dot")	
			      .data(chart.seriesScatterData[i])			
			      .enter().append("circle")//.select("circle").data(function(d){ return d}).enter()	
			      // .style("pointer-events", "all")
			      .style("fill", function(d){
			    	  return chart.color(i);
			      })
			      .style("stroke", "black")
			      .attr("r", dot)
			      .on("mouseover", function(d) {
		            	d3.select(this)
		            		.transition()	
		            		.duration(500)
		            		.attr("r", 7);
		           })
		           .on("mouseout", function() {
		            	d3.select(this)
		            		.transition()
		            		.duration(500)
		            		.attr("r", dot);
		           })		
			      .attr("cx", function(d, i) { return chart.x(d.x); })		 
			      .attr("cy", function(d) {  return chart.y(d.y); })
			      .append("svg:title")
		          .text(function(d) { return d.tooltip; });
	   }
    }
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////// Click handler
// //////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.addScatterOrLineClickHandler = function(handlerFunc)
	{
    	var chart = this;
    	chart.svg.on("click",  function(d) {
    		var elements = document.querySelectorAll(':hover');
    		if(elements[15].tagName == "circle"){
    			var circle = elements[15].__data__;
                handlerFunc(circle.x, circle.y, circle.name);
    		}
    	});
     };
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////// Legend Initiator
// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
    charts.ChartBase.prototype.legend = function(tileId, series, horizontal){
    	var chart = this;
    	var chartSeries = [];
    	if(typeof series == 'undefined' || series == null)
    		chartSeries = chart.seriesX;
    	else
    		chartSeries = series;
 		setLegend(tileId, chartSeries, chart, horizontal);
 		
    }
     return charts;
});