"use strict";

import { FloriaAjax    } from "./module-ajax.js";
  
if (!String.prototype.isEmpty)
 String.prototype.isEmpty = function()
  {
    for (var i = 0; i < this.length; ++i)
     {
       var c = this[i];
       if (c != ' ' && c != '\t' && c != '\n' && c != '\r')
         return false;
     }
    return true;
  };

export var FloriaDOM = {
    SpanNA: '<SPAN class="NA"></SPAN>',
    getElement : function(e, throwMsg)
      {
        if (e == null)
         {
           console.error("FloriaDOM.getElement() called with null 'e'.");
           return throwMsg != null ? FloriaDOM.alertThrow(throwMsg) : null;
         }
        if (typeof e == "string")
         {
           var elem = document.getElementById(e);
           if (elem == null)
            {
              console.warn("FloriaDOM.getElement(): cannot find element '"+e+"'. throwMsg: "+throwMsg+".");
              return throwMsg != null ? FloriaDOM.alertThrow(throwMsg) : null;
            }
           e = elem;
         }
        return e;
      },
   getAncestorNode: function(e, nodeName)
      {
        e = FloriaDOM.getElement(e);
        while (e != null && e.nodeName != nodeName)
          e=e.parentNode;
        return e;
      },
   getAncestorNodeByClass: function(e, className)
      {
        e = FloriaDOM.getElement(e);
        while (e != null && (e.classList == null || e.classList.contains(className) == false))
         e=e.parentNode;
        return e;
      },
    setInnerHTML: function(e, Str, throwMsg)
      {
        var e = FloriaDOM.getElement(e, throwMsg);
        if (e == null)
          return;
        if (typeof Str == "string")
          {
            e.innerHTML = Str;
          }
        else
          {
            while (e.firstChild) 
              {
                e.removeChild(e.firstChild);
              }
            e.appendChild(Str);
          }
      },
     appendInnerHTML: function(e, Str, throwMsg)
      {
        var e = FloriaDOM.getElement(e, throwMsg);
        if (e == null)
          return;
        if (typeof Str == "string")
          {
            e.innerHTML+= Str;
          }
        else
          {
            e.appendChild(Str);
          }
      },
    nextSiblingNode: function(elementId)
     {
       var e = FloriaDOM.getElement(elementId).nextSibling;
       while (e != null && e.nodeName == "#text")
        e = e.nextSibling;
       return e;        
     },
    insertAfter: function(target, newElement)
     {
       var e = FloriaDOM.getElement(target);
       if (e != null)
        e.parentNode.insertBefore(newElement, e.nextSibling);        
     },
    hasCSS: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
         {
           var cl = e.classList;
           if (cl != null && cl.contains(className) == true)
            return true;
         }
        return false;
      },
    toggleCSS: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
         {
           var cl = e.classList;
           if (cl != null)
             {
               if (cl.contains(className) == true)
                {
                  cl.remove(className);
                  return false;
                }
               cl.add(className);
             }
           return true;
         }
      },
     toggleCSS2: function(e, className1, className2, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
         {
           var cl = e.classList;
           if (cl != null)
             {
               if (cl.contains(className1) == true)
                {
                  cl.remove(className1);
                  cl.add(className2);
                  return className2;
                }
               cl.remove(className2);
               cl.add(className1);
               return className1;
             }
           return null;
         }
      },
      
    addCSS: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.classList != null)
         e.classList.add(className);
      },
    removeCSS: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.classList != null)
         e.classList.remove(className);
      },
    switchCSS: function(baseElementName, Val1, Val2, ClassName)
      {
        if (Val1 != null)
         FloriaDOM.removeCSS(baseElementName+Val1, ClassName);
        FloriaDOM.addCSS(baseElementName+Val2, ClassName);
        return Val2;
      },
    addCSSToParent: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.parentNode != null && e.parentNode.classList != null)
         e.parentNode.classList.add(className);
      },
    removeCSSFromParent: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.parentNode != null && e.parentNode.classList != null)
         e.parentNode.classList.remove(className);
      },
    addCSSToPreviousSibling: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.previousSibling != null && e.previousSibling.classList != null)
         e.previousSibling.classList.add(className);
      },
    removeCSSFromPreviousSibling: function(e, className, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null && e.previousSibling != null && e.previousSibling.classList != null)
         e.previousSibling.classList.remove(className);
      },
    flashCSS: function(element, className, millis)
     {
       FloriaDOM.addCSS(element, className);
       setTimeout(function() {
           FloriaDOM.removeCSS(element, className);
        }, millis);
     },
    show: function(e, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
          e.style.display="";
      },
    hide: function(e, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
          e.style.display="none";
      },
    isHidden: function(e, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        return e != null && e.style.display=="none";
      },
    showHide: function(e, Str)
      {
        var e = FloriaDOM.getElement(e, Str);
        if (e != null)
          e.style.display=e.style.display=="" ? "none" : "";
      },
    switchVisibility: function(divId1, divId2, str)
     {
       FloriaDOM.showHide(divId1, str);
       FloriaDOM.showHide(divId2, str);
     },
    parentWidth: function(e, Str)
      {
        return FloriaDOM.getElement(e, Str).parentNode.offsetWidth;
      },
    alertThrow: function(msg)
      {
        alert(msg);
        throw msg;
      },
    consoleThrow: function(msg)
      {
        console.error(msg);
        throw msg;
      },
    alertConsole: function(msg)
      {
        console.error(msg);
        return alert(msg);
      },
    alertException: function(e, Msg, alsoConsole)
      {
        var Str = (Msg == null ? "" : Msg) + (e.message ? e.message : e.description ? e.description : e) + (e.isEmpty ? "" : "\n\n" + FloriaDOM.printObject(e));
        alert(Str);
        if (alsoConsole == true)
         console.error(Str);
      },
    isFunction: function(obj)
      {
        return !!(obj && obj.constructor && obj.call && obj.apply);
      },
    _printObjectBase: function(Str, Obj, Level)
      {
        if (Level > 5)
         return Str+Obj + "\n";
        for (var prop in Obj)
         {
           var o = Obj[prop];
           if (FloriaDOM.isFunction(o) == true)
             continue;
           for (var i = 0; i < Level; ++i)
             Str += "  ";
           Str += prop + ": ";
           if (Array.isArray(o) == true)
             for (var i = 0; i < o.length; ++i)
               FloriaDOM._printObjectBase(o[i], Level + 1)
           if (typeof o == "object")
             Str += FloriaDOM._printObjectBase(o, Level + 1) + '\n';
           else
             Str += Obj[prop] + "\n";
         }
        return Str;
     },
    printObject: function(Obj)
      {
        var Str = "";
        if (Array.isArray(Obj) == true)
         for (var i = 0; i < Obj.length; ++i)
           Str = FloriaDOM._printObjectBase (Str+i+": ", Obj[i], 1);
        else
          Str = FloriaDOM._printObjectBase (Str, Obj, 1);
        return Str;
      },
    alertObject: function(Obj, level)
      {
        alert(FloriaDOM.printObject(Obj));
      },
    compareValues: function(v1, v2)
      {
        return v1 == v2 ? 0 : v1 > v2 ? 1 : -1;
      },
    randomPick: function(Obj1, Obj2, cutoff)
      {
        return Math.random() < cutoff ? Obj1 : Obj2;
      },
    randomBetween: function(min, max)
      {
        return Math.floor((Math.random() * (max - min)) + min);
      },
    randomBetweenFloat: function(min, max)
      {
        return (Math.random() * (max - min)) + min;
      },
    ElementWaiter: function(elementId, waiterName, func, showError)
      {
        this.elementId = elementId;
        this.waiterName = waiterName;
        this.timer = 10;
        this.timerCount = 0;
        this.func = func;
        this.lastTimeout = null;
        
        this.execute = function()
         {
           if (this.timer <= 0)
            return;
           if (document.getElementById(this.elementId) == null)
            {
              this.timer *= 2;
              this.timerCount+=this.timer;
              if (this.timerCount > 5000)
               FloriaDOM.alertThrow("Waited too long ("+this.timerCount+"ms) for the DOM element '"+this.elementId+"' to be ready for '"+this.waiterName+"");
              var that = this;
              this.lastTimeout = setTimeout(function() { that.execute(); }, this.timer);
            }
           else
             this.func();
         };
         
        this.stop = function()
         {
// console.log("Stopping waiter "+this.waiterName+"."+this.elementId);
           this.timer = -1;
           if (this.lastTimeout != null)
            clearTimeout(this.lastTimeout);
         };
        
// console.log("Starting waiter "+this.waiterName+"."+this.elementId);
        this.execute();
      },
     waitForElement: function(elementId, callbackFunc, timeoutMs)
      {
        this.elementId = elementId;
        this.timeoutMs = timeoutMs==null || timeoutMs < 500 ? 500 : timeoutMs;
        this.timerCount = timeoutMs/50;
        this.callbackFunc = callbackFunc;
        
        this.execute = function()
         {
           var e = document.getElementById(this.elementId);
           if (e == null)
            {
              if (this.timerCount <= 0)
               return this.callbackFunc(false, this.elementId);
              --this.timerCount;
              var that = this;
              setTimeout(function() { that.execute(); }, 50);
            }
           else
            return this.callbackFunc(1, e);
         };
        this.execute();
      },
     mergeProperies: function(Obj1, Obj2, Obj3)
      {
        var Obj = { };
        if (Obj1 != null)
         for(var k in Obj1) if (FloriaDOM.isFunction(k) == false) Obj[k]=Obj1[k];
        if (Obj2 != null)
         for(var k in Obj2) if (FloriaDOM.isFunction(k) == false) Obj[k]=Obj2[k];
        if (Obj3 != null)
          for(var k in Obj3) if (FloriaDOM.isFunction(k) == false) Obj[k]=Obj3[k];
        return Obj;
      },
     filterProperies: function(ObjSrc, Properties)
      {
        var Obj = { };
        for (var i = 0; i < Properties.length; ++i)
         {
           var p = Properties[i];
           Obj[p] = ObjSrc[p];
         }
        return Obj;
      },
     makeUrlParams: function(Obj, asJsonProperties)
      {
        var Str = "";
        if (Obj == null)
         return Str;
        var props = Object.keys(Obj);
        for (var i = 0; i < props.length; ++i)
         {
           var p = props[i];
           var val = Obj[p];
           if (typeof val == "string" || typeof val == "number" || typeof val == "boolean")
            Str+="&"+p+"="+encodeURIComponent(val);
           else if (Array.isArray(val) == true)
             {
               var atLeastOneObject = false;
               for (var j = 0; j < val.length; ++j)
                 {
                   var tov = typeof val[j];
                   if (val[j] != null && tov != "string" && tov != "number" && tov != "boolean")
                     {
                       atLeastOneObject = true;
                       break;
                     }
                 }
               if (atLeastOneObject == true)
                 {
                   if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                    Str+="&"+p+"="+encodeURIComponent(JSON.stringify(val));
                   else
                    FloriaDOM.alertThrow("Unsupported object property '"+p+"' having at least one array element of type 'object' to be converted into a Url parameter")
                 }
               else for (var j = 0; j < val.length; ++j)
                 {
                   if (val[j] != null)
                    Str+="&"+p+"="+encodeURIComponent(val[j]);
                 }
             }
           else if (val != null)
             {
               if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                Str+="&"+p+"="+encodeURIComponent(JSON.stringify(val));
               else
                FloriaDOM.alertThrow("Unsupported object property '"+p+"' of type '"+(typeof val)+"' to be converted into a Url parameter")
             }
         }
        return Str;
      },
     makePostParams: function(Obj, asJsonProperties)
      {
        var data = {};
        if (Obj == null)
         return data;
        var props = Object.keys(Obj);
        for (var i = 0; i < props.length; ++i)
         {
           var p = props[i];
           var val = Obj[p];
           if (typeof val == "string" || typeof val == "number" || typeof val == "boolean")
            data[p]=val;
           else if (Array.isArray(val) == true)
             {
               var atLeastOneObject = false;
               for (var j = 0; j < val.length; ++j)
                 {
                   var tov = typeof val[j];
                   if (val[j] != null && tov != "string" && tov != "number" && tov != "boolean")
                     {
                       atLeastOneObject = true;
                       break;
                     }
                 }
               if (atLeastOneObject == true)
                 {
                   if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                    data[p]=JSON.stringify(val);
                   else
                    FloriaDOM.alertThrow("Unsupported object property '"+p+"' having at least one array element of type 'object' to be converted into a Url parameter")
                 }
               else if (val != null)
                 data[p] = val;
             }
           else if (val != null)
             {
               if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                data[p]=JSON.stringify(val);
               else if ("function" != (typeof val))
                FloriaDOM.alertThrow("Unsupported object property '"+p+"' of type '"+(typeof val)+"' to be converted into a Url parameter")
             }
         }
        return data;
      },
     truncateUrl: function(url)
      {
        var i = url.indexOf("?");
        return i==-1 ? url : url.substring(0, i);
      },
     isNullOrEmpty : function(Str)
      {
        return  Str == null ? true 
              : Array.isArray(Str) == true && Str.length == 0 ? true 
              : typeof Str == "string" ? Str.isEmpty() 
              : false; // Must be some object... Should test if object has no
                        // properties? Maybe a deep test? Performance issues
                        // here perhaps.
      },
     checkParams: function(callerName, paramDefs, inputParams)
      {
        var params = { };
        if (inputParams == null)
         return null;
        var error = false;
        for (var i = 0; i < paramDefs.length; ++i)
         {
           var p = paramDefs[i];
           var v = params[p.name] = inputParams[p.name];
           if (FloriaDOM.isNullOrEmpty(v) == true)
            {
              if (p.val != null)
               v = params[p.name] = p.val;
              else if (p.mandatory == true)
               {
                 console.error(callerName+" called without parameter '"+p.name+"'.");
                 error = true;
               }
            }
         }
        return error == true ? null : params;
      },
     PromptBeforeProceeding: function(Text, Url, Post)
      {
        if (confirm(Text) == true)
        {
          var Form = document.createElement("FORM");
          Form.method = Post == true ? "POST" : "GET";
          Form.action = Url;
          document.body.appendChild(Form);
          Form.submit();
        }
      },
     HoldMomentarily: function(elementIds, size)
      {
        for (var i = 0; i < elementIds.length; ++i)
          FloriaDOM.setInnerHTML(elementIds[i], '<BR><CENTER><IMG src="/static/img/progress.gif" width="' + (size == null ? "20px" : size)
              + '"></CENTER><BR>');
      },
     DelayedEvent: {
        register : function(elementId, timing, func)
          {
            var to = DelayedEvent.eventList[elementId];
            if (to != null)
              {
                window.clearTimeout(to);
              }
            DelayedEvent.eventList[elementId] = setTimeout(function()
              {
                delete DelayedEvent.eventList[elementId];
                func();
              }, timing);
          },
        eventList : new Object()
      },
     // Returns a function, that, as long as it continues to be invoked, will not
     // be triggered. The function will be called after it stops being called for
     // N milliseconds. If `immediate` is passed, trigger the function on the
     // leading edge, instead of the trailing.
     debounce: function(func, wait, immediate)
      {
        var timeout;
        return function()
          {
            var context = this, args = arguments;
            var later = function()
              {
                timeout = null;
                if (!immediate)
                  func.apply(context, args);
              };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
              func.apply(context, args);
          };
      },
     getAbsoluteUrl: (function()
      {
        var a;
        return function(url)
          {
            if (!a)
              a = document.createElement('a');
            a.href = url;
  
            return a.href;
          };
      })(),
     addEvent: function(elementId, eventName, handlerFunc, delayedMillis)
      {
        var e = this.getElement(elementId);
        if (e == null)
         return console.error("Cannot add event to element '"+elementId+"'.");
        var func = (delayedMillis == null) ? function(event) { return handlerFunc(e, event, event.target); }
                                           : function(event) { FloriaDOM.DelayedEvent.register(elementId, delayedMillis, function() { handlerFunc(e, event, event.target); }); }
                                           ;
        e.addEventListener(eventName, func);

        return func;
      },
     fireEvent: function(elementId, eventName)
      {
        var e = this.getElement(elementId);
        if (e == null)
          return console.error("Cannot fire event on element '"+elementId+"' because it cannot be found.");
        if ("createEvent" in document)
         {
           var evt = document.createEvent("HTMLEvents");
           evt.initEvent(eventName, false, true);
           e.dispatchEvent(evt);
         }
        else
         e.fireEvent("on"+eventName);
      },
     getEventHandlers: function(elementId, eventName)
      {
        let e = this.getElement(elementId);
        if (e == null)
         return console.error("Cannot fire event on element '"+elementId+"' because it cannot be found.");

        const types = []; // should be cached of course...
        for (let ev in window)
         if (ev.startsWith("on") == true && (eventName==null || eventName.toLowerCase() == ev.toLowerCase() || "on"+eventName.toLowerCase() == ev.toLowerCase()))
          types.push(ev);
        
        let events = [];
        for (let j = 0; j < types.length; j++)
         if (typeof e[types[j]] === 'function')
          events.push({name: types[j], func: e[types[j]].toString()});
          
        return events;
      },

     setupTooltip: function(elementId, eventName, tooltipTextClassName, ajaxUrlFunc, contentsFunc)
      {
        FloriaDOM.addEvent(elementId, eventName, function(e, event, target) {
          if (target.lastChild.nodeName =='SPAN' && target.lastChild.classList.contains(tooltipTextClassName) == true) // already run
           return;
          if (ajaxUrlFunc != null)
           {
             var ajaxUrlStr = ajaxUrlFunc(target); // Additional check and returns URL string if a call is necessary.
             if (ajaxUrlStr == null)
              return;
             FloriaAjax.ajaxUrl(ajaxUrlStr, "GET", "No data could be fetched", function(data) {
               var node = document.createElement("SPAN");
               node.classList.add(tooltipTextClassName);
               node.innerHTML = contentsFunc(data);
               target.appendChild(node);
             });
           }
          else
           {
               var node = document.createElement("SPAN");
               node.classList.add(tooltipTextClassName);
               node.innerHTML = contentsFunc(data);
               target.appendChild(node);
           }
        });
      },

     toggleNestedRows : function(rows,display)
      {
          if(rows && rows.length > 0)
              for(var x = 0 ; x< rows.length ; ++x )
              {
                  var eachRow = rows.item(x);
                  if(display)
                      eachRow.style.display = display;
                  else
                      eachRow.style.display = (eachRow.style.display) == 'none' ? '' : 'none';
                  if(eachRow.style.display == 'none')
               {
                     var r = document.getElementsByName(eachRow.id);
                     FloriaDOM.toggleNestedRows(r,eachRow.style.display);
                   }
              }
          return true;
      },
     filterRows: function(tableId, inputId)
      {
        var t = FloriaDOM.getElement(tableId);
        if (t == null || t.rows == null || t.rows.length == 0)
         return;
        var e = FloriaDOM.getElement(inputId);
        if (e == null)
          return;
        var v = e.value != null ? e.value.toLowerCase() : "";
        for (var i = 0; i < t.rows.length; ++i)
          {
            var r = t.rows[i];
            var txt = r.textContent;
            if (txt == null)
              continue;
            txt = txt.toLowerCase();
            r.style.display = v == null || txt.indexOf(v) != -1 ? "" : "none";
          }
      },
     filterRowsByFunc: function(tableId, func)
      {
        var t = FloriaDOM.getElement(tableId);
        if (t == null || t.rows == null || t.rows.length == 0)
         return;
        if (func == null)
          return;
        for (var i = 0; i < t.rows.length; ++i)
          {
            var r = t.rows[i];
            r.style.display = func(r)==true ? "" : "none";
          }
      },
     addRow: function(tableElement, className, rowInnerHTML, pos, valign)
      {
        if (pos == null)
         pos = tableElement.rows.length;
        var r = tableElement.insertRow(pos);
        if (className != null)
         r.classList.add(className);
        if (valign != null)
         r.valign=valign;
        r.innerHTML = rowInnerHTML;
      },
     addRows: function(tableElement, className, rowsInnerHTML, pos, valign)
      {
        if (pos == null)
         pos = tableElement.rows.length;
        for (var i = 0; i < rowsInnerHTML.length; ++i)
         {
           var r = tableElement.insertRow(pos);
           if (className != null)
            r.classList.add(className);
           if (valign != null)
            r.valign=valign;
           r.innerHTML = rowsInnerHTML[i];
           ++pos;
         }
      },
     removeRow: function(tableElement, pos)
      {
        if (pos == null)
         pos = tableElement.rows.length-1;
        var r = tableElement.rows[pos];
        if (r != null)
         r.parentNode.removeChild(r);
      },
     removeRows: function(tableElement, start, end)
      {
        if (end == null)
         end = tableElement.rows.length;
        var rows = tableElement.rows;
        for (var i = start; i < end; ++i)
         {
           var r = rows[start];
           if (r != null)
            r.parentNode.removeChild(r);
         }
      },
     getFormElementValue: function (formElement, elementName)
      {
        if (formElement == null)
         return null;
        var f = FloriaDOM.getElement(formElement);
        if (formElement == null)
          return console.warn("FloriaDOM.getFormElementValue: Cannot find form '"+formElement+".");
        var e = f[elementName];
        if (e == null)
          return console.warn("FloriaDOM.getFormElementValue: Cannot find element '"+elementName+"' in Form "+formElement+".");
        return FloriaDOM.getElementValue(e);
      },
     getElementValue: function (e)
      {
        e = FloriaDOM.getElement(e);
        if (e == null)
          return console.warn("FloriaDOM.getElementValue was passed a null element");
        if (Array.isArray(e) == true)
         return console.error("Form has multiple element with name '"+elementName+"'. Cannot get a value.");
        var t = e.nodeName;
        return e == null ? null : t=="SELECT" ? e.options[e.selectedIndex].value : e.value;
      },
     getPos: function(element)
      {
        var l = 0;
        var t = 0;
        if (element.offsetParent)
         {
           do {
              l += element.offsetLeft;
              t += element.offsetTop;
            } while (element = element.offsetParent);
           return {left:l, top:t};
         }
      },
     getViewport: function()
      {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return {width: w, height: h};
      },
     centerElement(e, widthPercent, heightPercent)
      {
        e = FloriaDOM.getElement(e);
        if (e == null)
          return;
        var vp = FloriaDOM.getViewport();
        var x = (vp.width-e.offsetWidth)/2;
        var y = (vp.height-e.offsetHeight)/2;
        e.left = x;
        e.top = y;
      },
     decorateWithDiv: function(e, divId)
      {
         var div = document.createElement("DIV");
         div.setAttribute("id", divId);
         e.parentNode.insertBefore(div, e);
         e.parentNode.removeChild(e);
         div.appendChild(e);
         return div;
      },

     fitBelow: function(topElement, bottomElement, gapPx) 
      {
        topElement = FloriaDOM.getElement(topElement);
        bottomElement = FloriaDOM.getElement(bottomElement);
        if (gapPx == null)
          gapPx = 0;
        bottomElement.style.top = (topElement.offsetHeight+topElement.offsetTop+gapPx)+"px";
      },      
     arraySum: function(a)
      {
        var x = 0;
        if (a != null)
         for (var i = 0; i < a.length; ++i)
          x+=a[i];
        return x;
      },
     clone: function(Obj)
      {
        return JSON.parse(JSON.stringify(Obj));
      },
     downloadFile: function(url, fileName)
      {
        var a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = url;
        a.download = fileName;
        a.click();
        document.body.removeChild(a);
      },
     getUrlParameter : function(url, name)
      {
        if (!url)
         url = window.location.href;
        if (typeof url.searchParams != 'undefined')
         return url.searchParams.get("action");
        name = name.replace(/[\[\]]/g, "\\$&");
          var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
          if (!results)
           return null;
          if (!results[2]) 
           return '';
          return decodeURIComponent(results[2].replace(/\+/g, " "));
      },
     getUrlPath: function(url)
      {
        if (url == null)
         url = window.location.href;
        return url.split(/[?#]/)[0];
      },
     // Checking event target selectors with event bubbling
     on: function(eventName, parentId, childSelector, callbackFn)
     {
       var parentElement = FloriaDOM.getElement(parentId, "Cannot find Element with id='"+parentId+"'");
       if (!Element.prototype.closest) 
         {
           if (!Element.prototype.matches) 
             {
               Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
             }
           Element.prototype.closest = function (s) 
             {
               var el = this;
               var ancestor = this;
               if (!document.documentElement.contains(el))
                 return null;
               do 
                 {
                   if (ancestor.matches(s)) return ancestor;
                   ancestor = ancestor.parentElement;
                 } while (ancestor !== null);
               return null;
             };
         }
       var eventHandler = function(event)
        {
          if (!event.target.closest(childSelector)) return;
          callbackFn.apply(null, arguments);
        }
       parentElement.addEventListener(eventName, eventHandler);
     },   
     isElementHidden: function(el)
      {
        el = FloriaDOM.getElement(el);
        while (el != null)
          {
// console.log("el: ", el);
            if (el.style != null && el.style.display == "none")
             return true;
            el = el.parentNode;
          }
        return false;
      },      
     isElementInViewport: function(el)
      {
        el = FloriaDOM.getElement(el);
        var rect = el.getBoundingClientRect();
// console.log("rect: ", rect, "; window.innerHeight: "+window.innerHeight+";
// document.documentElement.clientHeight:
// "+document.documentElement.clientHeight+"; window.innerWidth:
// "+window.innerWidth+"; document.documentElement.clientWidth:
// "+document.documentElement.clientWidth+";");
        return FloriaDOM.isElementHidden(el) == false
            && rect.bottom >= 0 && rect.right >= 0
            && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
            && rect.left <= (window.innerWidth || document.documentElement.clientWidth)
         ;
      },
     localStorageSet: function(id, obj)
      {
        window.localStorage.setItem(id, JSON.stringify(obj));
      },
     localStorageGet: function(id)
      {
        var data = window.localStorage.getItem(id);
        return data == null ? null : JSON.parse(data);
      },
     isObjectNullOrEmpty: function(obj)
      {
        return obj==null ? true
                         : Object.entries != null ? Object.entries(obj).length === 0 && obj.constructor === Object
                                                  : Object.keys(obj).length === 0 && obj.constructor === Object
             ;
      },
     isObject: function(obj)
      {
        return obj != null && typeof obj === 'object' && Array.isArray(obj) == false;
      },
     buttonSet: function(buttonIds, enabled)
      {
        if (buttonIds == null)
         return;
        for (var i = 0; i < buttonIds.length; ++i)
          {
            var b = document.getElementById(buttonIds[i]);
            if (b != null)
             b.disabled = enabled==true ? false : true;
          }
      },
     
     showImgFullScreen: function(divId, imgSrc, closeFunc, waitingAnimSrc)
      {
        var e = FloriaDOM.getElement(divId);
        if (e == null)
         return;
        e.innerHTML = waitingAnimSrc==null ? '' : '<BR><BR><IMG align="center" height="100px" src="'+waitingAnimSrc+'"><BR>';
        e.style.display="";
        var center = document.createElement("CENTER");
        var img = document.createElement("IMG");
        center.appendChild(img);
        img.onload = function() {
          e.innerHTML = '';
          e.appendChild(center);
          var w = e.offsetWidth-50;
          var h = e.offsetHeight-10;
          if (img.naturalWidth >  img.naturalHeight) //wider than tall
           {
             img.width = w;
             img.height = w * (img.naturalHeight/img.naturalWidth);
           }
          else // taller than wide
           {
             img.width  = h * (img.naturalWidth/img.naturalHeight);
             img.height = h;
           }
          img.style.paddingTop="5px";
        }
        img.src = imgSrc;
        e.onclick = function() {
          e.style.display="none";
          e.innerHTML = '';
          e.onclick = null;
          if (closeFunc != null)
           closeFunc();
        }
      },

     resizeImages: function(divId, imgBoxSize)
      {
        var e = FloriaDOM.getElement(divId);
        if (e == null)
         return;
        var images = e.getElementsByTagName('img');
        if (images == null || images.length == null)
         return;
        
        var stillLoading = false;
        for (var i = 0; i < images.length; ++i)
          {
            var img = images[i];
            if (img.complete == false || img.naturalHeight == 0) // still loading
             {
               img.width = imgBoxSize;
               img.height = imgBoxSize;
               stillLoading = true;
             }
            else if (img.naturalWidth >  img.naturalHeight) //wider than tall
             {
               img.width = imgBoxSize;
               img.height = imgBoxSize * (img.naturalHeight/img.naturalWidth);
             }
            else // taller than wide
             {
               img.width  = imgBoxSize * (img.naturalWidth/img.naturalHeight);
               img.height = imgBoxSize;
             }
          }
        if (stillLoading == true)
         {
           setTimeout(function() { FloriaDOM.resizeImages(divId, imgBoxSize); }, 20);
           return;
         }
      },
 
     showImgGallery: function(divId, imgBoxSize, imgSrcs)
      {
        var e = FloriaDOM.getElement(divId);
        if (e == null)
         return;
        e.style.display="";
        if (imgSrcs == null || imgSrcs.length == 0)
         return FloriaDOM.setInnerHTML(e, "<BR>No images found");

        var cellCount = Math.round(0.90*e.offsetWidth/(imgBoxSize+20)); // affordance of 5% margins on both sides + 10px margin on both sides of images
        var str = '<BR><DIV id="'+divId+'_popup" class="galleryPopup" style="display:none;"></DIV>'
                 +'<TABLE id="'+divId+'_GAL" class="gallery" border="0px" cellpadding="0px" cellspacing="5px" width="96%" align="center">';
        var cellNum = 0;
        for (var i = 0; i < imgSrcs.length; ++i)
         {
           if (FloriaDOM.isObject(imgSrcs[i]) == true)
             {
               if (i != 0)
                str=='</TR>';
               str+='<TR><TD colspan="'+cellCount+'"><H3 style="margin-top:50px">'+imgSrcs[i].gallerySectionLabel+'</H3></TD></TR>';
               ++i;
               cellNum = 0
             }
           if (cellNum == 0)
            str+='<TR height="'+imgBoxSize+'px">';
           str+='<TD><IMG src="'+imgSrcs[i]+'" width="'+imgBoxSize+'" height="'+imgBoxSize+'" title="'+imgSrcs[i]+'"></TD>';
           ++cellNum;
           if (cellNum == cellCount)
             {
               str+='</TR>';
               cellNum = 0;
             }
         }
        str+='</TR></TABLE><BR><BR><BR>';
        FloriaDOM.setInnerHTML(e, str);
        FloriaDOM.resizeImages(e, imgBoxSize);
        FloriaDOM.addEvent(divId+'_GAL', 'click', function(e, event, target) {
          if (target.nodeName!='IMG')
           return;
          FloriaDOM.showImgFullScreen(divId+'_popup', target.src)
        });
      }
      
    ,getCookie: function(name)
      {
        const cookies = document.cookie.split(/\s*;\s*/);
        for (var i = cookies.length - 1; i >= 0; i--)
         {
           const c = cookies[i].split(/\s*=\s*/);
           if (c[0] == name)
            return c[1];
         }
        return null;
      }
    ,setCookie: function(name, value, expiryDays)
      {
        const d = new Date();
        d.setTime(d.getTime() + (expiryDays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
      }
    ,removeCookie: function(name)
      {
        document.cookie = name+'=; Max-Age=-99999999;path=/';
      }      
  };

window.DelayedEvent = FloriaDOM.DelayedEvent;

