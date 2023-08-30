"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";
import { FloriaCollections } from "/static/floria.v2.0/module-collections.js";

import { sampleTildaJsonData } from "./module-testtildajson.js";



const uml = joint.shapes.uml;
const CustomUMLClass = uml.Class.extend({
/*
    initialize: function() {
        this.updateRectangles();
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        
        this.on('change:attributes', function() {
            this.updateRectangles();
            this.findView(paper).update();
        }, this);

        this.on('change:attributesPk', function() {
            this.updateRectangles();
            this.findView(paper).update();
        }, this);
        this.on('change:attributesFk', function() {
            this.updateRectangles();
            this.findView(paper).update();
        }, this);
    }
*/
});


class CanvasState {
    constructor() {
        this.canvasData = [];
    }
    
    addCanvas(canvasName) {
        let canvas = this.getCanvas(canvasName);
        if (canvas == null) {
            this.canvasData.push({ "name": canvasName, "entities": [], "current": true });
        }
        else {
            canvas.current = true;
        }
    }
    getCanvas(canvasName) {
        for (let i = 0; i < this.canvasData.length; ++i) {
            if (this.canvasData[i].name == canvasName) {
                return this.canvasData[i];
            }
        }
        return null;
    }
    showCanvas(canvasName) {
        for (let i = 0; i < this.canvasData.length; ++i) {
            this.canvasData[i].current = this.canvasData[i].name == canvasName;
        }
    }

    addEntity(canvasName, entityName, x, y, hideColumns, hideKeys) {

        let entity = this.getEntity(canvasName, entityName);
        console.log(entity);
        if (entity == null) {
            let canvas = this.getCanvas(canvasName);
            if (canvas == null) {
                console.error("Canvas '" + canvasName + "' not found");
                return;
            }
            console.log("new");
            canvas.entities.push({ "name": entityName, "x": x, "y": y, "hideColumns": hideColumns, "hideKeys": hideKeys });
        }
        else {
            console.log(x, y);
            console.log(hideColumns, hideKeys);
            entity.x = x;
            entity.y = y;
            entity.hideColumns = hideColumns;
            entity.hideKeys = hideKeys;

        }
        this.saveState();
    }

    getEntity(canvasName, entityName) {
        let canvas = this.getCanvas(canvasName);
        if (canvas != null) {
            for (let i = 0; i < canvas.entities.length; i++) {
                if (canvas.entities[i].name == entityName) {
                    return canvas.entities[i];
                }
            }
        }
        if (canvas == null) {
            console.error("Cannot find entity '" + entityName + "' because canvas '" + canvasName + "' cannot be found");
        }
        else {
            console.error("Cannot find entity '" + entityName + "' in canvas '" + canvasName);
        }
        return null;
    }

    removeEntity(canvasName, entityName) {
        let canvas = this.getCanvas(canvasName);
        if (canvas == null) {
            console.error("Canvas '" + canvasName + "' not found");
            return;
        }

        let entityIndex = canvas.entities.findIndex(e => e.name === entityName);
        if (entityIndex === -1) {
            console.error("Entity '" + entityName + "' not found in canvas '" + canvasName + "'");
            return;
        }

        canvas.entities.splice(entityIndex, 1);
        this.saveState();
    }

    saveState() {
        // this.canvasData = canvasData;
        console.log("NEW MODEL TEST:", this.canvasData);
        localStorage.setItem('canvasState', JSON.stringify(this.canvasData));
        const savedState = localStorage.getItem('canvasState');
        this.canvasData = JSON.parse(savedState);
        console.log("Canvas Data right after save:", this.canvasData);
    }

    loadState() {
        const savedState = localStorage.getItem('canvasState');
        if (savedState) {
            this.canvasData = JSON.parse(savedState);
            console.log("Canvas Data:", this.canvasData);
            restoreCanvasStates(this.canvasData, this.entitiesMap);
            console.log(this.canvasData);
        }
    }

}
const canvasStateManager = new CanvasState();


