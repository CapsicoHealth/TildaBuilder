"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";
import { FloriaCollections } from "/static/floria.v2.0/module-collections.js";

import { sampleTildaJsonData } from "./module-testtildajson.js";



const CustomUMLClass = joint.shapes.uml.Class.extend({});


class CanvasState
 {
   constructor()
    {
      this._canvasData = [];
    }

   addCanvas(canvasName)
    {
      // add new canvas is needed
      let canvas = this.getCanvas(canvasName);
      if (canvas == null)
       {
         canvas = { "id":this._canvasData.length, "name": canvasName, "entities": [] };
         this._canvasData.push(canvas);
       }
      // update currnent flag
      this.setCurrentCanvas(canvasName);
      return canvas;
    }

   getCanvas(canvasName)
    {
      for (let i = 0; i < this._canvasData.length; ++i)
       if (this._canvasData[i].name == canvasName)
        return this._canvasData[i];
      return null;
    }

   setCurrentCanvas(canvasName)
    {
      for (let i = 0; i < this._canvasData.length; ++i)
       this._canvasData[i].current = this._canvasData[i].name == canvasName;
    }

   getCurrentCanvas()
    {
      // no canvases at all, return null
      if (this._canvasData.length == 0)
       return null;
      
      // find current canvas
      for (let i = 0; i < this._canvasData.length; ++i)
       if (this._canvasData[i].current == true)
        return this._canvasData[i];
      
      // if none found, make the first one (there is at least one in the array) the current one and return it
      this._canvasData[0].current = true;
      return this._canvasData[0];
    }
    
   addEntity(canvasName, entityName, x, y, showColumns, showKeys)
    {
      let entity = this.getEntity(canvasName, entityName);
      console.log(entity);
      if (entity == null) // entity is being actually added
       {
         let canvas = this.getCanvas(canvasName);
         if (canvas == null)
          return console.error("Canvas '" + canvasName + "' not found");
         console.log("new entity");
         canvas.entities.push({ "name": entityName, "x": x, "y": y, "showColumns": showColumns, "showKeys": showKeys });
       }
      else // entity is being updated
       {
          console.log("updated entity--> x: ", x, "; y: ", y, "; showColumns: ", showColumns, "; showKeys: ", showKeys, ";");
          entity.x = x;
          entity.y = y;
          entity.showColumns = showColumns;
          entity.showKeys = showKeys;
       }
      this.saveState();
    }

   hasEntity(canvasName, entityName)
    {
      let canvas = this.getCanvas(canvasName);
      if (canvas != null)
       for (let i = 0; i < canvas.entities.length; i++)
        if (canvas.entities[i].name == entityName)
         return canvas.entities[i];
      return null;
    }
    
   getEntity(canvasName, entityName)
    {
      let canvas = this.getCanvas(canvasName);
      if (canvas != null)
       for (let i = 0; i < canvas.entities.length; i++)
        if (canvas.entities[i].name == entityName)
         return canvas.entities[i];

      if (canvas == null)
       console.error("Cannot find entity '" + entityName + "' because canvas '" + canvasName + "' cannot be found");
      else
       console.warn("Cannot find entity '" + entityName + "' in canvas '" + canvasName);

      return null;
    }

   removeEntity(canvasName, entityName)
    {
      let canvas = this.getCanvas(canvasName);
      if (canvas == null)
       return console.error("Canvas '" + canvasName + "' not found");

      let entityIndex = canvas.entities.findIndex(e => e.name === entityName);
      if (entityIndex == -1)
       return console.error("Entity '" + entityName + "' not found in canvas '" + canvasName + "'");

      canvas.entities.splice(entityIndex, 1);
      this.saveState();
    }

   saveState()
    {
      console.log("Saving canvas state: ", this._canvasData);
      localStorage.setItem('canvasState', JSON.stringify(this._canvasData));
    }

   loadState()
    {
      const savedState = localStorage.getItem('canvasState');
      if (savedState == null)
       return false;
      this._canvasData = JSON.parse(savedState);
      console.log("Loading canvas state: ", this._canvasData);
      return true;
    }
 }

const canvasStateManager = new CanvasState();



