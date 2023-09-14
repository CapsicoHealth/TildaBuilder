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
    
   addEntity(canvasName, entityName, x, y, hideColumns, hideKeys)
    {
      let entity = this.getEntity(canvasName, entityName);
      console.log(entity);
      if (entity == null) // entity is being actually added
       {
         let canvas = this.getCanvas(canvasName);
         if (canvas == null)
          return console.error("Canvas '" + canvasName + "' not found");
         console.log("new entity");
         canvas.entities.push({ "name": entityName, "x": x, "y": y, "hideColumns": hideColumns, "hideKeys": hideKeys });
       }
      else // entity is being updated
       {
          console.log("updated entity--> x: ", x, "; y: ", y, "; hideColumns: ", hideColumns, "; hideKeys: ", hideKeys, ";");
          entity.x = x;
          entity.y = y;
          entity.hideColumns = hideColumns;
          entity.hideKeys = hideKeys;
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
//      const savedState = localStorage.getItem('canvasState');
//      this._canvasData = JSON.parse(savedState);
//      console.log("Canvas Data right after save:", this._canvasData);
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
        canvasStateManager.addEntity(that._canvasName, entityName);
        ERView.showEntityOnCanvas(entityName);
        target.remove();
        this._entityNames.remove(entityName);
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

   paint(canvasName)
    {
      let str = '<UL>';
      for (let i = 0; i < this._entityNames.length; ++i)
       if (canvasStateManager.getEntity(canvasName, this._entityNames[i]) == null)
        str += '<LI>' + this._entityNames[i] + '</LI>'
      str += '</UL>';
      FloriaDOM.setInnerHTML(this._divId, str);
    }
}



export var ERView = {
  _currentTildaSchemaJson: null
 ,_entitiesMap: {}
 ,_paper: null
 ,_graph: null
 ,_contextMenu: $('<ul>', { class: 'context-menu' }).appendTo(document.body).hide()

 ,start: function(mainDivId, entityListDivId, tildaJsonData)
   {
     this._mainDivId = mainDivId;
     this.createEntitiesFromTildaJson(tildaJsonData);
     
     let canvasElement = FloriaDOM.getElement(this._mainDivId + '_CANVAS_CONTAINER');
     if (canvasElement == null)
      return;

     this._graph = new joint.dia.Graph();
     this._paper = new joint.dia.Paper({
        el: canvasElement
       ,width: "98%"
       ,height: 800
       ,model: this._graph
     });
     this.bindContextMenuToPaper();

     this._shelf = new Shelf(entityListDivId);        
     
     canvasStateManager.loadState();
     let currentCanvasState = canvasStateManager.getCurrentCanvas();
     if (currentCanvasState == null)
      currentCanvasState = canvasStateManager.addCanvas("Main")
     this.showCanvas(currentCanvasState);
           
     var that = this;
     $('#' + mainDivId + '_ADD_CANVAS_BUTTON').click(function() { that.addCanvas() });
     $('#' + mainDivId + '_CANVAS_TABS').on('click', '.tab', function() { that.showCanvas($(this).data('canvas-id')) });
   }
   
 ,createEntitiesFromTildaJson: function(tildaJson)
   {
     if (tildaJson.hasOwnProperty('objects') != true)
      return;

     tildaJson['objects'].forEach(entityData => {
       const entityName = entityData.name;

       // Parsing all columns and create a new array of strings allAttributes as "<columnName>:<type>"
       const allAttributes = [];
       entityData.columns.forEach(column => {
         let attribute = column.name;
         if (column.type)
          attribute += `:${column.type}`;
         else if (column.sameAs || column.sameas)
          {
            const refString = column.sameAs || column.sameas;
            const [refEntity, refColumn] = refString.split('.');
            if (refColumn === 'refnum')
             attribute += ':LONG';
            else
             {
               const relatedEntity = tildaJson['objects'].find(obj => obj.name === refEntity);
               if (relatedEntity && relatedEntity.columns)
                {
                  const relatedColumn = relatedEntity.columns.find(col => col.name === refColumn);
                  if (relatedColumn && relatedColumn.type)
                   attribute += `:${relatedColumn.type}`;
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
          {
            const [pkName, pkType] = foundAttr.split(':');
            primaryKeyAttributes.push(`${pkName}:${pkType || ''}`);
          }
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
                  {
                    const [colName, colType] = foundAttr.split(':');
                    foreignKeysWithTypes.push(`${colName}:${colType || ''}`);
                  }
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
          hideKeys: false,
          hideColumns: false,
       });
       
       // Add the entity to the map
       this._entitiesMap[entityName] = NewEntity;
       console.log("Added entity to entitiesMap:", entityName);
     });
   }
   
 ,showCanvas: function(canvasState)
   {
     console.log("canvasState: ", canvasState);
     
     $('.tab.active').removeClass('active');
     let tabId = this._paper.el.id+'_'+(canvasState.id);
     let tab = FloriaDOM.getElement(tabId);
     if (tab == null)
      FloriaDOM.appendInnerHTML(this._mainDivId + '_CANVAS_TABS', '<BUTTON class="tab active" id="'+tabId+'">'+canvasState.name+'</BUTTON>');
     else
      FloriaDOM.addCSS(tab, "active");
      
     this._graph.clear();
     this._shelf.reset(canvasState.name);

     for (let prop in this._entitiesMap)
      {
        let entity = this._entitiesMap[prop];
        if (canvasState.entities.getSE(entity.attributes.name, "name") == null) // not on canvas
         this._shelf.addEntity(entity.attributes.name);
        else
         {
           const key = entity.hideKeys || true;
           const col = entity.hideColumns || true;
           const x = entity.x || 25;
           const y = entity.y || 25;
           that.showEntityOnCanvas(entity.name, this._paper.model, x, y, col, key);
           const cell = this._paper.model.getCell(entity.attributes.id);
           const display_col = col == true ? "Hide Columns" : "Show Columns";
           const display_key = key == true ? "Hide Keys": "Show Keys";
           that.updateEntityAttributesDisplay(display_col, cell, paper, col, key);
           that.updateEntityAttributesDisplay(display_key, cell, paper, col, key);
         }
      }
     this._shelf.paint(canvasState.name);
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

  ,bindContextMenuToPaper: function()
    {
      var that = this;
      
      this._paper.on('cell:contextmenu', function(cellView, evt, x, y) {
         evt.stopPropagation();
         that._contextMenu.css({ left: evt.pageX, top: evt.pageY });
         that.refreshContextMenuForCell(cellView.model, that._paper);
         that._contextMenu.show();
      });

      // Position update
      this._paper.on("cell:pointerup", function(cellview, evt, x, y) {
//         console.log(cellview.model);
//         console.log("pointer up on cell ", cellview.model.id, " pos: ", x, ",", y);
         if (cellview.model.attributes.hideColumns == null)
          cellview.model.attributes.hideColumns = false;
         if (cellview.model.attributes.hideKeys == null)
          cellview.model.attributes.hideKeys = false;
         canvasStateManager.addEntity(that._paper.el.id, cellview.model.attributes.name, x, y, cellview.model.attributes.hideColumns, cellview.model.attributes.hideKeys);
      });

      // scoped variable for link drag and drop logic
      let link = null;

      // Dragging the entities, updating the links
      this._paper.on('cell:pointerdown', function(cellView, evt, x, y) {
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
            link.addTo(graph);
          }
      });

      // Moving link
      this._paper.on('blank:pointermove', function(evt, x, y) {
         if (link == true)
          link.target({ x: x, y: y });
      });

      // finish modifying links
      this._paper.on('cell:pointerup blank:pointerup', function(cellView, evt, x, y) {
         if (!link) return;
         var targetElement = that._paper.findViewsFromPoint(link.getTargetPoint())[0];
         if (targetElement)
          link.target({ id: targetElement.model.id });
         link = null;
      });
    }




    , removeEntityFromCanvas: function(entityModel) {
        const entityName = entityModel.attributes.name;

        this.populateEntityList(entityName);

        var links = this._graph.getConnectedLinks(entityModel);
        var that = this;
        links.forEach(link => {
            that._graph.removeCells([link]);
        });

        this._graph.removeCells([entityModel]);

        entityModel.set('onCanvas', false);

        const activeCanvasID = $('.tab.active').data('canvas-id');
        if (this._canvasData[activeCanvasID] && this._canvasData[activeCanvasID].entities) {
            const index = this._canvasData[activeCanvasID].entities.indexOf(entityName);
            if (index !== -1) {
                this._canvasData[activeCanvasID].entities.splice(index, 1);
            }
        }
        canvasStateManager.removeEntity(activeCanvasID, entityName);
        this._shelf.paint(activeCanvasID);
    }



    , getContextOptions: function(cell) {
        var hideKeys = cell.get('hideKeys') ? 'Show Keys' : 'Hide Keys';
        var hideColumns = cell.get('hideColumns') ? 'Show Columns' : 'Hide Columns';
        return [hideKeys, hideColumns, 'Remove Entity from Canvas'];
    }





    , refreshContextMenuForCell: function(cell, paper) {
        let hideCol = cell.attributes.hideColumns;
        let hideKeys = cell.attributes.hideKeys;
        this._contextMenu.empty();
        //        var options = this.getContextOptions(cell);
        var that = this.
            options.forEach(function(option) {
                $('<li>').text(option).appendTo(contextMenu).on('click', function() {
                    var selectedOption = $(this).text();
                    switch (selectedOption) {
                        case 'Hide Keys':
                            that.updateEntityAttributesDisplay('Hide Keys', cell, paper, hideCol, true);
                            cell.set('hideKeys', true);
                            break;
                        case 'Show Keys':
                            that.updateEntityAttributesDisplay('Show Keys', cell, paper, hideCol, false);
                            cell.set('hideKeys', false);
                            break;
                        case 'Hide Columns':
                            that.updateEntityAttributesDisplay('Hide Columns', cell, paper, true, hideKeys);
                            cell.set('hideColumns', true);
                            break;
                        case 'Show Columns':
                            that.updateEntityAttributesDisplay('Show Columns', cell, paper, false, hideCol);
                            cell.set('hideColumns', false);
                            break;
                        case 'Remove Entity from Canvas':
                            that.removeEntityFromCanvas(cell);
                            break;
                    }
                    that._contextMenu.hide();
                });
            });
    }




    , updateEntityAttributesDisplay: function(option, cell, paper) {

        let x = cell.attributes.position.x;
        let y = cell.attributes.position.y;
        let hideCols = cell.attributes.hideColumns;
        let hideKeys = cell.attributes.hideKeys;
        if (hideCols == null) {
            hideCols = false;
        }
        if (hideKeys == null) {
            hideKeys = false;
        }

        if (cell.isLink()) return;
        if (!cell.get('originalAttributes')) {
            cell.set('originalAttributes', cell.get('attributes') || []);
            cell.set('originalAttributesFk', cell.get('attributesFk') || []);
            cell.set('originalAttributesPk', cell.get('attributesPk') || []);
        }
        // var originalAttributes = cell.get('originalAttributes');
        // var originalAttributesFk = cell.get('originalAttributesFk');
        // var originalAttributesPk = cell.get('originalAttributesPk');

        switch (option) {
            case 'Hide Keys':
                cell.attr('.uml-class-attributes-pk-rect/display', 'none');
                cell.attr('.uml-class-attributes-pk-text/display', 'none');
                cell.attr('.uml-class-attributes-fk-rect/display', 'none');
                cell.attr('.uml-class-attributes-fk-text/display', 'none');
                canvasStateManager.addEntity(paper.el.id, cell.attributes.name, x, y, hideCols, true);
                cell.updateRectangles();

                break;
            case 'Show Keys':
                cell.removeAttr('.uml-class-attributes-fk-rect/display');
                cell.removeAttr('.uml-class-attributes-pk-rect/display');
                cell.removeAttr('.uml-class-attributes-pk-text/display');
                cell.removeAttr('.uml-class-attributes-fk-text/display');
                canvasStateManager.addEntity(paper.el.id, cell.attributes.name, x, y, hideCols, false);
                cell.updateRectangles();
                break;
            case 'Hide Columns':
                cell.attr('.uml-class-attrs-rect/display', 'none');
                cell.attr('.uml-class-attrs-text/display', 'none');
                canvasStateManager.addEntity(paper.el.id, cell.attributes.name, x, y, true, hideKeys);
                cell.updateRectangles();
                break;
            case 'Show Columns':
                cell.removeAttr('.uml-class-attrs-rect/display');
                cell.removeAttr('.uml-class-attrs-text/display');
                canvasStateManager.addEntity(paper.el.id, cell.attributes.name, x, y, false, hideKeys);
                cell.updateRectangles();
                break;
        }
        canvasStateManager.saveState();
        paper.findViewByModel(cell).update();
    }



    , populateEntityList: function(entityName) {
        const entityList = document.getElementById('entity-list');
        const listItem = document.createElement('li');
        listItem.textContent = entityName;

        listItem.addEventListener('click', function() {
            this.showEntityOnCanvas(entityName);
            if (listItem.parentNode === entityList) {
                entityList.removeChild(listItem);
            }
        });

        entityList.appendChild(listItem);
    }





    , showEntityOnCanvas: function(entityName, graphInstance, x, y, hideCol, hideKeys) {
        const entityModel = this._entitiesMap[entityName];
        let activeGraph;
        if (graphInstance) {
            activeGraph = graphInstance;
        }
        else {
            activeGraph = this.getActiveGraph();
        }
        if (entityModel) {
            entityModel.set('onCanvas', true);
        }

        if (entityModel) {
            entityModel.set('onCanvas', true);
            entityModel.position(x, y);
            entityModel.attributes.hideColumns = hideCol;
            entityModel.attributes.hideKeys = hideKeys;
            if (hideCol == null) {
                hideCol = false;
            }
            if (hideKeys == null) {
                hideKeys = false;
            }
            activeGraph.addCells([entityModel]);
            const activeCanvasID = $('.tab.active').data('canvas-id');
            if (this._canvasData[activeCanvasID])
             {
               if (!this._canvasData[activeCanvasID].entities.includes(entityName))
                {
                  console.log(hideCol, hideKeys);
                  console.log("adit");
                  canvasStateManager.addEntity(activeCanvasID, entityName, x, y, hideCol, hideKeys);
                  this._canvasData[activeCanvasID].entities.push(entityName);
                }
             }
            this._shelf.paint(activeCanvasID);
        }
        jsonData.objects.forEach(entityData => {
            if (entityData.foreign) {
                entityData.foreign.forEach(foreignKey => {
                    let sourceModel, destinationModel;

                    if (entityData.name === entityName) {
                        sourceModel = activeGraph.getCell(entityModel.id);
                        destinationModel = activeGraph.getCell(this._entitiesMap[foreignKey.destObject].id);
                    } else if (foreignKey.destObject === entityName) {
                        sourceModel = activeGraph.getCell(this._entitiesMap[entityData.name].id);
                        destinationModel = activeGraph.getCell(entityModel.id);
                    }

                    if (sourceModel && destinationModel) {
                        const link = new joint.shapes.standard.Link();
                        link.source(sourceModel);
                        link.target(destinationModel);
                        activeGraph.addCells([link]);
                    }
                });
            }
        });

        canvasStateManager.saveState();
    }





    , getActiveGraph: function() {
        const activeCanvasID = $('.tab.active').length > 0 ? $('.tab.active').data('canvas-id') : null;
        console.log("active id", activeCanvasID);
        if (this._canvasData.hasOwnProperty(activeCanvasID)) {
            console.log("id", activeCanvasID);
            console.log(canvasData[activeCanvasID]);
            console.log("IN HERE ALL DAY", canvasData[activeCanvasID].graph);
            return this._canvasData[activeCanvasID].graph;
        } else {
            console.error(`Canvas with ID ${activeCanvasID} not found in canvasData.`);
            return null;
        }
    }

}



