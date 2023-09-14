"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";
import { FloriaForms } from "/static/floria.v2.0/module-forms2.js";

import { schemas } from "./module-schemas.js";
//import { InitializeMonaco } from "./module-monaco.js";



function paintProjectTile(p)
 {
   return `<DIV class="tile360g" data-project-name="${p.name}">
             <SPAN ${p?.schemas?.length > 0 ? 'data-badge="'+p?.schemas?.length+'"':''}><img src="/static/img/${p?.schemas?.length > 0 ? 'folder-blue-full.70x70.png':'folder-blue-empty.70x70.png'}"/></SPAN>
             <div>${p.name}</div>
             <div>${p.rootPath}</div>
             <div>${p.description}</div>
           </DIV>
          `
         ;
 }

const schemaRegex = /(.*)[\\/]_tilda\.(.*)\.json/;
function paintSchemaTile(projectName, fullSchemaPath)
 {
   let matches = fullSchemaPath.match(schemaRegex);
   console.log(fullSchemaPath+": ", matches);
   if (matches == null || matches.length != 3)
    return window.alert("Cannot parse '"+fullSchemaPath+"' as a Tilda schema ful path.");
   return `<DIV class="schema" data-project-name="${projectName}" data-full-schema-path="${fullSchemaPath}">
             <div>${matches[2]}</div>
             <div>${matches[1]}</div>
           </DIV>
          `
         ;
 }


function parseSchemaName(schemaPath)
 {
   var i = schemaPath.lastIndexOf("/");
   schemaPath = schemaPath.substring(i+1);
   var i = schemaPath.indexOf(".");
   var j = schemaPath.lastIndexOf(".");
   return schemaPath.substring(i+1, j);
 }


/*
var _SAMPLE_PROJECTS = [
     { "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase", "schemaCount":4 }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
    ,{ "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src", "schemaCount":58 }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase" }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
    ,{ "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase" }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
    ,{ "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase" }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
    ,{ "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase" }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
   ]
   ;
*/

var projects = {};

var currentProjectList = null;
var currentDivId = null;

function getProject(projectList, name)
 {
   if (projectList != null)
    for (let i = 0; i < projectList.length; ++i)
     if (projectList[i].name == name)
      return projectList[i];
   return null;
 }


projects.getProjectList = function(callbackFunc, errorFunc)
 {
   FloriaAjax.ajaxUrl("/svc/project/list", "GET", "Cannot get projects", function(projectList) {
       currentProjectList = projectList;
       callbackFunc(projectList);
   }, function() {
       if (errorFunc != null)
        errorFunc();
       else
        FloriaDOM.alertThrow("ERROR getting the project list.");
       currentProjectList = null;
   });

 };

projects.paintProjectList = function(divId, projectList)
 {
   currentDivId = divId;
   let str = "";
   if (projectList == null || projectList.length == 0)
    str = "No projects projectList been found. Create one!";
   for (let i = 0; i < projectList.length; ++i)
    str+=paintProjectTile(projectList[i], true)+"\n";
   FloriaDOM.setInnerHTML(divId, str);
   FloriaDOM.addEvent(divId, "click", projects.selectProject)
 };

projects.selectProject = function(e, event, target)
 {
   while (target != null && target != e && target.dataset.projectName == null)
    target = target.parentNode;
   
   if (target?.dataset?.projectName == null)
    return;

   projects.paintProject(target?.dataset?.projectName);
 }

projects.paintProject = function(projectName)
 {
   var title = FloriaDOM.getElement("HEADER_TITLE");
   title.innerHTML = "TIDE / "+projectName;
   
   let p = getProject(currentProjectList, projectName);
   FloriaDOM.switchVisibility("MAINCONTAINER_PROJECTS", "MAINCONTAINER_SCHEMAS");
   
   FloriaAjax.ajaxUrl("/svc/project/schemas?projectName="+projectName+"&ts="+new Date(), "GET", "Cannot get list of schemas for this project", function(schemaList) {
       let str = "";
       for (var i = 0; i < schemaList.length; ++i)
        {
          let s = schemaList[i];
          str+=paintSchemaTile(projectName, s);
        }
       FloriaDOM.setInnerHTML("SCHEMA_LIST", str);
       FloriaDOM.addEvent("SCHEMA_LIST", "click", projects.selectSchema)
    })  
 }

projects.selectSchema = function(e, event, target)
 {
   while (target != null && target != e && target.dataset.projectName == null && target.dataset.schemaFullPath == null)
    target = target.parentNode;
   
   if (target?.dataset?.projectName == null)
    return;
   projects.paintSchema(target, target.dataset.projectName, target.dataset.fullSchemaPath);
 }

projects.paintSchema = function(div, projectName, fullSchemaPath)
 {
   FloriaDOM.toggleCSS(div, "selected");

   var title = FloriaDOM.getElement("HEADER_TITLE");
   title.innerHTML = "TIDE / "+projectName+" / "+parseSchemaName(fullSchemaPath);
   FloriaDOM.switchVisibility("MAINCONTAINER_SCHEMAS", "MAINCONTAINER_ENTITIES");
   FloriaAjax.ajaxUrl("/svc/project/schema/details?projectName="+encodeURIComponent(projectName)+"&fullSchemaPath="+encodeURIComponent(fullSchemaPath)+"&ts="+new Date(), "GET", "Cannot get the schema for this project", function(tildaJson) {

       //FloriaDOM.setInnerHTML("EDITOR", tildaJson);
       schemas.paint(tildaJson);
//       InitializeMonaco(tildaJson);
    })  
 }



projects.start = function(divId)
 {
   projects.getProjectList(function(projectList) {
        projects.paintProjectList(divId, projectList);
   }, function() {
        FloriaDOM.setInnerHTML(divId, "An error occurred getting the project list");
   });
 }


projects.addProject = function(divId)
 {
   FloriaAjax.ajaxUrl("/static/json/ProjectForm.json?"+new Date(), "GET", "Cannot get project form definition", function(formDef) {
      let f = new FloriaForms("ProjectForm", { }, formDef, 4, function(data, refresh) {
          if (refresh == true)
           {
             FloriaAjax.ajaxUrl("/svc/project/add", "POST", "Cannot create project", function(projectList) { 
                 f.closeDialog();
                 projects.paintProjectList(divId, projectList);
             }, null, data);
           }
      }, "New Project", true, null, null, null, true, true);
      f.paint(0, null, null, 0.6, 0.4);
   });
 }


export var projects;
