"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";
import { FloriaCollections } from "/static/floria.v2.0/module-collections.js";

//import { sampleTildaJsonData } from "./module-testtildajson.js";



const CustomUMLClass = joint.shapes.uml.Class.extend({});


class CanvasState
 {
   constructor()
    {
      this._canvasData = [];
      // LDH-NOTE: We should really cache the current canvas 
      //this._currentCanvas = null;
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
      // update current flag
      this.setCurrentCanvasByName(canvasName);
      return canvas;
    }

   getCanvas(canvasName)
    {
      for (let i = 0; i < this._canvasData.length; ++i)
       if (this._canvasData[i].name == canvasName)
        return this._canvasData[i];
      return null;
    }

   setCurrentCanvasByName(canvasName)
    {
      let currentCanvas = null;
      for (let i = 0; i < this._canvasData.length; ++i)
       {
         let current = this._canvasData[i].name == canvasName;
         this._canvasData[i].current = current;
         if (current == true)
          currentCanvas = this._canvasData[i];
       }
      this.saveState();
      return currentCanvas;
    }
   setCurrentCanvasById(canvasId)
    {
      let currentCanvas = null;
      for (let i = 0; i < this._canvasData.length; ++i)
       {
         let current = this._canvasData[i].id == canvasId;
         this._canvasData[i].current = current;
         if (current == true)
          currentCanvas = this._canvasData[i];
       }
      this.saveState();
      return currentCanvas;
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

   setZoomLevel(zoomLevel)
    {
      let currentCanvas = this.getCurrentCanvas();
      currentCanvas.zoomLevel = zoomLevel;
      this.saveState();
    }
    
   addEntity(canvasName, entityName, x, y, showColumns, showKeys)
    {
      let entity = this.getEntity(canvasName, entityName);
//      console.log(entity);
      if (entity == null) // entity is being actually added
       {
         let canvas = this.getCanvas(canvasName);
         if (canvas == null)
          return console.error("Canvas '" + canvasName + "' not found");
         console.log("new entity");
         canvas.entities.push({ "name": entityName, "x": x, "y": y, "showColumns": showColumns, "showKeys": showKeys, "vertices":{} });
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
    
   addLink(canvasName, entitySrcName, entityDstName, vertices)
    {
      let entity = this.getEntity(canvasName, entitySrcName);
      if (entity == null)
       return;
      entity.vertices[entityDstName] = vertices.slice();
      this.saveState();
    }

   saveState()
    {
      FloriaAjax.ajaxUrl("/svc/project/schema/state/save?projectName="+encodeURIComponent(this._projectName)
                                                      +"&schemaName="+encodeURIComponent(this._schemaName)
                                                      +"&fullSchemaPath="+encodeURIComponent(this._fullSchemaPath)
                                                      +"&state="+encodeURIComponent(JSON.stringify(this._canvasData))
                                                      +"&ts="+new Date(), "POST", "Cannot get the schema for this project", function(canvasState) {
      });
//      localStorage.removeItem('canvasState');
    }

   /** Loads the state from the server. If not available, check the browser's cache
      in case there is something already in there from a previous session before the 
      save-to-server functionality was developed
    */
   loadState(projectName, schemaName, fullSchemaPath, callbackFunc)
    {
      this._projectName = projectName;
      this._schemaName = schemaName;
      this._fullSchemaPath = fullSchemaPath;
      let that = this;
      FloriaAjax.ajaxUrl("/svc/project/schema/state/get?projectName="+encodeURIComponent(this._projectName)
                                                     +"&schemaName="+encodeURIComponent(this._schemaName)
                                                     +"&fullSchemaPath="+encodeURIComponent(this._fullSchemaPath)
                                                     +"&ts="+new Date(), "GET", "Cannot get the schema for this project", function(canvasState) {
         if (canvasState == null)
          canvasState = localStorage.getItem('canvasState');

         if (canvasState == null)
          that._canvasData = { };
         else
          that._canvasData = JSON.parse(canvasState);
         console.log("Loading canvas state: ", that._canvasData);
         callbackFunc();   
      });
    }
 }

const canvasStateManager = new CanvasState();



class Shelf
 {
   constructor(divId, inputIdSearch, entities)
    {
      this._divId = divId;
      this._entityNames = [];
      this._filterStr = '';
      for (let i = 0; i < entities.length; ++i)
       this._entityNames.push({name: entities[i].attributes.name, onCanvas:false});
      this._canvasName = null;
      
      var that = this;
      FloriaDOM.addEvent(this._divId, "click", function(e, event, target) {
        if (target.nodeName != 'LI')
         return;
        let entityName = target.textContent;
        let i = that._entityNames.indexOfSE(entityName, "name");
        if (i == -1)
         return console.warn("Entity '"+entityName+"' cannot be found on the shelf after the click event.")
        if (that._entityNames[i].onCanvas == true)
         return;
        ERView.addEntityToCanvas(entityName);
        target.classList.add("onCanvas");
        that.removeEntity(entityName);
      }, null, true);
      
      if (inputIdSearch != null)
       FloriaDOM.addEvent(inputIdSearch, "keyup", function(e, event, target) {
         that._filterStr = target.value;
         that.paint();
      }, 200, true);

    }
    
   addEntity(entityName)
    {
      let i = this._entityNames.indexOfSE(entityName, "name");
      if (i == -1)
       return console.warn("Cannot find entity '"+entityName+"' in the shelf to add.");
      this._entityNames[i].onCanvas = true;
    }
   removeEntity(entityName)
    {
      let i = this._entityNames.indexOfSE(entityName, "name");
      if (i == -1)
       return console.warn("Cannot find entity '"+entityName+"' in the shelf to remove.");
      this._entityNames[i].onCanvas = false;
    }

   reset(canvasName)
    {
      for (let i = 0; i < this._entityNames.length; ++i)
       this._entityNames[i].onCanvas = false;
      this._canvasName = canvasName;
    }

   paint()
    {
      const re = new RegExp(this._filterStr.replaceAll(' ', "\\s+"), 'i');
      let str = '<UL class="entityShelf">\n';
      for (let i = 0; i < this._entityNames.length; ++i)
       if (this._entityNames[i].name.match(re) != null)
        str += '<LI class="'+(this._entityNames[i].onCanvas==true?'onCanvas':'')+'">' + this._entityNames[i].name + '</LI>\n'
      str += '</UL>\n';
      FloriaDOM.setInnerHTML(this._divId, str);
    }
}





var CustomLink = joint.shapes.standard.Link.extend({
  defaults: joint.util.deepSupplement({
     type: 'CustomLink'
    ,z: -1
//    ,connector: { name: 'jumpover', args: {size:8, jump:'arc'} }
    ,connector: { name: 'rounded', args: {radius:20} }
//    ,connector: { name: 'smooth'}
    ,router: { name: 'normal' }
//    ,router: { name: 'metro' | 'orthogonal' | 'manhattan' | 'normal' }
  }, joint.shapes.standard.Link.prototype.defaults)
});


var toolsView = new joint.dia.ToolsView({tools: [new joint.linkTools.Vertices({stopPropagation: false})
                                                ,new joint.linkTools.Segments({stopPropagation: false})
                                                ]});

function hasFK(entitySrc, entityDst)
 {
   // LDH-NOTE: Very simple matching which may not work in all cases, i.e., if full
   //          object path is provided, FK across schemas etc...
   if (entitySrc.foreign != null)
    for (let i = 0; i < entitySrc.foreign.length; ++i)
     if (entitySrc.foreign[i].destObject == entityDst.name)
      return true;
   return false;
 }



function createContextenu()
 {
   var e = document.createElement('UL');
   e.classList.add("context-menu");
   e.style.display="none";
   document.body.appendChild(e);
   return e;
 }

export var ERView = {
  _entities: []
 ,_paper: null
 ,_graph: null
 ,_canvasElement: null
 ,_contextMenu: createContextenu()
 ,_currentCanvasState: null
 
 ,getEntity: function(entityName)
   {
     for (var i = 0; i < this._entities.length; ++i)
      {
        var e = this._entities[i];
        if (e.attributes.name == entityName)
         return e;
      }
     return console.warn("Cannot find entity '"+entityName+"' in ERView._entities.")
   }

 ,start: function(mainDivId, entityListDivId, searchInputId, projectName, schemaName, fullSchemaPath, tildaJsonData)
   {
     this._mainDivId = mainDivId;
     this.createEntitiesFromTildaJson(tildaJsonData);
     
     this._canvasElement = FloriaDOM.getElement(this._mainDivId + '_CANVAS_CONTAINER');
     if (this._canvasElement == null)
      return;
     this._canvasElement.innerHTML = '<DIV></DIV>';

     this._graph = new joint.dia.Graph();
     this._paper = new joint.dia.Paper({
        el: this._canvasElement.childNodes[0]
       ,width: "2000px"
       ,height: "2000px"
       ,model: this._graph
       ,gridSize: 10
     });
//     this._paper.setGrid({ name: 'mesh', args: { color: '#999', thickness:1 }});
//     this._paper.drawGrid()

     this._shelf = new Shelf(entityListDivId, searchInputId, this._entities);        
     
     let that = this;
     canvasStateManager.loadState(projectName, schemaName, fullSchemaPath, function() {
         that._currentCanvasState = canvasStateManager.getCurrentCanvas();
         if (that._currentCanvasState == null)
          that._currentCanvasState = canvasStateManager.addCanvas("Main")
          
         let str = '';
         for (let i = 0; i < canvasStateManager._canvasData.length; ++i)
          {
            let canvas = canvasStateManager._canvasData[i];
            let tabId = that._canvasElement.id+'_'+canvas.id;
            str+='<BUTTON class="tab" id="'+tabId+'" data-canvasid="'+canvas.id+'">'+canvas.name+'</BUTTON>';
          }
         if (str != '')
          FloriaDOM.setInnerHTML(that._mainDivId + '_CANVAS_TABS', str);
         
         that.showCurrentCanvas();
    
         that.bindEventHandlersToPaper();
    
         $('#' + mainDivId + '_ADD_CANVAS_BUTTON').click(function() { that.addCanvas(); });
         $('#' + mainDivId + '_CANVAS_TABS').on('click', '.tab', function(e) {
              that._currentCanvasState = canvasStateManager.setCurrentCanvasById(e.target.dataset.canvasid);
              that.showCurrentCanvas();
         });
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
          entityDefinition: entityData,
          showKeys: true,
          showColumns: true,
       });
       
       // Add the entity to the map
       this._entities.push(NewEntity);
       console.log("Added entity to entitiesMap:", entityName);
     });
   }
   
 ,showCurrentCanvas: function()
   {
     $('.tab.active').removeClass('active');
     let tabId = this._canvasElement.id+'_'+(this._currentCanvasState.id);
     let tab = FloriaDOM.getElement(tabId);
     if (tab == null)
      FloriaDOM.appendInnerHTML(this._mainDivId + '_CANVAS_TABS', '<BUTTON class="tab active" id="'+tabId+'">'+this._currentCanvasState.name+'</BUTTON>');
     else
      FloriaDOM.addCSS(tab, "active");
      
     this._graph.clear();
     this._zoomLevel = this._currentCanvasState.zoomLevel || 1;
     this._zoom();
      
     for (let i = 0; i < this._entities.length; ++i)
      this._entities[i].set('onCanvas', false);
     this._shelf.reset(this._currentCanvasState.name);

     for (let i = 0; i < this._entities.length; ++i)
      {
        let entity = this._entities[i];
        let canvasStateEntity = canvasStateManager.getEntity(this._currentCanvasState.name, entity.attributes.name);
        if (canvasStateEntity != null) // on canvas
         {
           this._shelf.addEntity(entity.attributes.name);
           this.addEntityToCanvas(entity.attributes.name
                                , canvasStateEntity.x || 25
                                , canvasStateEntity.y || 25
                                , canvasStateEntity.showColumns || true
                                , canvasStateEntity.showKeys || true
                                , canvasStateEntity.vertices);
         }
      }
     this._shelf.paint();
   }
   
   
 ,addEntityToCanvas: function(entityName, x, y, showCol, showKeys, vertices)
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

     for (let i = 0; i < this._entities.length; ++i)
      {
        let entity2 = this._entities[i];
        if (entity2.get('onCanvas') == true)
         {
           if (hasFK(entity.attributes.entityDefinition, entity2.attributes.entityDefinition) == true)
            {
              const link = new CustomLink();
              link.source(entity);
              link.target(entity2);
              if (vertices != null)
               link.vertices(vertices[entity2.attributes.entityDefinition.name]);
              this._graph.addCells([link]);
            }
           if (hasFK(entity2.attributes.entityDefinition, entity.attributes.entityDefinition) == true)
            {
              const link = new CustomLink();
              link.source(entity2);
              link.target(entity);
              if (vertices != null)
               link.vertices(vertices[entity.attributes.entityDefinition.name]);
              this._graph.addCells([link]);
            }
         }
      }
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
     this._shelf.removeEntity(entityModel.attributes.name);
     this._shelf.paint();
   }
   


 ,addCanvas: function()
   {
     var canvasName = prompt("Please enter your new canvas' name");
     let canvasNumber = $('.canvas').length + 1;
     let tabId = this._canvasElement.id+'_'+canvasNumber;

     // Adding tab
     FloriaDOM.appendInnerHTML(this._mainDivId + '_CANVAS_TABS', '<BUTTON class="tab" id="'+tabId+'" data-canvasid="'+canvasNumber+'">'+canvasName+'</BUTTON>');
     this._currentCanvasState = canvasStateManager.addCanvas(canvasName);
     this.showCurrentCanvas();
   }


    , _zoomLevel: 1
    , _zoom: function() {
        this._paper.scale(this._zoomLevel);
        canvasStateManager.setZoomLevel(this._zoomLevel);
    }
    , zoomIn: function() {
        this._zoomLevel = Math.min(5, this._zoomLevel + 0.2);
        this._zoom();
    }
    , zoomOut: function() {
        this._zoomLevel = Math.max(0.2, this._zoomLevel - 0.2);
        this._zoom();
    }

 ,bindEventHandlersToPaper: function()
   {
      var that = this;
      // scoped variable for context menu
      let contextMenuCell = null;
      FloriaDOM.addEvent(this._contextMenu, "click", function(e, event, target) {
         if (target.nodeName != 'LI')
          return;
         var selectedOption = target.innerText;
         if (selectedOption == 'Zoom In')
          that.zoomIn();
         else if (selectedOption == 'Zoom Out')
          that.zoomOut();
         else if (selectedOption == 'Remove from Canvas')
          that.removeEntityFromCanvas(contextMenuCell);
         else
          {
                 if (selectedOption == 'Show Keys'   ) contextMenuCell.set('showKeys', true);
            else if (selectedOption == 'Hide Keys'   ) contextMenuCell.set('showKeys', false);
            else if (selectedOption == 'Show Columns') contextMenuCell.set('showColumns', true);
            else if (selectedOption == 'Hide Columns') contextMenuCell.set('showColumns', false);
            that.updateEntityAttributesDisplay(that._currentCanvasState.name, selectedOption, contextMenuCell, that._paper);
          }
         FloriaDOM.hide(that._contextMenu);
      });
      
      this._paper.on('element:contextmenu', function(cellView, evt, x, y) {
         evt.stopPropagation();
         that._contextMenu.style.left=evt.pageX+"px";
         that._contextMenu.style.top=evt.pageY+"px";
         var str = '<LI>'+(cellView.model.get('showKeys'   ) != true ? 'Show Keys'    : 'Hide Keys')+'</LI>'
                  +'<LI>'+(cellView.model.get('showColumns') != true ? 'Show Columns' : 'Hide Columns')+'</LI>'
                  +'<LI>Remove from Canvas</LI>'
                  ;
         that._contextMenu.innerHTML = str;
         FloriaDOM.show(that._contextMenu);
         contextMenuCell = cellView.model;
      });

      this._paper.on('blank:contextmenu', function(evt, x, y) {
         evt.stopPropagation();
         that._contextMenu.style.left=evt.pageX+"px";
         that._contextMenu.style.top=evt.pageY+"px";
         var str = '<LI>Zoom In</LI>'
                  +'<LI>Zoom Out</LI>'
                  ;
         that._contextMenu.innerHTML = str;
         FloriaDOM.show(that._contextMenu);
         contextMenuCell = null;
      });

      // Element/Entity move
      this._paper.on("element:pointerup", function(cell, evt, x, y) {
        cell.model.toFront();
        FloriaDOM.hide(that._contextMenu);
        var a = cell.model.attributes;
        canvasStateManager.addEntity(that._currentCanvasState.name, a.name, a.position.x, a.position.y, a.showColumns, a.showKeys);
      });
      
      // Link tools
      this._paper.on('link:mouseenter', function(linkView) {
         linkView.addTools(toolsView);
      });
      this._paper.on('link:mouseleave', function(linkView) {
         linkView.removeTools();
      });
      this._paper.on('link:pointerup link:pointerdblclick', function(linkView, evt, x, y ) {
         canvasStateManager.addLink(that._currentCanvasState.name, linkView.sourceView.model.attributes.name, linkView.targetView.model.attributes.name, linkView.model.attributes.vertices);
      });
      
      // clear popup menu
      this._paper.on('blank:pointerup', function(cellView, evt, x, y) {
         FloriaDOM.hide(that._contextMenu);
      });

/*      
      this._paper.on("blank:mousewheel", function(evt, x, y, delta) {
         evt.preventDefault();
         if (delta > 0)
          that.zoomIn();
         else
          that.zoomOut();
      });
*/

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
