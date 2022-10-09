"use strict";

import { FloriaDOM } from "/static/floria/module-dom.js";
import { FloriaAjax } from "/static/floria/module-ajax.js";
import { FloriaForms } from "/static/floria/module-forms2.js";


function paintProjectTile(p)
 {
   return `<DIV class="tile360g" data-projectName="${p.name}">
             <img src="/static/img/briefcase.jpg"/>
             <div>${p.name}</div>
             <div>${p.rootPath}</div>
             <div>${p.description}</div>
           </DIV>
          `
         ;
 }


var _SAMPLE_PROJECTS = [
     { "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
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
    ,{ "name":"FHIR Model"  , "description":"Operational FHIR-inspired Model"  , "rootPath":"C:\\Projects\\repos-hmhn\\hmh-da-fhir-datamodel\\HMHN_FHIR\\src" }
    ,{ "name":"Capsico Base", "description":"Capsico Base Models"              , "rootPath":"C:\\Projects\\repos\\CapsicoBase" }
    ,{ "name":"Capsico Main", "description":"Capsico Main Models"              , "rootPath":"C:\\Projects\\repos\\Capsico"     }
   ]
   ;


var projects = {};

projects.paint = function(divId)
 {
   FloriaAjax.ajaxUrl("/svc/project/list", "GET", "Cannot get projects", function(data) {
       let str = "";
       if (data == null || data.length == 0)
        {
          str+="No projects have been found. Create one!";
        } 
       else for (let i = 0; i < data.length; ++i)
        str+=paintProjectTile(data[i], true)+"\n";
       FloriaDOM.setInnerHTML(divId, str);
   }, function() {
       alert("ERROR!");
   });

 };
 
projects.addProject = function()
 {
   FloriaAjax.ajaxUrl("/static/json/ProjectForm.json", "GET", "Cannot get project form definition", function(formDef) {
      let f = new FloriaForms(null, { }, formDef, 4, function(data, refresh) {
          alert("Hello!");
      }, "AI Workbench - Model Builder", true)//, null, null, null, true);
      f.paint(0);
   });
 }


export var projects;
