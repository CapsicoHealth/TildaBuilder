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
        this._canvasData = [];
    }

    addCanvas(canvasName) {
        let canvas = this.getCanvas(canvasName);
        if (canvas == null) {
            this._canvasData.push({ "name": canvasName, "entities": [], "current": true });
        }
        else {
            canvas.current = true;
        }
    }
    getCanvas(canvasName) {
        for (let i = 0; i < this._canvasData.length; ++i) {
            if (this._canvasData[i].name == canvasName) {
                return this._canvasData[i];
            }
        }
        return null;
    }
    showCanvas(canvasName) {
        for (let i = 0; i < this._canvasData.length; ++i) {
            this._canvasData[i].current = this._canvasData[i].name == canvasName;
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
        console.log("NEW MODEL TEST:", this._canvasData);
        localStorage.setItem('canvasState', JSON.stringify(this._canvasData));
        const savedState = localStorage.getItem('canvasState');
        this._canvasData = JSON.parse(savedState);
        console.log("Canvas Data right after save:", this._canvasData);
    }

    loadState() {
        const savedState = localStorage.getItem('canvasState');
        if (savedState == null)
            return false;
        this._canvasData = JSON.parse(savedState);
        console.log("Canvas Data:", this._canvasData);
        return true;
    }

}
const canvasStateManager = new CanvasState();


