"use strict";

define([], function()
{

  
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

var SuperDOM = {
    getElement : function(e, throwMsg)
      {
        if (e == null)
         {
           console.warn("SuperDOM.getElement() called with null 'e'.");
           return throwMsg != null ? SuperDOM.alertThrow(throwMsg) : null;
         }
        if (typeof e == "string")
         {
           var elem = document.getElementById(e);
           if (elem == null)
            {
        	    console.warn("SuperDOM.getElement(): cannot find element '"+e+"'. throwMsg: "+throwMsg+".");
              return throwMsg != null ? SuperDOM.alertThrow(throwMsg) : null;
            }
           e = elem;
         }
        return e;
      },
    setInnerHTML: function(e, Str, throwMsg)
      {
        var e = SuperDOM.getElement(e, throwMsg);
        if (e != null)
         e.innerHTML = Str;
      },
    toggleCSS: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         {
           var cl = e.classList;
           if (cl.contains(className) == true)
            {
              cl.remove(className);
              return false;
            }
           cl.add(className);
           return true;
         }
      },
    addCSS: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.classList.add(className);
      },
    removeCSS: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.classList.remove(className);
      },
    switchCSS: function(baseElementName, Val1, Val2, ClassName)
      {
        if (Val1 != null)
         SuperDOM.removeCSS(baseElementName+Val1, ClassName);
        SuperDOM.addCSS(baseElementName+Val2, ClassName);
        return Val2;
      },
    addCSSToParent: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.parentNode.classList.add(className);
      },
    removeCSSFromParent: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.parentNode.classList.remove(className);
      },
    addCSSToPreviousSibling: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.previousSibling.classList.add(className);
      },
    removeCSSFromPreviousSibling: function(e, className, Str)
      {
        var e = SuperDOM.getElement(e, Str);
        if (e != null)
         e.previousSibling.classList.remove(className);
      },
    flashCSS: function(element, className, millis)
     {
       SuperDOM.addCSS(element, className);
       setTimeout(function() {
           SuperDOM.removeCSS(element, className);
        }, millis);
     },
    show: function(e, Str)
      {
        SuperDOM.getElement(e, Str).style.display="";
      },
    hide: function(e, Str)
      {
        SuperDOM.getElement(e, Str).style.display="none";
      },
    parentWidth: function(e, Str)
      {
        return SuperDOM.getElement(e, Str).parentNode.offsetWidth;
      },
    alertThrow: function(msg)
      {
        alert(msg);
        throw msg;
      },
    alertConsole: function(msg)
      {
        console.error(msg);
        return alert(msg);
      },
    alertException: function(e, Msg)
      {
        alert((Msg == null ? "" : Msg) + (e.message ? e.message : e.description ? e.description : e) + (e.isEmpty ? "" : "\n\n" + SuperDOM.printObject(e)));
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
           if (SuperDOM.isFunction(o) == true)
             continue;
           for (var i = 0; i < Level; ++i)
             Str += "  ";
           Str += prop + ": ";
           if (Array.isArray(o) == true)
             for (var i = 0; i < o.length; ++i)
               SuperDOM._printObjectBase(o[i], Level + 1)
           if (typeof o == "object")
             Str += SuperDOM._printObjectBase(o, Level + 1) + '\n';
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
           Str = SuperDOM._printObjectBase (Str+i+": ", Obj[i], 1);
        else
          Str = SuperDOM._printObjectBase (Str, Obj, 1);
        return Str;
      },
    alertObject: function(Obj, level)
      {
        alert(SuperDOM.printObject(Obj));
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
               SuperDOM.alertThrow("Waited too long ("+this.timerCount+"ms) for the DOM element '"+this.elementId+"' to be ready for '"+this.waiterName+"");
              var that = this;
              this.lastTimeout = setTimeout(function() { that.execute(); }, this.timer);
            }
           else
             this.func();
         };
         
        this.stop = function()
         {
//           console.log("Stopping waiter "+this.waiterName+"."+this.elementId);
           this.timer = -1;
           if (this.lastTimeout != null)
            clearTimeout(this.lastTimeout);
         };
        
