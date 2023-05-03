"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";


export var schemas = {};


schemas.paint = function(tildaJsonStr)
 {
   FloriaDOM.setInnerHTML("EDITOR", tildaJsonStr);
 };