class Shelf
 {
   constructor(divId)
    {
      this._divId = divId;
      this._entityNames = [];
      this._canvasName = null;
      
      var that = this;
      FloriaDOM.addEvent(this._divId, "click", function(e, event, target) {
        if (target.nodeName != 'LI')
         return;
        let entityName = target.textContent;
        ERView.addEntityToCanvas(entityName);
        target.remove();
        that._entityNames.remove(entityName);
      }, null, true);
    }
    
   addEntity(entityName)
    {
      if (this._entityNames.indexOf(entityName) == -1)
       this._entityNames.push(entityName);
    }

   reset(canvasName)
    {
      this._entityNames = [];
      this._canvasName = canvasName;
    }

   paint()
    {
      let str = '<UL class="entityShelf">';
      for (let i = 0; i < this._entityNames.length; ++i)
       if (canvasStateManager.getEntity(this._canvasName, this._entityNames[i]) == null)
        str += '<LI>' + this._entityNames[i] + '</LI>'
      str += '</UL>';
      FloriaDOM.setInnerHTML(this._divId, str);
    }
}





var CustomLink = joint.dia.Link.extend({
  defaults: joint.util.deepSupplement({
     type: 'CustomLink',
     attrs: { 
             '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' },
            },
     z: -1,
     connector: { name: 'rounded' }
  }, joint.dia.Link.prototype.defaults)
});


function createContextenu()
 {
   var e = document.createElement('UL');
   e.classList.add("context-menu");
   e.style.display="none";
   document.body.appendChild(e);
   return e;
 }

