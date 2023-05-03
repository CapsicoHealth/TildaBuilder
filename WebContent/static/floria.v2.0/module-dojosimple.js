"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DojoSimple
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
import { FloriaDOM    } from "./module-dom.js";
import { FloriaText   } from "./module-text.js";
import { FloriaDate   } from "./module-date.js";
import { FloriaLogin  } from "./module-login.js";
import { FloriaDialog } from "./module-dialog.js";

import { createPopper } from "/static/jslibs/popperjs/popper.js";
*/

export var DojoSimple = { };

/*
DojoSimple.PopupLogin    = FloriaLogin.PopupLogin;
DojoSimple.PopupSignup   = FloriaLogin.PopupSignup;
DojoSimple.ForgotPswd    = FloriaLogin.ForgotPswd;
DojoSimple.SetPassword   = FloriaLogin.SetPassword;
DojoSimple.Account       = FloriaLogin.Account;
DojoSimple.Verifications = FloriaLogin.Verifications;

DojoSimple.Dialog    = FloriaDialog;


require(["dijit/dijit", "dojo/dom", "dojo/dom-construct"], function(dojoDijit, dojoDom, domConstruct) {

DojoSimple.HeaderBodyFooterLayout = function(MainId, initFunc)
 {
   require(["dijit/layout/BorderContainer", "dijit/layout/ContentPane"], function (BorderContainer, ContentPane) {
       try
        {
          var MainContainer   = new BorderContainer({ gutters : false  }, dojoDom.byId(MainId));
          var HeaderContainer = new ContentPane    ({ region : 'top'   }, dojoDom.byId(MainId+"_HEADER"));
          var FooterContainer = new ContentPane    ({ region : 'bottom'}, dojoDom.byId(MainId+"_FOOTER"));
          var ClientContainer = new ContentPane    ({ region : 'center'}, dojoDom.byId(MainId+"_BODY"  ));
          MainContainer.startup();
          if (initFunc != null)
           initFunc();
        }
       catch (e)
        {
          FloriaDOM.alertException(e);
        }
    });
//   require(["dojox/widget/Dialog","dojo/fx/easing"], function(Dialog, Easing) {});
  }


  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Calendar
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Calendar = function(containerId, elementId, onValueSelectedFunc, min, datePattern, v, fieldName)
  {
    this.elementId = elementId;
    var that = this;

    var newItem = document.createElement("INPUT");
    newItem.setAttribute("type","hidden");
    newItem.setAttribute("id",elementId);
    newItem.setAttribute("name",fieldName);
    newItem.setAttribute("value",v==null?"":v);
    var e = document.getElementById(containerId);
    e.parentNode.insertBefore(newItem, e);
    
    require(["dojo/parser", "dijit/form/DateTextBox"
        ], function(Parser, Calendar){
           that.cal = dojoDijit.byId(containerId);
           if (that.cal != null)
             that.cal.destroy();
           that.cal = new Calendar({
                 value: FloriaDate.parseDateTime(v),
                 constraints: {min:min, datePattern : datePattern==null?'yyyy-MMM-dd':datePattern},
                 onChange : function(d) {
//                   alert("d: "+d+"; typeof d: "+typeof d+";");
                   document.getElementById(elementId).value= d==null?'':d.toISOString();
                 if (onValueSelectedFunc)
                    onValueSelectedFunc(d);
                 }
             }, containerId);
           that.cal.startup();
       });
     this.destroy = function()
      {
        this.cal.destroy();
      }
     this.setValue = function(val)
      {
        if (val == null)
         val = FloriaDOM.getElement(elementId, "Cannot find calendar element '"+elementId+"'.").value;
        this.cal.set('value', FloriaDate.parseDateTime(val));
      }
  };



// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxUrl
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ajaxUrl = function(Url, Method, ErrorMsg, SuccessFunc, ErrorFunc, PostContents, Timeout, handleAs)
  {
    if (PostContents != null && Method != 'POST')
     FloriaDOM.alertThrow("Error: you cannot post data in a non POST ajax request");
    dojo.xhr(Method, {
      url : Url,
      content: PostContents,
      method : Method,
      errorMsg : ErrorMsg,
      successFunc : SuccessFunc,
      errorFunc : ErrorFunc,
      load : function(data, ioArgs)
        {
          try
            {
              if (ioArgs.xhr.getResponseHeader("x-wanda-canceler") == "1")
                alert("FYI THAT YOU CANCELED ANOTHER REQUEST!\n\nYou (or another user on the same account) was running a request you interrupted.");

              if (data == null)
                throw ("An error occurred: no JSON data for " + this.url);
              if (data.code == undefined)
                throw ("An error occurred: invalid JSON data for " + this.url);
              
              if (data.code == 401 && DojoSimple.PopupLogin.isAuthPassthrough(Url) == false)
                {
                  var lthis = this;
                  DojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
                }
              else if (data.code != 200)
                this.error({ code: data.code, message : data.msg, errors: data.errors, type: data.type }, ioArgs);
              else
               {
                 if (data.perfMessage != null)
                  setTimeout(function(){ alert(data.perfMessage); }, 10);
                 if (this.successFunc != null)
                  this.successFunc(data.data);   
               }
            }
          catch (e)
            {
              FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxUrl.load()\nFrom: "+this.successFunc+"\nError: ", true);
            }
        },
      error : function(error, ioArgs)
        {
          console.error("DojoSimple.ajaxUrl error: ", error);
          try
            {
              if (error != null && error.status == 401 && DojoSimple.PopupLogin.isAuthPassthrough(Url) == false)
               {
                 var lthis = this;
                 DojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
               }
              else
                {
                  if (error.type == 'CANCELED')
                    alert("YOUR REQUEST WAS CANCELED!\n\nYou (or another person using the same account) have just invoked the same data from another browser window.");
                  else if (error.type == 'DEADLOCKED')
                    alert("YOUR REQUEST DEADLOCKED!\nA database issue has occurred that caused your request to deadlock with another request.");

                  var msg = error == null ? null : error.message != null ? error.message : error.msg;
                  if (this.errorMsg != null)
                    {
                      var Str = this.errorMsg;
                      if (msg != null)
                       Str+="\n"+msg;
                      if (error.errors != null && error.errors.length != 0)
                       for (var i = 0; i < error.errors.length; ++i)
                        Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                      alert(Str);
                    }
                  if (this.errorFunc != null)
                   this.errorFunc(error.code, msg, error.errors, error.type);
                }
            }
          catch (e)
            {
              FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxUrl.error()\nFrom: "+this.errorFunc+"\nError: ", true);
            }
        },
      timeout : Timeout==null?90000:Timeout,
      handleAs : handleAs==null?'json':handleAs
    });
  };
  

DojoSimple.ajaxUrlMulti = function(AjaxInfos, Func)
  {
    var results=[];
    var createNestedFunc = function(ajaxInfo, previousF)
     {
       return function(data) { if (data != null) results.push(data); DojoSimple.ajaxUrl(ajaxInfo.url, "GET", ajaxInfo.error, previousF, previousF); };
     }
    var f = function(data) { if (data != null) results.push(data); Func(results); };
    for (var i = AjaxInfos.length-1; i >= 0; --i)
     f = createNestedFunc(AjaxInfos[i], f);
    setTimeout(f, 1);
  }


// Launched a Url using the regular AjaxUrl facility but expects it to take some time before it returns (long running Job).
// While the job is running, launches a secondary Polling URL, with a handler and an interval check in seconds. The PollHandler
// function takes the result from the PollUrl and is expected to return the next PollUrl. If PollUrl is given NULL, an error
// occurred.
DojoSimple.ajaxUrlLongRunningJob = function(Url, ErrorMsg, SuccessFunc, ErrorFunc, PostContents, TimeoutSecs, PollUrl, PollHandler, PollIntervalSecs, canTimeout)
  {
    var done = false;
    var loop = function() {
      DojoSimple.ajaxUrl(PollUrl, "GET", null
                        ,function(data) {
                            if (data != null)
                             {
                               PollUrl = PollHandler(data);
                               if (done == false && PollUrl != null)
                                setTimeout(loop, PollIntervalSecs*1000);
                             }
                            else if (done == false)
                             {
                               PollHandler(null);
                             }
                          }
                        ,function(data) {
                            PollHandler(null);
                          }
                        );
     };
    DojoSimple.ajaxUrl(Url, "GET", ErrorMsg, function(data) {
         done = true;
//         alert("done!!!!");
         SuccessFunc(data);
      }, ErrorFunc, PostContents, TimeoutSecs*1000);
    setTimeout(loop, 1000);
  }

  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxForm
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ajaxForm = function(FormId, ErrorMsg, SuccessFunc, ErrorFunc)
  {
    require(["dojo/io/iframe"], function(dojoIFrame) {
      var f = document.getElementById(FormId);
      var toto = {
        method : "POST",
        form : f,
        url : f.action,
        errorMsg : ErrorMsg,
        successFunc : SuccessFunc,
        errorFunc : ErrorFunc,
        load : function(data, ioArgs)
          {
            try
              {
                if (data == null)
                  throw ("An error occurred: no JSON data from the form" + FormId);
                if (data.code == undefined)
                  throw ("An error occurred: invalid JSON data from the form " + FormId);
                if (data.code == 401 && DojoSimple.PopupLogin.isAuthPassthrough(f.action) == false)
                  {
                    var lthis = this;
                    DojoSimple.PopupLogin.show(true, function()
                      { 
                        if (f.enctype == "multipart/form-data")
                         dojoIFrame.send(lthis);                            
                        else
                         dojo.xhr(lthis.method, lthis);
                      });
                  }
                else if (data.code != 200)
                  this.error(data, ioArgs);
                else if (this.successFunc != null)
                  this.successFunc(data.data);
              }
            catch (e)
              {
                FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxForm.load()\nFrom: "+this.successFunc+"\nError: ", true);
              }
          },
        error : function(error, ioArgs)
          {
            try
              {
                console.error("DojoSimple.ajaxForm error: ", error);
                if (error != null && error.status == 401 && DojoSimple.PopupLogin.isAuthPassthrough(f.action) == false)
                 {
                    var lthis = this;
                    DojoSimple.PopupLogin.show(true, function()
                        { 
                          if (f.encoding == "multipart/form-data")
                            dojoIFrame.send(lthis);
                          else
                            dojo.xhr(lthis.method, lthis);
                        });
                 }
               else
                 {
                    var Str = this.errorMsg;
                    var msg = error == null ? null : error.message != null ? error.message : error.msg;
                    if (f.encoding == "multipart/form-data" && msg == "doc.getElementsByTagName(...)[0] is undefined")
                     console.error("if you are using a framework like Dojo, the result JSON data must be returned inside a TEXTAREA element in an HTML response.")
                    if (msg != null)
                     Str+="\n"+msg;
                    if (error.errors != null && error.errors.length != 0)
                     for (var i = 0; i < error.errors.length; ++i)
                      Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                    if (this.errorMsg != null)
                     alert(Str);
                    if (this.errorFunc != null)
                     this.errorFunc(error.code, msg, error.errors);
                 }
              }
            catch (e)
              {
                FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxForm.error()\nFrom: "+this.errorFunc+"\nError: ", true);
              }
          },
        timeout : 90000,
        handleAs : 'json'
        };
      if (f.encoding == "multipart/form-data")
        dojoIFrame.send(toto);
      else
        dojo.xhr("POST", toto);
    });
  };



// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple URIParameters
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.URIParameters = function()
  {
    var i = window.location.href.indexOf("?");
    this.params = i == -1 ? { } : dojo.queryToObject(p.substring(i + 1, p.length));
  };
DojoSimple.URIParameters.prototype.get = function(name)
  {
    return this.params[name];
  };

  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Editor
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Editor = function(elementId, h, formId, formElementName)
  {
    this.rte = dojoDijit.byId(elementId);
    if (this.rte != null)
     this.rte.destroy();
    var that = this;
    require(["dijit/Editor", "dijit/_editor/plugins/AlwaysShowToolbar", "dijit/_editor/plugins/LinkDialog", "dojo/domReady!"],
        function(Editor, AlwaysShowToolbar, LinkDialog){
                that.rte = new Editor({
                    height: h,
                    extraPlugins: [AlwaysShowToolbar],
                    plugins : [ 'undo', 'redo', 'cut', 'copy', 'paste', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', '|', 'insertHorizontalRule', 'createLink', 'insertImage' ]
                }, dojoDom.byId(elementId));
                dojo.connect(rte, 'onChange', function()
                      {
                        var e = dojoDom.byId(formId)[formElementName];
                        var v = rte.attr("value");
                        e.value = FloriaText.isNullOrEmpty(v) == true || v.match(/^\s*\<\s*br[^\/]*\/\>\s*$/) != null ? "" : v;
                        if (e.onchange)
                          e.onchange();
                        return true;
                      });
                that.rte.startup();
        });
  };
  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Misc
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.FadeOut = function(elementId, millis, func)
 {
   require(["dojo/_base/fx", "dojo/on"], function(fx, on)
    { 
      var a = fx.fadeOut({node: document.getElementById(elementId), duration: millis==null ? 200 : millis});
      if (func != null)
       on(a, "End", func);
      a.play();
    });
 };

DojoSimple.getViewport = function(elementId, millis, func)
 {
      return dojoDijit.getViewport();
 };

 
 
 
 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tooltip dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

DojoSimple.TooltipDialog = function(elementId, content)
 {
   var that = this;
   
      that._e = document.getElementById(elementId);
      that._tt = document.getElementById(elementId+"_TD");
      if (that._tt == null)
       {
         that._tt = document.createElement('div');
         that._tt.setAttribute("id", elementId+"_TD");
         that._tt.setAttribute("fade-in-popper", "");
         that._tt.classList.add("popperTooltip");
         document.body.appendChild(that._tt);
       }
      that._tt.innerHTML=content;
      that._popper = createPopper(that._e, that._tt);
      var onclick=function(evt) { that._clickHandler(evt); };
      that._e.addEventListener("click", onclick);
      var onmouseleave=function(evt) { that.hide(evt); };
      var onmouseleave2=function(evt) { setTimeout(function(){that.hide();},100); };
      that._tt.addEventListener("mouseleave", onmouseleave);
      that._tt.addEventListener("click", onmouseleave2);
      
      that._clickHandler = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         if (this._tt.hasAttribute("show-popper"))
          this._tt.removeAttribute("show-popper");
         else
          this._tt.setAttribute("show-popper", "");
         this._popper.update();
       }
      that.destroy = function()
       {
         if (this._popper)
          {
            this._popper.destroy();
            this._e.removeEventListener("click", onclick);
            this._tt.removeEventListener("mouseleave", onmouseleave);
            this._tt.removeEventListener("click", onmouseleave2);
            this._popper = null;
          }
       }
      that.hide = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         this._tt.removeAttribute("show-popper");
         this._popper.update();
       }
      that.show = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         this._tt.setAttribute("show-popper", "");
         this._popper.update();
       }
 };
 

 window.DojoSimple = DojoSimple;

});

*/