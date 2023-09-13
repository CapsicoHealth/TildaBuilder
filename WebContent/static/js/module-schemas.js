"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";

import { ERView } from "/static/js/module-erview.js";


export var schemas = {};


schemas.paint = function(tildaJsonStr)
 {
    
   ERView.start("ER_EDITOR", FloriaDOM.jsonParseWithComments(tildaJsonStr));
    
//   FloriaDOM.setInnerHTML("EDITOR", tildaJsonStr);
 };