class Shelf {
    constructor(divId) {
        this._divId = divId;
        this._entities = [];
    }
    addEntity(entity) {
        if (this._entities.getSE(entity.name, "name") == null)
            this._entities.push(entity);
    }
    paint(canvasName) {
        let str = '<UL>';
        for (let i = 0; i < this._entities; ++i)
            if (canvasStateManager.getEntity(canvasName, this._entities[i].name) == null)
                str += '<LI>' + this._entities[i].name + '</LI>'
        str += '</UL>';
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
    _currentTildaSchemaJson: null
    , _entitiesMap: {}
    , _graph: new joint.dia.Graph()
    , _canvasData: {}
    , _contextMenu: $('<ul>', { class: 'context-menu' }).appendTo(document.body)
    , _currentCellView: null
    , _link: null

    , createEntitiesFromTildaJson: function(tildaJson) {
        if (tildaJson.hasOwnProperty('objects')) {
            tildaJson['objects'].forEach(entityData => {
                const entityName = entityData.name;

                // Parsing all columns and create a new array of strings "<columnName>:<type>"
                const allAttributes = [];
                entityData.columns.forEach(column => {
                    let attribute = column.name;
                    if (column.type) {
                        attribute += `:${column.type}`;
                    }
                    else if (column.sameAs || column.sameas) {
                        const refString = column.sameAs || column.sameas;
                        const [refEntity, refColumn] = refString.split('.');
                        if (refColumn === 'refnum') {
                            attribute += ':LONG';
                        }
                        else {
                            const relatedEntity = tildaJson['objects'].find(obj => obj.name === refEntity);
                            if (relatedEntity && relatedEntity.columns) {
                                const relatedColumn = relatedEntity.columns.find(col => col.name === refColumn);
                                if (relatedColumn && relatedColumn.type) {
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
                    if (foundAttr) {
                        const [pkName, pkType] = foundAttr.split(':');
                        primaryKeyAttributes.push(`${pkName}:${pkType || ''}`);
                    }
                });

                // Handling Foreign Keys columns with the same string values "<columnName>:<type>"
                const foreignKeysWithTypes = [];
                if (entityData.foreign) {
                    entityData.foreign.forEach(fk => {
                        if (fk.srcColumns) {
                            fk.srcColumns.forEach(srcColumn => {
                                const foundAttr = allAttributes.find(attr => attr.startsWith(srcColumn + ":"));
                                if (foundAttr) {
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
                    hideKeys: false,
                    hideColumns: false,
                });
                this._entitiesMap[entityName] = NewEntity;
                console.log("Added entity to entitiesMap:", entityName);
            });
        }
    }


    , createCanvasFromData: function(canvasID, canvasInfo) {
        console.log("canvasinfo", canvasInfo);
        let canvasEl = $('#' + canvasID);
        if (!canvasEl.length)
         canvasEl = $('<div>').addClass('canvas').attr('id', canvasID).appendTo('#' + this._mainDivId + '_CANVAS_CONTAINER').hide();

        const graph = new joint.dia.Graph();
        const paper = new joint.dia.Paper({
            el: canvasEl,
            width: "98%",
            height: 800,
            model: graph
        });

        this.bindContextMenuToPaper(paper);

        let that = this;
        
        $('.tab.active').removeClass('active');
        let tabEl = $(`.tab[data-canvas-id="${canvasID}"]`);
        if (!tabEl.length) {
            tabEl = $('<button>')
                .addClass('tab active')
                .data('canvas-id', canvasID)
                .text(canvasID.replace('canvas', 'Canvas '))
                .appendTo('#' + this._mainDivId + '_CANVAS_TABS');
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
                console.log("col and key", col, key);
                if (col == true) {
                    display_col = "Hide Columns";
                }
                else if (col == false) {
                    display_col = "Show Columns";
                }

                if (key == true) {
                    display_key = "Hide Keys";
                }
                else if (key == false) {
                    display_key = "Show Keys";
                }
                if (key == null) {
                    key = true;
                }
                if (col == null) {
                    key = true;
                }
                let x = canvasInfo.entities[index].x;
                let y = canvasInfo.entities[index].y;
                if (x && y) {
                    that.showEntityOnCanvas(entityName.name, graph, x, y, col, key);
                    console.log(entityName);
                    console.log(that._entitiesMap[entityName.name]);
                    const cell = graph.getCell(that._entitiesMap[entityName.name].attributes.id);
                    that.updateEntityAttributesDisplay(display_col, cell, paper, col, key);
                    that.updateEntityAttributesDisplay(display_key, cell, paper, col, key);
                }
                else {
                    let xrand = Math.random();
                    let yrand = Math.random();
                    that.showEntityOnCanvas(entityName.name, graph, xrand, yrand, col, key);
                    console.log(entityName);
                    console.log(that._entitiesMap[entityName]);
                    const cell = graph.getCell(that._entitiesMap[entityName.name].attributes.id);
                    that.updateEntityAttributesDisplay(display_col, cell, paper, col, key);
                    that.updateEntityAttributesDisplay(display_key, cell, paper, col, key);
                }

            });
        }

        if (canvasInfo.entities && canvasInfo.entities.length) {
            canvasInfo.entities.forEach((entityName, index) => {

                let x = canvasInfo.entities[index].x;
                let y = canvasInfo.entities[index].y;
                if (x && y) {
                    that.showEntityOnCanvas(entityName, graph, x, y);
                }
                else {
                    that.showEntityOnCanvas(entityName, graph);
                }

            });
        }

        this._canvasData[canvasID] = {
            entities: canvasInfo.entities || [],
            graph: graph
        };
    }

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




    ////////////////////  FUNCTIONS ABOVE NEED TO BE CLEANED UP    /////////////////////////////////////
    ////////////////////                                           /////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////






    , bindContextMenuToPaper: function(paperInstance) {

        let link = null;

        var that = this;
        paperInstance.on('cell:contextmenu', function(cellView, evt, x, y) {
            evt.stopPropagation();
            that._contextMenu.css({ left: evt.pageX, top: evt.pageY });
            currentCellView = cellView;
            that.refreshContextMenuForCell(currentCellView.model, paperInstance);
            that._contextMenu.show();
        });

        //        // Debugging position events which fires A LOT!!!! Use pointerup instead (below).
        //        paperInstance.on('change:position',function(element) {
        //            console.log(element.get('position'));
        //        });

        // Position update
        paperInstance.on("cell:pointerup", function(cellview, evt, x, y) {
            console.log(cellview.model);
            console.log("pointer up on cell ", cellview.model.id, " pos: ", x, ",", y);
            if (cellview.model.attributes.hideColumns == null) {
                cellview.model.attributes.hideColumns = false;
            }
            if (cellview.model.attributes.hideKeys == null) {
                cellview.model.attributes.hideKeys = false;
            }
            canvasStateManager.addEntity(paperInstance.el.id, cellview.model.attributes.name, x, y, cellview.model.attributes.hideColumns, cellview.model.attributes.hideKeys);
            // canvasStateManager.saveState();
        });

        // Dragging the entities, updating the links
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

        // Moving link
        paperInstance.on('blank:pointermove', function(evt, x, y) {
            if (link) {
                link.target({ x: x, y: y });
            }
        });

        // finish modifying links
        paperInstance.on('cell:pointerup blank:pointerup', function(cellView, evt, x, y) {
            if (!link) return;

            var targetElement = paperInstance.findViewsFromPoint(link.getTargetPoint())[0];

            if (targetElement) {

                link.target({ id: targetElement.model.id });
            }

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
        this.updateShelfDisplay();
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
            if (this._canvasData[activeCanvasID]) {
                if (!this._canvasData[activeCanvasID].entities.includes(entityName)) {
                    console.log(hideCol, hideKeys);
                    console.log("adit");
                    canvasStateManager.addEntity(activeCanvasID, entityName, x, y, hideCol, hideKeys);
                    this._canvasData[activeCanvasID].entities.push(entityName);
                }
            }

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

        this.updateShelfDisplay();
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

    , updateShelfDisplay: function() {
        const entityList = document.getElementById('entity-list');
        entityList.innerHTML = '';

        for (const entityName in this._entitiesMap) {
            if (!thus._entitiesMap[entityName].get('onCanvas') && !this.isEntityOnAnyCanvas(entityName)) {
                this.populateEntityList(entityName);
            }
        }
    }



    , isEntityOnAnyCanvas: function(entityName) {
        for (let canvasID in this._canvasData) {
            if (this._canvasData[canvasID].entities.includes(entityName)) {
                return true;
            }
        }
        return false;
    }




    , start: function(mainDivId, tildaJsonData) {
        /*        
            var graph = new joint.dia.Graph();
        
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
        */
        this._mainDivId = mainDivId;
        this._contextMenu.hide();
        this.createEntitiesFromTildaJson(tildaJsonData);
        if (canvasStateManager.loadState() == true && canvasStateManager._canvasData.length > 0)
         {
           for (let value in Object.getOwnPropertyNames(canvasStateManager._canvasData))
            this.createCanvasFromData(canvasStateManager._canvasData[value].name, canvasStateManager._canvasData[value]);
         }
        else
          this.createCanvasFromData(mainDivId + '_canvas1', {});
 
        var that = this;
        $('#' + mainDivId + '_ADD_CANVAS_BUTTON').click(function() {
            let canvasNumber = $('.canvas').length + 1;
            let newCanvasID = mainDivId + '_canvas' + canvasNumber;

            // Adding tab
            $('<button>')
                .addClass('tab')
                .data('canvas-id', newCanvasID)
                .text('Canvas ' + canvasNumber)
                .appendTo('#' + mainDivId + '_CANVAS_TABS');

            // Adding canvas
            $('<div>').addClass('canvas').attr('id', newCanvasID).appendTo('#' + mainDivId + '_CANVAS_CONTAINER').hide();

            let newGraph = new joint.dia.Graph();
            let newPaper = new joint.dia.Paper({
                el: $('#' + newCanvasID),
                //            width: "100%",
                //            height: "95%",
                model: newGraph
            });

            that.bindContextMenuToPaper(newPaper);

            // Storing canvas data
            let newCanvasData = {
                entities: [],
                graph: newGraph
            };

            that._canvasData[newCanvasID] = newCanvasData;
            canvasStateManager.addCanvas(newCanvasID);
        });

        $('#' + mainDivId + '_CANVAS_TABS').on('click', '.tab', function() {
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