//        console.log("Starting waiter "+this.waiterName+"."+this.elementId);
        this.execute();
      },
     mergeProperies: function(Obj1, Obj2, Obj3)
      {
        var Obj = { };
        if (Obj1 != null)
         for(var k in Obj1) if (SuperDOM.isFunction(k) == false) Obj[k]=Obj1[k];
        if (Obj2 != null)
         for(var k in Obj2) if (SuperDOM.isFunction(k) == false) Obj[k]=Obj2[k];
        if (Obj3 != null)
          for(var k in Obj3) if (SuperDOM.isFunction(k) == false) Obj[k]=Obj3[k];
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
            Str+="&"+p+"="+escape(val);
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
                    Str+="&"+p+"="+escape(JSON.stringify(val));
                   else
                    SuperDOM.alertThrow("Unsupported object property '"+p+"' having at least one array element of type 'object' to be converted into a Url parameter")
                 }
               else for (var j = 0; j < val.length; ++j)
                 {
                   if (val[j] != null)
                    Str+="&"+p+"="+escape(val[j]);
                 }
             }
           else if (val != null)
             {
               if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                Str+="&"+p+"="+escape(JSON.stringify(val));
               else
                SuperDOM.alertThrow("Unsupported object property '"+p+"' of type '"+(typeof val)+"' to be converted into a Url parameter")
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
                    SuperDOM.alertThrow("Unsupported object property '"+p+"' having at least one array element of type 'object' to be converted into a Url parameter")
                 }
               else if (val != null)
                 data[p] = val;
             }
           else if (val != null)
             {
               if (asJsonProperties != null && asJsonProperties.indexOfSE(p) != -1)
                data[p]=JSON.stringify(val);
               else
                SuperDOM.alertThrow("Unsupported object property '"+p+"' of type '"+(typeof val)+"' to be converted into a Url parameter")
             }
         }
        return data;
      },
     isNullOrEmpty : function(Str)
      {
        return  Str == null ? true 
              : Array.isArray(Str) == true && Str.length == 0 ? true 
              : typeof Str == "string" ? Str.isEmpty() 
              : false; // Must be some object... Should test if object has no properties? Maybe a deep test? Performance issues here perhaps.
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
           if (SuperDOM.isNullOrEmpty(v) == true)
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
          SuperDOM.setInnerHTML(elementIds[i], '<BR><CENTER><IMG src="/static/img/progress.gif" width="' + (size == null ? "20px" : size)
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
     addEvent: function(elementId, eventName, handlerFunc)
      {
        var e = this.getElement(elementId);
        if (e == null)
         return console.error("Cannot add event to element '"+elementId+"'.");
        e.addEventListener(eventName, function(event){ return handlerFunc(e, event, event.target); });       
      },
     fireEvent: function(elementId, eventName)
      {
        var e = this.getElement(elementId);
        if ("createEvent" in document)
         {
           var evt = document.createEvent("HTMLEvents");
           evt.initEvent(eventName, false, true);
           e.dispatchEvent(evt);
         }
        else
         e.fireEvent("on"+eventName);
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
	    		  SuperDOM.toggleNestedRows(r,eachRow.style.display);
	    		  }
	    	  }
    	  return true;
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
        formElement = SuperDOM.getElement(formElement);
        var e = formElement[elementName];
        if (e == null)
          return console.warn("Cannot find element '"+elementName+"' in Form.");
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
     fitBelow: function(topElement, bottomElement, gapPx) 
      {
        topElement = SuperDOM.getElement(topElement);
        bottomElement = SuperDOM.getElement(bottomElement);
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
      }
      
  };

window.DelayedEvent = SuperDOM.DelayedEvent;

  return SuperDOM;
  
});

