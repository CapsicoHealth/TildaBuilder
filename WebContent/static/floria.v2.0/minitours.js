"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Date extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/textutil", "floria/superdom", "jslibs/popper", "floria/collections"], function(FloriaText, SuperDOM, Popper, FloriaCollections)
{

var dojoSimple = require(CapsicoDojoSimpleLibJS)

var x = {};


function doTooltip(tourItem)
 {
   var node = document.createElement("SPAN");
   node.id = "TOUR_"+tourItem.tour;
   node.classList.add("activeTourItem");
   node.innerHTML = `<B>Step ${tourItem.seq}</B><BR>
                     ${tourItem.txt}<BR>
                     <BR>
                    `;
   
   SuperDOM.insertAfter(tourItem.element, node);
 }


x.run = function(name)
 {
   var elements = document.querySelectorAll('[data-tour]');
   var tourItems = [];
   elements.forEach(function(e) {
     var val = e.dataset.tour;
     val = val.split("`");
     if (val.length == 3 && val[0] == name)
      tourItems.push({element: e, tour:val[0], seq:val[1], text:val[2]});
     else
      console.log("Element "+e.id+" defined a data-tour attribute '"+e.dataset.tour+"' which is not well formed.");
   });
   
  tourItems.sort(function(a, b) { return SuperDOM.compareValues(a.seq, b.seq); });
  
  doTooltip(tourItems[0]);
 }

x.isPageTourEnabled = function()
 {
    
 }


function start(data)
 {
    
 }

x.startTour = function(tourName, jsonUrl)
 {
   dojoSimple.ajaxUrl(jsonUrl, "GET", null, 
                      function(data) {
                         start(data); 
                      },
                      function() { 
                        alert("The tour '"+tourName+"' is not available for this page.")
                      }
                     );

 }

x.endTour = function()
 {
    
 }

return x;

});