class Shelf
 {
   constructor(divId)
    {
      this._divId = divId;
      this._entities = [];
    }
   addEntity(entity)
    {
      if (this._entities.getSE(entity.name, "name") == null)
       this._entities.push(entity);
    }
   paint(canvasName)
    {
      let str='<UL>';
      for (let i = 0; i < this._entities; ++i)
       if (canvasStateManager.getEntity(canvasName, this._entities[i].name) == null)
        str+='<LI>'+this._entities[i].name+'</LI>'
      str+='</UL>';
      FloriaDOM.setInnerHTML(this._divId, str);
      FloriaDOM.addEvent(this._divId, "click", function(e, event, target) {
         if (target.nodeName != 'LI')
          return;
         let entityName = target.textContent;
         canvasStateManager.addEntity(canvasName, entityName);
         ERView.showEntityOnCanvas(entityName);
         target.remove();
      }, null, true);
    }
 }



export var ERView = {
  _currentTildaSchemaJson = null
 ,_entitiesMap = {}
 ,_graph = new joint.dia.Graph()
 
 ,createEntitiesFromTildaJson = function(tildaJson)
   {
    if (tildaJson.hasOwnProperty('objects'))
     {
       tildaJson['objects'].forEach(entityData => {
         const entityName = entityData.name;
    
         // Parsing all columns and create a new array of strings "<columnName>:<type>"
         const allAttributes = [];
         entityData.columns.forEach(column => {
           let attribute = column.name;
           if (column.type)
            {
              attribute += `:${column.type}`;
            } 
           else if (column.sameAs || column.sameas)
            {  
              const refString = column.sameAs || column.sameas;
              const [refEntity, refColumn] = refString.split('.');
              if (refColumn === 'refnum')
               {
                 attribute += ':LONG';  
               }
              else
               {
                 const relatedEntity = tildaJson['objects'].find(obj => obj.name === refEntity);
                 if (relatedEntity && relatedEntity.columns)
                  {
                    const relatedColumn = relatedEntity.columns.find(col => col.name === refColumn);
                    if (relatedColumn && relatedColumn.type)
                     {
                       attribute += `:${relatedColumn.type}`;
                     }
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
                
         const NewEntity = new CustomUMLClass({
           position: { x: Math.random() * 600, y: Math.random() * 400 },
           size: { width: 200 + longestAttributeLength * 7, height: 100 + allAttributes.length * 12 },
           name: entityName,
           attributes: allAttributes,
           attributesFk: foreignKeysWithTypes,
           attributesPk: primaryKeyAttributes,
           longestAttributeLength: longestAttributeLength,
           methods: [],
//           onCanvas: false,
           hideKeys: false,
           hideColumns: false,
         });
         this._entitiesMap[entityName] = NewEntity;
         console.log("Added entity to entitiesMap:", entityName);
         console.log("Is entity present?", entityName in this._entitiesMap);
       });
     }
   }
    
 ,createCanvasFromData = function(canvasID, canvasInfo)
   {
        console.log("canvasinfo",canvasInfo);
        let canvasEl = $('#' + canvasID);
        if (!canvasEl.length) {
            canvasEl = $('<div>').addClass('canvas').attr('id', canvasID).appendTo('.canvas-container').hide();
        }
        const graph = new joint.dia.Graph();
        const paper = new joint.dia.Paper({
            el: canvasEl,
            width: 800,
            height: 600,
            model: graph
        });
        
        bindContextMenuToPaper(paper); 
    
        $('.tab.active').removeClass('active');
        let tabEl = $(`.tab[data-canvas-id="${canvasID}"]`);
        if (!tabEl.length) {
            tabEl = $('<button>')
                .addClass('tab active')
                .data('canvas-id', canvasID)
                .text(canvasID.replace('canvas', 'Canvas ')) 
                .appendTo('.tabs');
        } else {
            tabEl.addClass('active');
        }
    
        $('.canvas').hide();
        canvasEl.show();
        if (canvasInfo.entities && canvasInfo.entities.length) {
            // const cells = canvasInfo.graph.cells;
            let col;
            let key;
            let display_col;
            let display_key;
            canvasInfo.entities.forEach((entityName, index) => {
                col = canvasInfo.entities[index].hideColumns;
                key = canvasInfo.entities[index].hideKeys;
                console.log("col and key",col,key);
                if (col == true) {
                    display_col = "Hide Columns";
                }
                else if (col == false){
                    display_col = "Show Columns";
                }
                
                if (key == true) {
                    display_key = "Hide Keys";
                }
                else if (key == false){
                    display_key = "Show Keys";
                }
                if (key == null){
                    key = true;
                }
                if (col == null){
                    key = true;
                }
                let x = canvasInfo.entities[index].x;
                let y = canvasInfo.entities[index].y;
                if (x && y){
                    showEntityOnCanvas(entityName.name, graph,x,y,col,key);
                    console.log(entityName);
                    console.log(entitiesMap[entityName.name]);
                    const cell = graph.getCell(entitiesMap[entityName.name].attributes.id);
                    updateEntityAttributesDisplay(display_col, cell, paper, col, key);
                    updateEntityAttributesDisplay(display_key, cell, paper, col, key);
                }
                else {
                    let xrand = Math.random();
                    let yrand = Math.random();
                    showEntityOnCanvas(entityName.name, graph,xrand,yrand,col,key);
                    console.log(entityName);
                    console.log(entitiesMap[entityName]);
                    const cell = graph.getCell(entitiesMap[entityName.name].attributes.id);
                    updateEntityAttributesDisplay(display_col, cell, paper, col, key);
                    updateEntityAttributesDisplay(display_key, cell, paper, col, key);
                }
                
            });
        }
        
        if (canvasInfo.entities && canvasInfo.entities.length) {
            canvasInfo.entities.forEach((entityName, index) => {
                
                let x = canvasInfo.entities[index].x;
                let y = canvasInfo.entities[index].y;
                if (x && y) {
                    showEntityOnCanvas(entityName, graph,x,y);
                }
                else {
                    showEntityOnCanvas(entityName, graph);
                }
                
            });
        }
    
        canvasData[canvasID] = {
            entities: canvasInfo.entities || [],
            graph: graph
        };
    }


  ,start: function()
    {
        canvasStateManager.loadState();
        $('#addCanvasBtn').click(function() {
            let canvasNumber = $('.canvas').length + 1;
            let newCanvasID = 'canvas' + canvasNumber;
            
            // Adding tab
            $('<button>')
                .addClass('tab')
                .data('canvas-id', newCanvasID)
                .text('Canvas ' + canvasNumber)
                .appendTo('.tabs');
            
            // Adding canvas
            $('<div>').addClass('canvas').attr('id', newCanvasID).appendTo('.canvas-container').hide();
        
            let newGraph = new joint.dia.Graph();
            let newPaper = new joint.dia.Paper({
                el: $('#' + newCanvasID),
    //            width: "100%",
    //            height: "95%",
                model: newGraph
            });
            
            bindContextMenuToPaper(newPaper); 
            
            // Storing canvas data
            let newCanvasData = {
                entities: [],
                graph: newGraph
            };
            
            canvasData[newCanvasID] = newCanvasData;
            canvasStateManager.addCanvas(newCanvasID);
        });
        
        $('.tabs').on('click', '.tab', function() {
            $('.canvas').hide(); // Hide all canvases
            
            let canvasID = $(this).data('canvas-id');
            console.log(canvasID);
        
            $('.tab').removeClass('active'); // Mark all tabs as inactive
            $(this).addClass('active'); // Mark the clicked tab as active
            $('#' + canvasID).show(); // Show the clicked canvas
            canvasStateManager.saveState();
        });
    }
}



$(document).ready(function() {

    // let canvasState = new CanvasState();
    // localStorage.clear();
    // console.log(localStorage.getItem('canvasState'));
    
    
    
    
    function restoreCanvasStates(savedCanvasData) {
        for (let value in savedCanvasData) {
            createCanvasFromData(savedCanvasData[value].name, savedCanvasData[value]);
        }
    }
    
    function bindContextMenuToPaper(paperInstance) {
        paperInstance.on('cell:contextmenu', function(cellView, evt, x, y) { 
            evt.stopPropagation(); 
            contextMenu.css({ left: evt.pageX, top: evt.pageY });
            currentCellView = cellView;
            refreshContextMenuForCell(currentCellView.model,paperInstance);
            contextMenu.show();
        });

        paperInstance.on('change:position',function(element) {
            console.log(element.get('position'));
        });

        paperInstance.on( "cell:pointerup", function( cellview, evt, x, y)  {
            console.log(cellview.model);
            console.log( "pointer up on cell ", cellview.model.id, " pos: ", x , ",", y);
            if (cellview.model.attributes.hideColumns == null) {
                cellview.model.attributes.hideColumns = false;
            }
            if (cellview.model.attributes.hideKeys == null) {
                cellview.model.attributes.hideKeys = false;
            }
            canvasStateManager.addEntity(paperInstance.el.id,cellview.model.attributes.name,x,y,cellview.model.attributes.hideColumns,cellview.model.attributes.hideKeys);
            // canvasStateManager.saveState();
        });

        paperInstance.on('cell:pointerdown', function(cellView, evt, x, y) { 
            if (cellView.model.isLink()) return;
        
            var threshold = 10;
        
            var bbox = cellView.model.getBBox();
            var distance = Math.min(
                Math.abs(bbox.x - x),
                Math.abs(bbox.y - y),
                Math.abs(bbox.x + bbox.width - x),
                Math.abs(bbox.y + bbox.height - y)
            );
        
            if (distance < threshold) {
                link = new CustomLink();
        
                link.source({ x: x, y: y });
                link.target({ x: x, y: y });
                link.addTo(graph);
            }
        });
        paperInstance.on('blank:pointermove', function(evt, x, y) {
            if (link) {
                link.target({ x: x, y: y });
            }
        });
        
        paperInstance.on('cell:pointerup blank:pointerup', function(cellView, evt, x, y) {
            if (!link) return;
        
            var targetElement = paperInstance.findViewsFromPoint(link.getTargetPoint())[0];
        
            if (targetElement) {
    
                link.target({ id: targetElement.model.id });
            }
        
            link = null;
        });
         

    }
    var link = null;
    
    function removeEntityFromCanvas(entityModel) {
        const entityName = entityModel.attributes.name;
    
        populateEntityList(entityName);
        
        var links = graph.getConnectedLinks(entityModel);
        links.forEach(link => {
            graph.removeCells([link]);
        });
    
        graph.removeCells([entityModel]);
        
        entityModel.set('onCanvas', false);
    
        const activeCanvasID = $('.tab.active').data('canvas-id');
        if (canvasData[activeCanvasID] && canvasData[activeCanvasID].entities) {
            const index = canvasData[activeCanvasID].entities.indexOf(entityName);
            if (index !== -1) {
                canvasData[activeCanvasID].entities.splice(index, 1);
            }
        }
        canvasStateManager.removeEntity(activeCanvasID,entityName);
        updateShelfDisplay();
    }
    canvasData = {}
    var contextMenu = $('<ul>', { class: 'context-menu' }).appendTo(document.body);

    var currentCellView = null;
    
    function getContextOptions(cell) {
        var hideKeys = cell.get('hideKeys') ? 'Show Keys' : 'Hide Keys';
        var hideColumns = cell.get('hideColumns') ? 'Show Columns' : 'Hide Columns';
        return [hideKeys, hideColumns, 'Remove Entity from Canvas'];
    }
    
    function refreshContextMenuForCell(cell,paper) {
        let hideCol = cell.attributes.hideColumns;
        let hideKeys = cell.attributes.hideKeys;
        contextMenu.empty();
        var options = getContextOptions(cell);
        options.forEach(function(option) {
            $('<li>').text(option).appendTo(contextMenu).on('click', function() {
                var selectedOption = $(this).text();
                switch (selectedOption) {
                    case 'Hide Keys':
                        updateEntityAttributesDisplay('Hide Keys', cell,paper,hideCol,true);
                        cell.set('hideKeys', true);
                        break;
                    case 'Show Keys':
                        updateEntityAttributesDisplay('Show Keys', cell,paper,hideCol,false);
                        cell.set('hideKeys', false);
                        break;
                    case 'Hide Columns':
                        updateEntityAttributesDisplay('Hide Columns', cell,paper,true,hideKeys);
                        cell.set('hideColumns', true);
                        break;
                    case 'Show Columns':
                        updateEntityAttributesDisplay('Show Columns', cell,paper,false,hideCol);
                        cell.set('hideColumns', false);
                        break;
                    case 'Remove Entity from Canvas':
                        removeEntityFromCanvas(cell);
                        break;
                }
                contextMenu.hide();
            });
        });
    }
    
    function updateEntityAttributesDisplay(option,cell,paper) {

        let x = cell.attributes.position.x;
        let y = cell.attributes.position.y;
        let hideCols = cell.attributes.hideColumns;
        let hideKeys = cell.attributes.hideKeys;
        if (hideCols == null) {
            hideCols = false;
        }
        if (hideKeys == null){
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
                canvasStateManager.addEntity(paper.el.id,cell.attributes.name,x,y,hideCols,true);
                cell.updateRectangles();
                
                break;
            case 'Show Keys':
                cell.removeAttr('.uml-class-attributes-fk-rect/display');
                cell.removeAttr('.uml-class-attributes-pk-rect/display');
                cell.removeAttr('.uml-class-attributes-pk-text/display');
                cell.removeAttr('.uml-class-attributes-fk-text/display');
                canvasStateManager.addEntity(paper.el.id,cell.attributes.name,x,y,hideCols,false);
                cell.updateRectangles();
                break;
            case 'Hide Columns':
                cell.attr('.uml-class-attrs-rect/display', 'none');
                cell.attr('.uml-class-attrs-text/display', 'none');
                canvasStateManager.addEntity(paper.el.id,cell.attributes.name,x,y,true,hideKeys);
                cell.updateRectangles();
                break;
            case 'Show Columns':
                cell.removeAttr('.uml-class-attrs-rect/display');
                cell.removeAttr('.uml-class-attrs-text/display');
                canvasStateManager.addEntity(paper.el.id,cell.attributes.name,x,y,false,hideKeys);
                cell.updateRectangles();
                break;
        }
        canvasStateManager.saveState();
        paper.findViewByModel(cell).update();
    }
     
    contextMenu.hide();
    
    function populateEntityList(entityName) {
        const entityList = document.getElementById('entity-list');
        const listItem = document.createElement('li');
        listItem.textContent = entityName;
    
        listItem.addEventListener('click', function() {
            showEntityOnCanvas(entityName);
            if (listItem.parentNode === entityList) {
                entityList.removeChild(listItem);
            }
        });
    
        entityList.appendChild(listItem);
    }
    
    function showEntityOnCanvas(entityName,graphInstance,x,y,hideCol,hideKeys) {
        const entityModel = entitiesMap[entityName];
        let activeGraph;
        if (graphInstance) {
            activeGraph = graphInstance;
        }
        else {
            activeGraph = getActiveGraph();
        }
        if (entityModel) {
            entityModel.set('onCanvas', true);
        }
    
        if (entityModel) {
            entityModel.set('onCanvas', true);
            entityModel.position(x,y);
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
                if (canvasData[activeCanvasID]) {
                    if (!canvasData[activeCanvasID].entities.includes(entityName)) {
                        console.log(hideCol,hideKeys);
                        console.log("adit");
                        canvasStateManager.addEntity(activeCanvasID,entityName,x,y,hideCol,hideKeys);
                        canvasData[activeCanvasID].entities.push(entityName);
                    }
                }
                
        }
        sampleTildaJsonData.objects.forEach(entityData => {
            if (entityData.foreign) {
                entityData.foreign.forEach(foreignKey => {
                    let sourceModel, destinationModel;
    
                    if (entityData.name === entityName) {
                        sourceModel = activeGraph.getCell(entityModel.id);
                        destinationModel = activeGraph.getCell(entitiesMap[foreignKey.destObject].id);
                    } else if (foreignKey.destObject === entityName) {
                        sourceModel = activeGraph.getCell(entitiesMap[entityData.name].id);
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
    
        updateShelfDisplay();
        canvasStateManager.saveState();
        
    }
    function getActiveGraph() {
        const activeCanvasID = $('.tab.active').length > 0 ? $('.tab.active').data('canvas-id') : null;
        console.log("active id",activeCanvasID);
        if (canvasData.hasOwnProperty(activeCanvasID)) {
            console.log("id",activeCanvasID);
            console.log(canvasData[activeCanvasID]);
            console.log("IN HERE ALL DAY",canvasData[activeCanvasID].graph);
            return canvasData[activeCanvasID].graph;
        } else {
            console.error(`Canvas with ID ${activeCanvasID} not found in canvasData.`);
            return null;
        }
    }
    function updateShelfDisplay() {
        const entityList = document.getElementById('entity-list');
        entityList.innerHTML = '';
    
        for (const entityName in entitiesMap) {
            if (!entitiesMap[entityName].get('onCanvas') && !isEntityOnAnyCanvas(entityName)) {
                populateEntityList(entityName);
            }
        }
    }

    
    
    
    function isEntityOnAnyCanvas(entityName) {
        for (let canvasID in canvasData) {
            if (canvasData[canvasID].entities.includes(entityName)) {
                return true;
            }
        }
        return false;
    }
});