export var ERView = {
  _entitiesMap: []
 ,_paper: null
 ,_graph: null
 ,_canvasElement: null
 ,_contextMenu: createContextenu()
 
 ,getEntity: function(entityName)
   {
     for (var i = 0; i < this._entitiesMap.length; ++i)
      {
        var e = this._entitiesMap[i];
        if (e.attributes.name == entityName)
         return e;
      }
     return console.warn("Cannot find entity '"+entityName+"' in ERView._entitiesMap.")
   }

 ,start: function(mainDivId, entityListDivId, tildaJsonData)
   {
     this._mainDivId = mainDivId;
     this.createEntitiesFromTildaJson(tildaJsonData);
     
     this._canvasElement = FloriaDOM.getElement(this._mainDivId + '_CANVAS_CONTAINER');
     if (this._canvasElement == null)
      return;

     this._graph = new joint.dia.Graph();
     this._paper = new joint.dia.Paper({
        el: this._canvasElement
       ,width: "98%"
       ,height: 800
       ,model: this._graph
     });

     this._shelf = new Shelf(entityListDivId);        
     
     canvasStateManager.loadState();
     let currentCanvasState = canvasStateManager.getCurrentCanvas();
     if (currentCanvasState == null)
      currentCanvasState = canvasStateManager.addCanvas("Main")
     
     this.showCanvas(currentCanvasState);

     this.bindContextMenuToPaper(currentCanvasState);

     var that = this;
     $('#' + mainDivId + '_ADD_CANVAS_BUTTON').click(function() { that.addCanvas() });
     $('#' + mainDivId + '_CANVAS_TABS').on('click', '.tab', function() {
       that.showCanvas(xxx)
     });
   }
   
 ,createEntitiesFromTildaJson: function(tildaJson)
   {
     if (tildaJson.hasOwnProperty('objects') != true)
      return;

     tildaJson['objects'].forEach(entityData => {
       const entityName = entityData.name;

       // Parsing all columns and create a new array of strings allAttributes as "<columnName>:<type>"
       const allAttributes = [];
       if (entityData?.primary?.autogen == true)
        {
          allAttributes.push("refnum:LONG");
          entityData.primary.columns=["refnum"];
        }
       entityData.columns.forEach(column => {
          let attribute = column.name;
          if (column.type)
           attribute += ':'+column.type;
          else if (column.sameAs || column.sameas)
           {
             const refString = column.sameAs || column.sameas;
             const arr = refString.split('.');
             const refEntity = arr[arr.length-2];
             const refColumn = arr[arr.length-1];
             if (attribute == null)
              attribute = refColumn;
             if (refColumn === 'refnum' || refColumn === 'pk')
              attribute += ':LONG';
             else
              {
                const relatedEntity = tildaJson['objects'].find(obj => obj.name === refEntity);
                if (relatedEntity && relatedEntity.columns)
                 {
                   const relatedColumn = relatedEntity.columns.find(col => col.name === refColumn);
                   if (relatedColumn && relatedColumn.type)
                    attribute += ':'+relatedColumn.type;
                  }
               }
            }
          allAttributes.push(attribute);
       });

       // Calculating the max length of attribute names
       const longestAttributeLength = Math.min(25, Math.max.apply(Math, allAttributes.map(attr => attr.length)));

       // Handling PrimaryKey columns with the same string values "<columnName>:<type>"
       const primaryKey = (entityData.primary && entityData.primary.columns) ? entityData.primary.columns : [];
       const primaryKeyAttributes = [];
       primaryKey.forEach(pk => {
         const foundAttr = allAttributes.find(attr => attr.startsWith(pk + ":"));
         if (foundAttr)
          primaryKeyAttributes.push(foundAttr);
       });

       // Handling Foreign Keys columns with the same string values "<columnName>:<type>"
       const foreignKeysWithTypes = [];
       if (entityData.foreign)
        {
          entityData.foreign.forEach(fk => {
            if (fk.srcColumns)
             {
               fk.srcColumns.forEach(srcColumn => {
                 const foundAttr = allAttributes.find(attr => attr.startsWith(srcColumn + ":"));
                 if (foundAttr)
                  foreignKeysWithTypes.push(foundAttr);
               });
             }
          });
        }

       // Create the entity as jointJS object (the CustomUMLClass object)
       const NewEntity = new CustomUMLClass({
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          size: { width: 200 + longestAttributeLength * 7, height: 100 + allAttributes.length * 12 },
          name: entityName,
          attributes: allAttributes,
          attributesFk: foreignKeysWithTypes,
          attributesPk: primaryKeyAttributes,
          longestAttributeLength: longestAttributeLength,
          methods: [],
          showKeys: true,
          showColumns: true,
       });
       
       // Add the entity to the map
       this._entitiesMap.push(NewEntity);
       console.log("Added entity to entitiesMap:", entityName);
     });
   }
   
 ,showCanvas: function(canvasState)
   {
     console.log("canvasState: ", canvasState);
     
     $('.tab.active').removeClass('active');
     let tabId = this._canvasElement.id+'_'+(canvasState.id);
     let tab = FloriaDOM.getElement(tabId);
     if (tab == null)
      FloriaDOM.appendInnerHTML(this._mainDivId + '_CANVAS_TABS', '<BUTTON class="tab active" id="'+tabId+'">'+canvasState.name+'</BUTTON>');
     else
      FloriaDOM.addCSS(tab, "active");
      
     this._graph.clear();
     this._shelf.reset(canvasState.name);

     for (let i = 0; i < this._entitiesMap.length; ++i)
      {
        let entity = this._entitiesMap[i];
        let canvasStateEntity = canvasStateManager.getEntity(canvasState.name, entity.attributes.name);
        if (canvasStateEntity == null) // not on canvas
         this._shelf.addEntity(entity.attributes.name);
        else
         {
           const key = canvasStateEntity.showKeys || true;
           const col = canvasStateEntity.showColumns || true;
           const x = canvasStateEntity.x || 25;
           const y = canvasStateEntity.y || 25;
           this.addEntityToCanvas(entity.attributes.name, x, y, col, key);
         }
      }
     this._shelf.paint();
   }
   
   
 ,addEntityToCanvas: function(entityName, x, y, showCol, showKeys)
   {
     const entity = this.getEntity(entityName);
     if (entity == null)
      return console.warn("Cannot find entity '"+entityName+"' to add.");

     canvasStateManager.addEntity(this._shelf._canvasName, entityName, x, y, showCol, showKeys);
     
     entity.set('onCanvas', true);
     entity.position(x, y);
     entity.attributes.showColumns = showCol || true;
     entity.attributes.showKeys = showKeys || true;
     this._graph.addCells([entity]);

     for (let i = 0; i < this._entitiesMap.length; ++i)
      {
        let entity2 = this._entitiesMap[i];
        if (entity2.get('onCanvas') == true)
         {
           
         }
      }
/*
     jsonData.objects.forEach(entityData => {
        if (entityData.foreign)
         {
           entityData.foreign.forEach(foreignKey => {
              let sourceModel, destinationModel;
              if (entityData.name === entityName)
               {
                 sourceModel = this._graph.getCell(entityModel.id);
                 destinationModel = this._graph.getCell(this._entitiesMap[foreignKey.destObject].id);
               } 
              else if (foreignKey.destObject === entityName)
               {
                 sourceModel = this._graph.getCell(this._entitiesMap[entityData.name].id);
                 destinationModel = this._graph.getCell(entityModel.id);
               }
              if (sourceModel && destinationModel)
               {
                 const link = new joint.shapes.standard.Link();
                 link.source(sourceModel);
                 link.target(destinationModel);
                 this._graph.addCells([link]);
               }
           });
         }
     });
*/
   }
   
 ,removeEntityFromCanvas: function(entityModel)
   {
     const entity = this.getEntity(entityModel.attributes.name);
     if (entity == null)
      return console.warn("Cannot find entity '"+entityModel.attributes.name+"' to remove.");

     var links = this._graph.getConnectedLinks(entityModel);
     var that = this;
     links.forEach(link => {
       that._graph.removeCells([link]);
     });

     this._graph.removeCells([entityModel]);
     entityModel.set('onCanvas', false);

     canvasStateManager.removeEntity(this._shelf._canvasName, entityModel.attributes.name);
     this._shelf.addEntity(entityModel.attributes.name);
     this._shelf.paint();
   }
   


/*
 ,addCanvas: function()
   {
     let canvasNumber = $('.canvas').length + 1;
     let newCanvasID = this._mainDivId + '_canvas' + canvasNumber;

     // Adding tab
     $('<button>').addClass('tab')
                  .data('canvas-id', newCanvasID)
                  .text('Canvas ' + canvasNumber)
                  .appendTo('#' + this._mainDivId + '_CANVAS_TABS');

     // Adding canvas
     $('<div>').addClass('canvas')
               .attr('id', newCanvasID)
               .appendTo('#' + this._mainDivId + '_CANVAS_CONTAINER')
               .hide();

     let newGraph = new joint.dia.Graph();
     let newPaper = new joint.dia.Paper({
       el: $('#' + newCanvasID),
       // width: "100%",
       // height: "95%",
       model: newGraph
     });

     this.bindContextMenuToPaper(newPaper);

     // Storing canvas data
     canvasStateManager.addCanvas(newCanvasID);
   }
*/

    , _zoomLevel: 1
    , _zoom: function() {
        paper.scale(this._zoomLevel);
        paper.fitToContent({ useModelGeometry: true, padding: 100 * this._zoomLevel, allowNewOrigin: 'any' });

    }
    , zoomIn: function() {
        this._zoomLevel = Math.min(3, this._zoomLevel + 0.2);
        zoom(this._zoomLevel);
    }
    , zoomOut: function() {
        this._zoomLevel = Math.max(0.2, this._zoomLevel - 0.2);
        zoom(this._zoomLevel);
    }

 ,bindContextMenuToPaper: function(currentCanvasState)
   {
      var that = this;
      
      // scoped variable for context menu
      let contextMenuCell = null;
      FloriaDOM.addEvent(this._contextMenu, "click", function(e, event, target) {
         if (target.nodeName != 'LI')
          return;
         var selectedOption = target.innerText;
         if (selectedOption == 'Remove Entity from Canvas')
          that.removeEntityFromCanvas(contextMenuCell);
         else
          {
                 if (selectedOption == 'Show Keys'   ) contextMenuCell.set('showKeys', true);
            else if (selectedOption == 'Hide Keys'   ) contextMenuCell.set('showKeys', false);
            else if (selectedOption == 'Show Columns') contextMenuCell.set('showColumns', true);
            else if (selectedOption == 'Hide Columns') contextMenuCell.set('showColumns', false);
            that.updateEntityAttributesDisplay(currentCanvasState.name, selectedOption, contextMenuCell, that._paper);
          }
         FloriaDOM.hide(that._contextMenu);
      });
      
      this._paper.on('cell:contextmenu', function(cellView, evt, x, y) {
         evt.stopPropagation();
         that._contextMenu.style.left=evt.pageX+"px";
         that._contextMenu.style.top=evt.pageY+"px";
         var str = '<LI>'+(cellView.model.get('showKeys'   ) != true ? 'Show Keys'    : 'Hide Keys')+'</LI>'
                  +'<LI>'+(cellView.model.get('showColumns') != true ? 'Show Columns' : 'Hide Columns')+'</LI>'
                  +'<LI>Remove Entity from Canvas</LI>'
                  ;
         that._contextMenu.innerHTML = str;
         FloriaDOM.show(that._contextMenu);
         contextMenuCell = cellView.model;
      });

      this._paper.on('blank:contextmenu', function() {
         FloriaDOM.hide(that._contextMenu);
      });

      // Position update
      this._paper.on("cell:pointerup", function(cell, evt, x, y) {
         var a = cell.model.attributes;
         canvasStateManager.addEntity(currentCanvasState.name, a.name, a.position.x, a.position.y, a.showColumns, a.showKeys);
      });

      // scoped variable for link drag and drop logic
      let link = null;

      // Dragging the entities, updating the links
      this._paper.on('cell:pointerdown', function(cellView, evt, x, y) {
         FloriaDOM.hide(that._contextMenu);
         if (cellView.model.isLink() == true)
          return;
         var threshold = 10;
         var bbox = cellView.model.getBBox();
         var distance = Math.min(
               Math.abs(bbox.x - x),
               Math.abs(bbox.y - y),
               Math.abs(bbox.x + bbox.width - x),
               Math.abs(bbox.y + bbox.height - y)
             );
         if (distance < threshold)
          {
            link = new CustomLink();
            link.source({ x: x, y: y });
            link.target({ x: x, y: y });
            link.addTo(that._graph);
          }
      });

      // Moving link
      this._paper.on('blank:pointermove', function(evt, x, y) {
         if (link == true)
          link.target({ x: x, y: y });
      });

      // finish modifying links
      this._paper.on('cell:pointerup blank:pointerup', function(cellView, evt, x, y) {
         FloriaDOM.hide(that._contextMenu);
         if (!link) return;
         var targetElement = that._paper.findViewsFromPoint(link.getTargetPoint())[0];
         if (targetElement)
          link.target({ id: targetElement.model.id });
         link = null;
      });
   }


 ,updateEntityAttributesDisplay: function(canvasName, option, cell, paper)
   {
     let x = cell.attributes.position.x;
     let y = cell.attributes.position.y;
     let showCols = cell.attributes.showColumns || true;
     let showKeys = cell.attributes.showKeys || true;

     if (cell.isLink() == true)
      return;
     if (!cell.get('originalAttributes')) 
      {
        cell.set('originalAttributes', cell.get('attributes') || []);
        cell.set('originalAttributesFk', cell.get('attributesFk') || []);
        cell.set('originalAttributesPk', cell.get('attributesPk') || []);
      }

     switch (option)
      {
        case 'Hide Keys':
          cell.attr('.uml-class-attributes-pk-rect/display', 'none');
          cell.attr('.uml-class-attributes-pk-text/display', 'none');
          cell.attr('.uml-class-attributes-fk-rect/display', 'none');
          cell.attr('.uml-class-attributes-fk-text/display', 'none');
          canvasStateManager.addEntity(canvasName, cell.attributes.name, x, y, showCols, false);
          cell.updateRectangles();
          break;
        case 'Show Keys':
          cell.removeAttr('.uml-class-attributes-fk-rect/display');
          cell.removeAttr('.uml-class-attributes-pk-rect/display');
          cell.removeAttr('.uml-class-attributes-pk-text/display');
          cell.removeAttr('.uml-class-attributes-fk-text/display');
          canvasStateManager.addEntity(canvasName, cell.attributes.name, x, y, showCols, true);
          cell.updateRectangles();
          break;
        case 'Hide Columns':
          cell.attr('.uml-class-attrs-rect/display', 'none');
          cell.attr('.uml-class-attrs-text/display', 'none');
          canvasStateManager.addEntity(canvasName, cell.attributes.name, x, y, true, showKeys);
          cell.updateRectangles();
          break;
        case 'Show Columns':
          cell.removeAttr('.uml-class-attrs-rect/display');
          cell.removeAttr('.uml-class-attrs-text/display');
          canvasStateManager.addEntity(canvasName, cell.attributes.name, x, y, false, showKeys);
          cell.updateRectangles();
          break;
      }
     canvasStateManager.saveState();
     this._paper.findViewByModel(cell).update();
   }

 }
