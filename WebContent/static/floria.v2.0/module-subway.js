"use strict";

import { FloriaDOM } from "./module-dom.js";


function findNode(nodes, label)
 {
   for (var i = 0; i < nodes.length; ++i)
    {
      var n = nodes[i];
      if (n.label == label)
       return n;
    }
   return null;
 }
 
function findNodeFromNext(nodes, label)
 {
   for (var i = 0; i < nodes.length; ++i)
    {
      var n = nodes[i];
      if (n.next != null && n.next.includes(label) == true)
       return n;
    }
   return null;
 }
 
 
function getPathToRoot(nodes, pulseLabel)
 {
   var path = [];
   var node = findNode(nodes, pulseLabel);
   while (node != null)
    {
      path.push(node.label);
      node = findNodeFromNext(nodes, node.label);
    }
   return path;
 }
 
 
export function FloriaSubway(id, cssClassPostfix, handlerFunc, gridSizeX, gridSizeY)
 {
   this._gridSizeX = gridSizeX || 120;
   this._gridSizeY = gridSizeY || 60;
   this._id = id;
   this._cssClassPostfix = cssClassPostfix;
   this._handlerFunc = handlerFunc;

   this.draw = function(nodes, pulseLabel)
    {
      this._nodes = nodes;
      this._pulseLabel = pulseLabel;
      var pulseNode = findNode(nodes, pulseLabel);
      var pathToRoot = getPathToRoot(nodes, pulseLabel);
      var str1 = "";
      for (var i = 0; i < nodes.length; ++i)
       {
         var n = nodes[i];
         if (n.next == null || n.next.length == 0)
          continue;
         for (var j = 0; j < n.next.length; ++j)
          {
            var n2 = findNode(nodes, n.next[j]);
            if (n2 == null)
             throw new Error("Node '"+n.label+"' is defining a next node link '"+n.next[j]+"' that cannot be found.");
//       console.log("pathToRoot: ", pathToRoot, ", n2.label: ", n2.label, ", status: ", pathToRoot.includes(n2.label)
            str1+='<path class="'+(pathToRoot.includes(n2.label)?'flowPathVisited_':'flowPathFuture_')+this._cssClassPostfix+'" d="M'+(n.x*this._gridSizeX-this._gridSizeX/2)+' '+(n.y*this._gridSizeY-this._gridSizeY/2)+' '+(n2.x*this._gridSizeX-this._gridSizeX/2)+' '+(n2.y*this._gridSizeY-this._gridSizeY/2)+'"/>\n';
          }
       }
      var str2 = "";
      for (var i = 0; i < nodes.length; ++i)
       {
         var n = nodes[i];
         var activeFilter = n.selectable==true ? 'data-selectable="1" style="filter: saturate(500%) drop-shadow(4px 4px 4px black); cursor: pointer;"'
                          : pathToRoot.includes(n.label) ? 'style="filter: saturate(500%);"'
                          : 'style="filter: saturate(90%);"'
                          ;

         str2+='<circle '+(/*n.selectable==*/true?'data-label="'+n.label+'"':'')+' class="flowNode_'+this._cssClassPostfix+(n.extraCssClass==null?'':' flowNode_'+this._cssClassPostfix+'_'+n.extraCssClass)+'" cx="'+(n.x*this._gridSizeX-this._gridSizeX/2)+'" cy="'+(n.y*this._gridSizeY-this._gridSizeY/2)+'" '+activeFilter+'/>\n';
         if (n.label == pulseLabel)
          str2+='<circle class="flowNodePulse_'+this._cssClassPostfix+'" cx="'+(n.x*this._gridSizeX-this._gridSizeX/2)+'" cy="'+(n.y*this._gridSizeY-this._gridSizeY/2)+'">'
              +'  <animate attributeName="r" from="7" to="32" dur="2s" begin="0s" repeatCount="indefinite"/>'
              +'  <animate attributeName="opacity" from="1" to="0" dur="2s" begin="0s" repeatCount="indefinite"/>'
              +'</circle>'
              ;
         str2+='<text class="flowLabel_'+this._cssClassPostfix+'" x="'+(n.x*this._gridSizeX-this._gridSizeX/2)+'" y="'+(n.y*this._gridSizeY-this._gridSizeY/2+30)+'" style="'+(n.selectable==true?'font-weight: bold;':'')+'">'+n.label+'</text>\n';
       }
      document.getElementById(this._id).innerHTML = str1+'\n'+str2;

      var that = this;
      if (this._handlerFunc != null)
       FloriaDOM.addEvent(this._id, "click", function(e, event, target) { 
          while (target != null && target != e && target.dataset.label == null)
            target = target.parentNode;
          if (target?.dataset?.label == null)
           return;
          if (target?.dataset?.selectable == null)
           return;
          that._handlerFunc(that._id, target.dataset.label);
          that.setPulseLabel(target.dataset.label);
       }, null, true);

    }
   this.setPulseLabel=function(pulseLabel)
    {
      this.draw(this._nodes, pulseLabel);
    }
 }

