"use strict";

import { FloriaDOM   } from "./module-dom.js";


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Floria Dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __DIALOGS = [];
var __hiding = false; // global flag to manage overlapping dialog functionality, e.g., hiding one while showing another

function printDialogStack()
 {
//   for (var i = 0; i < __DIALOGS.length; ++i)
//    console.log(""+i+__DIALOGS[i]._md.id+" ("+__DIALOGS[i]._md.style.display+")");
 }

export function FloriaDialog(elementId)
 {
   this._e = document.getElementById("FLORIA_DLG_BG");
   if (this._e == null)
    {
      this._e = document.createElement('div');
      this._e.id = "FLORIA_DLG_BG";
      this._e.classList.add("modalBackground");
      document.body.appendChild(this._e);
    }
   this._md = document.getElementById(elementId);
   if (this._md == null)
    {
      this._md = document.createElement('div');
      this._md.id = elementId;
      this._md.classList.add("modalDialog");
      this._md.innerHTML = '<DIV class="modalTitle"><SPAN id="'+elementId+'_MD_TITLE"></SPAN><SPAN id="'+elementId+'_MD_CLOSE"></SPAN></DIV>'
                          +'<DIV class="modalContent" id="'+elementId+'_MD_CNT"></DIV>'
                         ;
      this._e.appendChild(this._md);
    }

   var that = this;
   FloriaDOM.addEvent(elementId+"_MD_CLOSE", "click", function() {
     that.hide();
   })
       
   this.setOnHide = function(func)
    {
      this._onHideHandler = func;
    };
   this.setOnLoad = function(func)
    {
      this._onLoadHandler = func;
    };
   this.show = function(title, url, w, h, contents, recall)
    {
      var that = this;
      console.log("dialog.show() - "+this._md.id)
      if (__hiding == true && recall == null)
       return setTimeout(function() { that.show(title, url, w, h, contents, true); }, 300); // 500 is the hiding delay, so we undershoot a little
      else
       __hiding = false;
       
      var repaint = false;
      if (__DIALOGS.length > 0)
       {
         // push down and slide down previous dialog
         var lastDialog = __DIALOGS[__DIALOGS.length-1];
         // If we are repainting the current popup, then we can't tuck it away. 
         if (lastDialog._md.id == this._md.id)
          repaint = true;
         else
          {
            lastDialog._md.style.top = "110%";
            lastDialog._md.style.opacity="";
            lastDialog._md.style.zIndex=0;
          }
       }

      // Paint title
      var t = this._md.childNodes[0].childNodes[0]; // first child element -> modalTitle, then first element is first SPAN
      t.innerHTML = title;

      if (repaint == false)
       {
         __DIALOGS.push(this);
         // Set the dialog's size
         this._w = w > 0.98 ? 98 : w < 0.2 ? 2 : 100*w;
         this._h = h > 0.98 ? 98 : h < 0.2 ? 2 : 100*h;
         this._md.style.width=this._w+"%";
         this._md.style.height=this._h+"%";
         this._md.style.left=((100-this._w)/2)+"%";
         this._md.style.top = "-25%"; //((100-this._h)/2)+"%"; // new comes from the top
         this._md.style.zIndex=1000+__DIALOGS.length;
           
         // Unhide everything as a setTimeout to trigger animations if any
         setTimeout(function() { 
           that._e.style.opacity=1;
           that._e.style.left=0;
           that._md.style.opacity=1;
           that._md.style.top = ((100-that._h)/2)+"%";
         }, 10);
       }
          
      // Paint the dialog's content
      if (url != null)
       {
         // We can load HTML dynamically, and in doing so, we need to execute the script blocks if any
         fetch(url).then(response => response.text()) 
                   .then(function(html) { 
                       that._md.childNodes[1].innerHTML = html;
                       Array.from(that._md.childNodes[1].querySelectorAll("script"))
                            .forEach( oldScript => {
                               const newScript = document.createElement("script");
                               Array.from(oldScript.attributes)
                                    .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
                               newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                               oldScript.parentNode.replaceChild(newScript, oldScript);
                       });
                      if (that._onLoadHandler != null)
                       that._onLoadHandler();
                   });
          return;
       }
      
      if (typeof contents == "string")
       this._md.childNodes[1].innerHTML = contents;
      else if (contents != null)
       contents(this._md.id+"_MD_CNT"); // second element, i.e., the modalContent
      if (that._onLoadHandler != null)
       that._onLoadHandler();
    }
   this.setContent = function(contents)
    {
      this._md.childNodes[1].innerHTML = contents;
    }
   this.hide = function()
    {
      console.log("dialog.hide() - "+this._md.id);
//      console.trace();
      var that = this;

      var topDlg = __DIALOGS.pop();
      if (topDlg != null && topDlg._md.id != this._md.id) // hide is being called twice on the same object
       {
         __DIALOGS.push(topDlg);
         return;
       }
      
      __hiding = true;

      if (that._onHideHandler != null)
       that._onHideHandler();

      // It's possible for someone to close a dialog and re-open a new one right away.
      // Because of the timeouts below for animation effects, we hve to "capture" this._md
      // before it gets overwritten by the following show().
      var that_md = that._md;       
      // Reset items to default (from css)
      setTimeout(function(){
        that_md.style.top="-25%";
        that_md.style.opacity="0";
        that_md.style.zIndex=0;
        __hiding = false;
      }, 10);

      // sliding back in the previous dialog
      if (__DIALOGS.length > 0)
       {
          var lastDialog = __DIALOGS[__DIALOGS.length-1];
          lastDialog._md.style.opacity="1";
          lastDialog._md.style.top = ((100-lastDialog._h)/2)+"%";
          lastDialog._md.style.zIndex=1000+__DIALOGS.length;
       }
      else
       setTimeout(function(){
         that._e.style.opacity="0";
         setTimeout(function(){
           if (__DIALOGS.length == 0) // Only move out the background div and clear the node if we cleared the whole stack
            {
              that._e.style.left="";
              that_md.childNodes[1].innerHTML = '';
            }
         }, 500);
       }, 10);
    }
 };
  

