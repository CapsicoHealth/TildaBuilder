"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";
import { FloriaAjax } from "/static/floria.v2.0/module-ajax.js";
import { FloriaForms } from "/static/floria.v2.0/module-forms2.js";


export var schemas = {};


schemas.paint = function(tildaJsonStr)
 {
   FloriaDOM.setInnerHTML("EDITOR", tildaJsonStr);
 };

