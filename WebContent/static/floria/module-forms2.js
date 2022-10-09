"use strict";

import { FloriaDOM } from "./module-dom.js";
import { FloriaControls } from "./module-controls.js";
import { FloriaText } from "./module-text.js";
import { FloriaFactories } from "./module-factories.js";
import { FloriaDate } from "./module-date.js";
import { DojoSimple } from "./module-dojosimple.js";


function makeUpdatePageFunc(that, toPageId) 
  { 
    return function() { that.updatePage(toPageId); };
  }
  
var maxLabelLengthBeforeWrapping = 30;

function createNavEvents(form)
 {
   if (form._formDefs.length > 1)
    {
      for (var i = 0; i < form._formDefs.length; ++i)
       FloriaDOM.addEvent(form._elementId+'_F_'+i, "click", makeUpdatePageFunc(form, i));
      FloriaDOM.addEvent(form._elementId+'_F_PREV', "click", function() { form.updatePage(form._pageId-1); });
      FloriaDOM.addEvent(form._elementId+'_F_NEXT', "click", function() {
        if (form._pageId == form._formDefs.length-1)
         {
//           if (form._popupTitle != null && form._dlg != null)
//            form._dlg.hide();
         }
        else
         form.updatePage(form._pageId+1); 
      });
    }

   if (form._customNav == true)
    return;
    
   if (form._popupTitle==null)
    FloriaDOM.addEvent(form._elementId+'_F_SUBMIT', "click", function() { form.updatePage(null); });

   if (form._cancelButton == true)
    FloriaDOM.addEvent(form._elementId+'_F_CANCEL', "click", function() {
       // Cancel means closing the popup and bypassing everything
       var onHideHandler = form._dlg._onHideHandler;
       form._dlg.setOnHide(null);
       form._dlg.hide();
       form._dlg.setOnHide(onHideHandler);
    });
 }

function getFieldMarkup(parentD, d, elementId, pageId, rowId, subRowId, groupId, data, edgeFunc, heading, verticalLayout)
 {
   var fieldName = d.name+(groupId==null?"":"_"+groupId);
   var v = data == null ? null : data[d.name];
   if (v == null)
    v = d.defaultValue; 
   
//   console.log("Painting element ", d);
//   console.log("Data : ", data);
//   console.log("   field name : "+fieldName);

   var formElementIds = [ elementId+'_F', fieldName];
   var xid = rowId+(subRowId==null?'':'_'+subRowId);
   var Str = '';
   if (d.type!="hidden")
    {
      Str+='<TR class="bottomPadded withIndenting" valign="top" id="'+elementId+'_'+pageId+'_ROW_'+xid+'">'
      if (d.inline == true || verticalLayout == true)
        Str+='<TD colspan="10"><DIV class="fieldQuestion'+(d.mandatory == true ? " mandatory":"")+'">'+d.label+'</DIV>'
            +'<TABLE border="0px" width="90%"><TR><TD>&nbsp;&nbsp;&nbsp;</TD><TD id="'+elementId+'_'+pageId+'_PH'+xid+'">';
      else
        Str+='<TD class="fieldName'+(d.mandatory == true ? " mandatory":"")+'">'+(d.label==null?'':d.label)+'</TD><TD colspan="9" id="'+elementId+'_'+pageId+'_PH'+xid+'">';
    }
   if (d.type=="text")
    Str+='<INPUT name="'+fieldName+'" type="text" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:'+(d.width==null?'90%':d.width)+'" '+(d.placeHolder==null?'':'placeholder="'+d.placeHolder+'"')+'>';
   else if (d.type=="hidden")
    Str+='<INPUT name="'+fieldName+'" type="hidden" value="'+FloriaText.TextUtil.printFuncParam(v)+'">';
   else if (d.type=="file")
    Str+='<INPUT name="'+fieldName+'" type="file" style="width:90%" '+(d.multiple==true?'multiple="true"':'')+' '+(d.accept!=null?'accept="'+d.accept+'"':'')+'>';
   else if (d.type=="textarea")
    Str+='<TEXTAREA name="'+fieldName+'" rows="'+(d.rows==null?10:d.rows)+'" style="width:'+(d.width==null?'90%':d.width)+'" '+(d.placeHolder==null?'':'placeholder="'+d.placeHolder+'"')+'>'+(FloriaText.isNoE(v) == true ? "" : FloriaText.print(v))+'</TEXTAREA>';
   else if (d.type=="number")
    Str+='<INPUT name="'+fieldName+'" type="number" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:'+(d.width==null?'100px':d.width)+'" '+(d.min==null?'min="0"':'min="'+d.min+'"')
                                                                                                                       +' '+(d.max==null?'':'max="'+d.max+'"')
                                                                                                                       +' '+(d.step==null?'step="0.1"':'step="'+d.step+'"')
                                                                                                                       +' '+(d.placeHolder==null?'':'placeholder="'+d.placeHolder+'"')
                                                                                                                       +'>';
   else if (d.type=="int")
    Str+='<INPUT name="'+fieldName+'" type="number" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:'+(d.width==null?'100px':d.width)+'" '+(d.min==null?'min="0"':'min="'+d.min+'"')
                                                                                                                       +' '+(d.max==null?'':'max="'+d.max+'"')
                                                                                                                       +' step="1"'
                                                                                                                       +' '+(d.placeHolder==null?'':'placeholder="'+d.placeHolder+'"')
                                                                                                                       +'>';
   else if (d.type=="date")
     Str+='<DIV id="'+elementId+'_b_'+xid+'"><DIV>';
//     Str+='<INPUT type="hidden" id="'+elementId+'_a_'+xid+'" name="'+fieldName+'" value="'+FloriaText.TextUtil.printFuncParam(v)+'"><DIV id="'+elementId+'_b_'+xid+'"><DIV>';
   else if (d.type=="radio")
    Str+=FloriaControls.Radio.gen(null, formElementIds, d.values, d.cols == null ? edgeFunc : FloriaControls.TableEdgeFunc(d.cols), null, v);
   else if (d.type=="boolean")
    Str+=FloriaControls.Radio.gen(null, formElementIds, [["1", "Yes"], ["0", "No"]], null, null,v);
   else if (d.type=="checkbox")
    Str+=FloriaControls.Checkbox.gen(null, formElementIds, d.values, d.cols == null ? edgeFunc : FloriaControls.TableEdgeFunc(d.cols), null, v);
   else if (d.type=="dropdown")
    Str+=FloriaControls.Dropdown.gen(null, formElementIds, d.values, d.firstEmpty==true?true:false, null, v, d.multiple);
   else if (d.type=="rating")
    Str+=FloriaControls.Rating.gen(null, formElementIds, "from lowest to highest", d.max, null, v);
   
   if (d.type!="hidden")
    {
      if (d.inline == true || verticalLayout == true)
        Str+='</TD></TR></TABLE>';
      Str+='</TD></TR>';
    }
   return Str;
 }


function hasGroupValue(group, val)
 {
   var totalDefaultFieldsCount = 0;
   var valueCount = 0;
   var defaultValueCount = 0;
   for (var k = 0; k < group.length; ++k)
    {
      var e = group[k];
      var v = val[e.name];
      if (FloriaText.isNoE(v) == false)
       {
         ++valueCount;
         if (v == e.defaultValue)
           ++defaultValueCount;
       }
      if (e.defaultValue != null)
       ++totalDefaultFieldsCount
    }
   // All fields have been filled, we are OK
   if (valueCount == group.length)
     return true;
   // No values at all
   if (valueCount == 0)
    return false;
   // Number of values is the same as the number of default fields, and they were all default values
   // (it means the group has default values, and the user (1) didn't change any, and (2) didn't set any other field)
   if (valueCount == totalDefaultFieldsCount && valueCount == defaultValueCount)
    return false;

   return true;
 }


function getGroupUnitMarkup(parentD, elementId, pageId, rowId, subRowId, data, edgeFunc, noTR, oneOnly, heading, verticalLayout)
 {
   var group = parentD.group;
   var Str = noTR == true ? '' : '<TR>';
   Str+='<TD valign="top">';
   if (oneOnly!=true)
    Str+=(subRowId+1)+'<BR><A border="0px" href="javascript:void(0);"><img id="DEL`'+rowId+'`'+subRowId+'" src="/static/img/delete.gif" height="16px" valign="absmiddle" border="0px"></A>';
   Str+='</TD><TD><TABLE width="100%">';
   for (var k = 0; k < group.length; ++k)
    Str+=getFieldMarkup(parentD, group[k], elementId, pageId, rowId, subRowId*group.length+k, subRowId, data, edgeFunc, heading, verticalLayout);
   Str+='</TABLE></TD>';
   if (noTR != true)
    Str+='</TR>';
   return Str;
 }

function getGroupMarkup(d, elementId, pageId, rowId, data, edgeFunc, heading)
 {
   var Str = '<TR><TD class="fieldName" colspan="10"><DIV class="formGroupName">'+d.label+'<A border="0px" href="javascript:void(0);">';
   if (d.maxCount != 1)
    Str+='<img id="ADD`'+rowId+'" src="/static/img/add.gif" border="0px" height="16px" hspace="10px" valign="absmiddle"></A>';
   Str+= '</DIV></TD></TR>'
        +'<TR><TD>&nbsp;</TD><TD><TABLE id="'+elementId+'_'+pageId+'_ROW_'+rowId+'" width="100%">'
        ;
   var values = data[d.name];
   var groupCount = -1;
   if (values != null)
    for (var i = 0; i < values.length; ++i) // Max of 25 groups for now
     {
       var val = values[i];
       if (val == null || hasGroupValue(d.group, val) == false)
        continue;
       Str+=getGroupUnitMarkup(d, elementId, pageId, rowId, ++groupCount, val, edgeFunc, false, d.maxCount==1, heading);
       if (d.maxCount == 1)
        break;
     }
   if (groupCount == -1)
    for (var j = 0; j < 1; ++j)
     {
       Str+=getGroupUnitMarkup(d, elementId, pageId, rowId, ++groupCount, null, edgeFunc, false, d.maxCount==1, heading);
     }
   Str+='</TABLE></TD></TR>';
   return Str;
 }

function fillField(d, elementId, pageId, rowId, subRowId, descriptions, data, widgets, pickers, groupCount)
 {
   var fieldName = d.name+(groupCount!=null?"_"+groupCount : subRowId!=null?"_"+subRowId : "");
   var xid = rowId+(subRowId==null?'':'_'+subRowId);
   if (d.name == null || d.type=="textarea" || d.type=="hidden" || d.type=="file" || d.type=="number" || d.type=="boolean" || d.type=="rating" || d.type=="int" || d.type=="radio" || d.type=="checkbox" || d.type=="dropdown")
    return;
   if (d.type=="text")
    {
      if (d.keyUp == true)
        {
          var f = document.getElementById(elementId+'_F');
          FloriaDOM.addEvent(f[fieldName], "keyup", function(e, event, target)
           {
             DelayedEvent.register(elementId+'_a_'+xid,500,function() {
               FloriaDOM.fireEvent(f, "change");
             });
           });
        }
    }
   else if (d.type=="date")
     {
       var v = data==null?null:data[d.name];
       if (v == null)
        v = d.defaultValue;
       if ((v == null || v == 'NOW') && v != '---')
        v = new Date().toISOString();
       
       widgets.push(new DojoSimple.Calendar(elementId+'_b_'+xid, elementId+'_a_'+xid, null, null, null, v, fieldName));
     }
   else
    {
//      console.log("Picker "+d.type+" on "+fieldName+"= ", data==null?null:data[fieldName]);
      var _descriptions = descriptions[d.name];
      var v = data==null?null:data[d.name];
//      console.log(v, ", ", d.defaultValue);
      if (v == null || Array.isArray(v) == true && v.length == 0)
       v = d.defaultValue;
      if (v != null && Array.isArray(v) == false)
       v = [ v ] ;
      pickers.push({fieldName: d.name, pickerName:d.type, elementId:elementId+"_"+pageId+"_PH"+xid, name:fieldName, multi:d.multi
                   ,quickSelect:d.quickSelect, summarySelectionsOnly: d.summarySelectionsOnly, params:d.params, values: v, descriptions:_descriptions, inline:d.inline
                   });
    }
 }

function fillGroup(d, elementId, pageId, rowId, descriptions, data, widgets, pickers)
 {
   var values = data[d.name];
   var groupCount = -1;
   if (values != null)
    for (var i = 0; i < values.length; ++i) // Max of 25 groups for now
     {
       var val = values[i];
       if (val == null || hasGroupValue(d.group, val) == false)
        continue;
       ++groupCount;
       for (var k = 0; k < d.group.length; ++k)
        fillField(d.group[k], elementId, pageId, rowId, groupCount*d.group.length+k, descriptions, val, widgets, pickers, groupCount);
    }
   if (groupCount == -1)
    for (var j = 0; j < 2; ++j)
     {
       ++groupCount;
       for (var k = 0; k < d.group.length; ++k)
        fillField(d.group[k], elementId, pageId, rowId, groupCount*d.group.length+k, descriptions, null, widgets, pickers, groupCount);
     }
 };


export var FloriaForms = function(elementId, data, formDefs, edgeColumnCount, processCallbackFunc, popupTitle, wizardMode, liveOnChange, persist, validationErrMsg, cancelButton)
 { 
//   console.log("=>=>=> Forms2.constructor (data): ", data);
   formDefs = FloriaDOM.clone(formDefs);
   this._elementId = elementId;
   if (typeof persist == "string")
    this._persistId = persist;
   else if (persist == true)
     this._persistId = elementId;
   if (FloriaDOM.isObjectNullOrEmpty(data) == true && this._persistId != null)
    {
      data = Object.assign(data, FloriaDOM.localStorageGet(this._persistId));
      // If data is obtained from the cache, we have to check default values for Hidden fields
      // and reset those values. It is posible to change the form definition over time and there
      // is a mismatch with the 
      if (formDefs != null && formDefs.sections != null && formDefs.sections.length > 0)
       for (var i = 0; i < formDefs.sections.length; ++i)
        {
          var d = formDefs.sections[i].formDef;
          if (d != null)
           for (var j = 0; j < d.length; ++j)
            {
              var f = d[j];
              if (f.type=="hidden" && f.defaultValue != null)
               data[f.name] = f.defaultValue;
            }
        }
    }
   this._data = FloriaDOM.isObjectNullOrEmpty(data) == true ? { } : data;
//   console.log("=>=>=> Forms2.constructor (this._data): ", this._data);
   this._descriptions = {};
   this._validationErrMsg = FloriaText.isNoE(validationErrMsg) == false ? validationErrMsg : "There are missing or invalid values.";
   if (formDefs.enums != null)
    {
      this._formEnums = formDefs.enums;
      this._formDefs = formDefs.sections;
      for (var i = 0; i < this._formDefs.length; ++i)
       {
         var d = this._formDefs[i].fields;
         if (d == null)
          d = this._formDefs[i].formDef;
         for (var j = 0; j < d.length; ++j)
          {
            var f = d[j];
            if (Array.isArray(f.values) == false)
             {
               var v = this._formEnums.getSE(f.values, "name");
               if (v != null)
                f.values = v.values;
             }
          }
       }
    }
   else if (formDefs[0].formDef == null)
    {
      this._formEnums = { };
      this._formDefs = [{id:"Page1", label:"Page 1", formDef: formDefs}];
    }
   else
    {
      this._formEnums = { };
      this._formDefs = formDefs;      
    }
   
   for (var i = 0; i < this._formDefs.length; ++i)
    {
      var d = this._formDefs[i].fields;
      if (d == null)
       d = this._formDefs[i].formDef;
      for (var j = 0; j < d.length; ++j)
       {
         var f = d[j];
         if (f.type=="checkbox" || f.type=="radio" || f.type=="dropdown")
          {
            if (f.values == null)
             throw "Form's "+f.type+" field '"+f.name+"' hasn't defined any values.";
          }
       }
    }
   
   this._defaultEdgeFunc = FloriaControls.TableEdgeFunc(edgeColumnCount);
   this._processCallbackFunc = processCallbackFunc;
   this._wizardMode = wizardMode;
   this._popupTitle = popupTitle;
   this._liveOnChange = liveOnChange;
   this._cancelButton = cancelButton;
   this._pickersLoading = 0;
   if (popupTitle != null)
    {
      this._dlg = new DojoSimple.Dialog(elementId+"_DLG");
      var that = this;
      this._dlg.setOnHide(function() { that.updatePage(null, null, true); });
    }
    
   this.setCollapser = function(collapserClassName, collapseHTML, collapseTitle, expandHTML, expandTitle)
    {
      this._collapseHTML = collapseHTML!=null ? collapseHTML : '△';
      this._collapseTitle = collapseTitle!=null ? collapseTitle : 'Hide the filter'; 
      this._expandHTML = expandHTML!=null ? expandHTML : 'Show the filter ▽';
      this._expandTitle = expandTitle!=null ? expandTitle : 'Show the filter';
      this._collapserClassName = collapserClassName!=null?collapserClassName:'formCollapser';
    }
   this.unsetCollapser = function()
    {
      this._collapseHTML = null;
      this._collapseTitle = null; 
      this._expandHTML = null;
      this._expandTitle = null;
    }

   this.setVerticalLayout = function(val)
    {
      this.verticalLayout = val;
    }
   
   this.setDataObject = function(data)
    {
      this._data = data == null ? { } : data;
      this._pageId = null;      
    }

   this.getDataObject = function()
    {
      return this._data;
    }
    
   this._getField = function(fieldName)
    {
      for (var i = 0; i < this._formDefs.length; ++i)
       for (var j = 0; j < this._formDefs[i].formDef.length; ++j)
        {
          var field = this._formDefs[i].formDef[j];
          if (field.name == fieldName)
           return field;
        }
      return null;
    }
   this.getValueLabel = function(fieldName, value)
    {
      var f = this._getField(fieldName);
      if (f == null || f.values == null || Array.isArray(f.values) == false)
       return null;

      for (var k = 0; k < f.values.length; ++k)
       if (f.values[k][0] == value)
        return f.values[k][1];

      return null;
    }
   this.getValueImg = function(fieldName, value)
    {
      var f = this._getField(fieldName);
      if (f == null || f.values == null || Array.isArray(f.values) == false)
       return null;

      for (var k = 0; k < f.values.length; ++k)
       if (f.values[k][0] == value)
        return f.values[k].length >= 4 ? f.values[k][3] : null;

      return null;
    }
   this.getFieldLabels = function(fieldName)
    {
      var f = this._getField(fieldName);
      if (f == null || f.values == null || Array.isArray(f.values) == false)
       return null;
       
      return this.getFieldValueLabels(this._data[fieldName], f.values);
    }
   this.getFieldValueLabels = function(values, fieldValues)
    {
      var labels = [];
      for (var v = 0; v < values.length; ++v)
       for (var f = 0; f < fieldValues.length; ++f)
         if (values[v] == fieldValues[f][0])
          labels.push(fieldValues[f][1]);
      return labels;
    }
    
    
   this.getFieldValue = function(fieldName)
    {
      return this._data[fieldName];
    }


   this.setContentOrShowDialog = function(pageId, frameContentCallbackFunc, Str, isCreateNavEvents)
   {
     var that = this;
     if (this._popupTitle != null)
       {
         
         this._dlg.show(this._popupTitle, null, 0.9, 0.9, function(cntId) { 
           FloriaDOM.setInnerHTML(cntId ,Str);
           if (isCreateNavEvents == true)
             createNavEvents(that);
           that.paintForm(pageId);
           if (frameContentCallbackFunc != null)
             frameContentCallbackFunc();
         });
         return true;
       }
      else
       {
         FloriaDOM.setInnerHTML(this._elementId, Str);
         if(isCreateNavEvents == true)
           createNavEvents(that);
         return false;
       }
   }
   
   this.getWizardModeMarkup = function(pageId)
   {
     var Str = "";
     if (this._formDefs.length > 1)
      {
        Str+= '<DIV class="column formWizzardSelection" style="left: 0px; width:22%;">'
               +'<DIV class="innerFlowedDiv" style="top: 0px; border-right: 1px solid #EEE;">'
                 +'<OL class="itemLayout selectable">';
        for (var i = 0; i < this._formDefs.length; ++i)
          Str+=     '<LI '+(i==pageId?'class="selected" ':'')+'id="'+this._elementId+'_F_'+i+'">'+this._formDefs[i].label+'</LI>';
        Str+=      '</OL>'
                 +'</DIV>'
               +'</DIV>'
               +'<DIV class="column right" style="left: 23%">'
                 +'<DIV class="innerFlowedDiv formContainer" id="'+this._elementId+'_FDIV"></DIV>'
                 ;
        var submit = document.getElementById(this._elementId+'_F_SUBMIT');
        if (submit == null || submit.dataset.forms2=="1") // submission UI not overridden
         {
           Str+= '<DIV class="formNavFooter">'
                   +'<CENTER><BUTTON class="formButton" id="'+this._elementId+'_F_PREV">Previous</BUTTON>'
                           +'&nbsp;&nbsp;&nbsp;&nbsp;<BUTTON class="formButton" id="'+this._elementId+'_F_NEXT">Next</BUTTON>'
                           +(this._popupTitle   == null?'&nbsp;&nbsp;&nbsp;&nbsp;<BUTTON class="formButton" id="'+this._elementId+'_F_SUBMIT" style="display:none;" data-forms2="1">Submit</BUTTON>':'')
                           +(this._cancelButton == true?'&nbsp;&nbsp;&nbsp;&nbsp;<BUTTON class="formButton" id="'+this._elementId+'_F_CANCEL">Cancel</BUTTON>':'')
                   +'</CENTER>'
                 +'</DIV>'
                 ;
         }
        else
         {
           this._customNav = true;
         }
        Str+='</DIV>'
           ;
      }
     else
      {
        Str+='<DIV class="column right" style="left: 0px; width: 100%;">'
              +'<DIV class="innerFlowedDiv formContainer" id="'+this._elementId+'_FDIV"></DIV>'
              ;
        var submit = document.getElementById(this._elementId+'_F_SUBMIT');
        if (submit == null || submit.dataset.forms2=="1") // submission UI not overridden
         {
           Str+='<DIV class="formNavFooter">'
                +'<CENTER>'
                  +(this._popupTitle==null?'<BUTTON class="formButton" id="'+this._elementId+'_F_SUBMIT" data-forms2="1">Submit</BUTTON>'
                                          +(this._cancelButton == true?'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<BUTTON class="formButton" id="'+this._elementId+'_F_CANCEL">Cancel</BUTTON>'
                                                                      :''
                                           )
                                          :''
                    )
                +'</CENTER>'
              +'</DIV>'
              ;
         }
        else
         {
           this._customNav = true;
         }
      }
     return Str;
   }
   
   this.paint = function(pageId, frameContentOverride, frameContentCallbackFunc)
    {
      if(this._widgets != null) 
        for (var i = 0; i < this._widgets.length; ++i)
          this._widgets[i].destroy();
      this._widgets = [];
      
      if (pageId == null)
        {
          this._pageId = null;
          return;
        }
      this._customFrame = frameContentOverride!= null;
      if (this._wizardMode == true)
       {
         var Str = this.getWizardModeMarkup(pageId);
         var exit = this.setContentOrShowDialog(pageId, frameContentCallbackFunc, Str, true)
         if(exit == true)
           return;
       }
      else if (frameContentOverride != null)
       {
         var exit = this.setContentOrShowDialog(pageId, frameContentCallbackFunc, frameContentOverride, false);
         if (exit == true)
           return;
       }
      this.paintForm(pageId);
      if (frameContentCallbackFunc != null)
        frameContentCallbackFunc();
    };

    
   this.paintForm = function(pageId)
    {
      // Don't repaint the same page...
      if (pageId == null || pageId != null && pageId == this._pageId)
       return;
      
      var p = this._formDefs[pageId];
      if (p == null)
       {
         this._pageId = pageId;
         return;
       }
      p = p.fields != null ? p.fields : p.formDef;
      
      if (this._wizardMode == true)
        {
          if (this._formDefs.length > 1)
           {
             FloriaDOM.switchCSS(this._elementId+'_F_', this._pageId, pageId, "selected");
             var e = FloriaDOM.getElement(this._elementId+'_F_PREV');
             if (e != null)
              e.disabled = pageId == 0;
             if (pageId == this._formDefs.length-1)
              {
                e = FloriaDOM.getElement(this._elementId+'_F_NEXT');
                if (e != null)
                 e.disabled = true;
                if (this._popupTitle==null)
                 {
                   FloriaDOM.hide(this._elementId+'_F_NEXT');
                   FloriaDOM.show(this._elementId+'_F_SUBMIT');
                 }
              }
             else
              {
                e = FloriaDOM.getElement(this._elementId+'_F_NEXT');
                if (e != null)
                 {
                   e.disabled = false;
                   FloriaDOM.show(e);
                 }
                FloriaDOM.hide(this._elementId+'_F_SUBMIT');
              }
           }
        }

      this._pageId = pageId;
      var formId = this._elementId+'_F';
      var Str = '<FORM onSubmit="return false;" id="'+formId+'" class="formForm"><TABLE width="100%">';

      var edgeFunc = function(i, before) { return before==true ? '<TD align="center">':'</TD>'};
      var heading = false;
      var boolWalls=[];
      for (var i = 0; i < p.length; ++i)
       {
         var d = p[i];
         if (d.questions != null)   
          {
            if (d.displayMode == null || d.displayMode=='DEFAULT')
             {
                Str+='<TR class="bottomPadded withIndenting" ><TD colspan="10" class="fieldQuestion" style="padding-bottom: 10px;">'+d.label+'</TD></TR>'
                   +'<TR><TD>&nbsp;</TD>' + FloriaControls.Radio.header(d.values, '<TD align="center">', '</TD>') + '</TR>'
                   ;
                
                for (var j = 0; j < d.questions.length; ++j)
                  {
                    var d2 = d.questions[j];
                    var formElementIds = [ this._elementId+'_F', d2.name];
                    Str+='<TR class="bottomPadded withIndenting" valign="top" id="'+this._elementId+'_'+this._pageId+'_ROW_'+i+'"><TD class="fieldName2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+d2.label+'</TD>'
                        +FloriaControls.Radio.gen(null, formElementIds, d.values, edgeFunc, null, this._data[d2.name], null, true)
                        +'</TR>'
                        ;
                  }
                Str+='</TR><TD>&nbsp;</TD></TR>';
             }
            else if (d.displayMode=='BOOL_WALL')
             {
                var v = d.values[0][0]=='0' ? d.values[0] : d.values[1]; // default "no"
                var srcNo = v[3].startsWith("/")==true ? v[3].substring(5) : "data:image/"+v[3].substring(4);
                var sizeNo = v[2];
                var v = d.values[0][0]=='1' ? d.values[0] : d.values[1]; // default "yes"
                var srcYes = v[3].startsWith("/")==true ? v[3].substring(5) : "data:image/"+v[3].substring(4);
                var sizeYes = v[2];
                boolWalls.push({srcNo: srcNo, sizeNo: sizeNo, srcYes: srcYes, sizeYes: sizeYes});

                Str+='<TR><TD colspan="10" class="fieldName" style="text-align: left; font-size: 125%; padding-bottom: 10px;"><BR>'+d.label+'</TD></TR>'
                    +'<TR><TD>&nbsp;</TD></TR>'
                    +'<TR><TD><TABLE class="floriaForms_boolwall"><TR class="floriaForms_boolwall_label">'
                    ;
                var iconLine = "";
                for (var j = 0; j < d.questions.length; ++j)
                  {
                    var d2 = d.questions[j];
                    if (d2==null)
                     {
                       if (iconLine!="")
                        Str+='<TR class="floriaForms_boolwall_img">'+iconLine;
                       Str+='</TR><TR class="floriaForms_boolwall_label">';
                       iconLine="";
                       continue;
                     }
                    
                    Str+='<TD>'+d2.label+'</TD>';
                    iconLine+='<TD><IMG data-boolwall="'+(boolWalls.length-1)+'" data-id="'+d.name+'" data-value="0" src="'+srcNo+'" width="'+sizeNo+'"></TD>';
                  }
                 if (iconLine!="")
                  Str+='<TR class="floriaForms_boolwall_img">'+iconLine;
                 Str+='</TR></TABLE></TD></TR>';
             }
            continue;
          }
         if (d.name==null)
          {
            if (d.label==null)
              Str+='<TR><TD colspan="10">&nbsp;</TD></TR>';
            else
              {
                Str+='<TR><TD colspan="10"><div class="formLabelName">'+d.label+'</div></TD></TR>';
                heading = true;
              }
            continue;
          }

         Str+= d.group == null ? getFieldMarkup(null, d, this._elementId, this._pageId, i, null, null, this._data, this._defaultEdgeFunc, heading, this.verticalLayout)
                               : getGroupMarkup(d, this._elementId, this._pageId, i, this._data, this._defaultEdgeFunc, heading, this.verticalLayout)
                               ;
       }
      Str+='</TABLE></FORM>';
      if (this._collapseHTML != null)
       Str+='<DIV class="'+this._collapserClassName+'" title="'+this._collapseTitle+'" id="'+formId+'_COLLAPSER">'+this._collapseHTML+'</DIV>';
      FloriaDOM.setInnerHTML(this._wizardMode == true || this._customFrame == true ? this._elementId+"_FDIV" : this._elementId, Str);

      var that = this;
      if (this._collapseHTML != null)
       {
         var containerElement = FloriaDOM.getElement(this._elementId);
         var containerNextElement = FloriaDOM.nextSiblingNode(containerElement);
         var formElement = FloriaDOM.getElement(this._elementId+"_F");
         FloriaDOM.addEvent(formId+'_COLLAPSER', "click", function(e, event, target) {
           if (e.title == that._expandTitle) // need to expand
            {
              e.title = that._collapseTitle;
              e.innerHTML = that._collapseHTML;
              e.classList.remove("collapsed");
              formElement.style.display = "block";
              FloriaDOM.fitBelow(containerElement, containerNextElement, 0);
            }
           else
            {
              e.title = that._expandTitle;
              e.innerHTML = that._expandHTML;
              e.classList.add("collapsed");
              formElement.style.display = "none";
              FloriaDOM.fitBelow(containerElement, containerNextElement, 0);
            }
         });
       }

      FloriaDOM.addEvent(this._elementId+'_F', "click", function(e, event, target) {
          if (target.tagName=="IMG" && FloriaText.isNoE(target.dataset.boolwall) == false) // Bool Walls
           {
             var bw = boolWalls[target.dataset.boolwall];
             if (target.dataset.value == 0)
              {
                target.src=bw.srcYes;
                target.style.width=bw.sizeYes;
                target.dataset.value = 1;
              }
             else
              {
                target.src=bw.srcNo;
                target.style.width=bw.sizeNo;
                target.dataset.value = 0;
              }
           }
          if (target.tagName=="IMG" && FloriaText.isNoE(target.id) == false) // Pickers
           {
             var parts = target.id.split("`");
             if (parts.length == 2 && parts[0] == "ADD")
               {
                 var e = FloriaDOM.getElement(that._elementId+'_'+that._pageId+'_ROW_'+parts[1]);
                 if (e != null)
                  {
                    var d = p[parts[1]];
                    var Str = getGroupUnitMarkup(d, that._elementId, that._pageId, parts[1], e.rows.length, null, that._defaultEdgeFunc, true, d.maxCount==1);
                    FloriaDOM.addRow(e, null, Str, e.rows.length, "top");
                    var Pickers = [];
                    for (var k = 0; k < d.group.length; ++k)
                      {
                        fillField(d.group[k], that._elementId, that._pageId, parts[1], d.group.length*(e.rows.length-1)+k, that._descriptions, null, that._widgets, Pickers, e.rows.length-1);
                      }
                    if (Pickers.length > 0)
                      {
                        FloriaFactories.PickerRegistry.render(Pickers, null, null);
                      }
                  }
               }
             else if (parts.length == 3 && parts[0] == "DEL") 
               {
                 var e = FloriaDOM.getElement(that._elementId+'_'+that._pageId+'_ROW_'+parts[1]);
                 if (e != null)
                  {
                    FloriaDOM.removeRow(e, parts[2]);
                    that.updatePage(that._pageId);
                  }
               }
           }
          return false;
        });
      
      if (this._liveOnChange == true)
        FloriaDOM.addEvent(this._elementId+'_F', "change", function(e, event, target)
          {
            that.updatePage(that._pageId, true);
          });

      var Pickers = [];
      for (var i = 0; i < p.length; ++i)
       {
         var d = p[i];
         if (d.group != null)
          fillGroup(d, this._elementId, this._pageId, i, this._descriptions, this._data, this._widgets, Pickers);
         else
          fillField(d, this._elementId, this._pageId, i, null, this._descriptions, this._data, this._widgets, Pickers);
       }
      if (Pickers.length > 0)
        {
          ++this._pickersLoading;
//          console.log("BEFORE PICKER RENDER: _pickersLoading: "+this._pickersLoading, "; data: ", this._data);
          FloriaFactories.PickerRegistry.render(Pickers, null
                                              , function() { --that._pickersLoading;
//                                                             console.log("AFTER PICKER RENDER: _pickersLoading: "+that._pickersLoading, "; data: ", that._data);
                                                           }
                                              , this._liveOnChange == true ? function() {
                                                     FloriaDOM.fireEvent(that._elementId+'_F', "change"); 
                                                  } : null
                                               );
        }
    }; 
   
   this.updatePage = function(toPageId, fieldChange, skipValidation)
    {
//      console.log("\n-------------------------------------------------------------------------");
//      console.log("updatePage START: _pickersLoading="+this._pickersLoading+"; toPageId: "+toPageId+"; this._pageId: "+this._pageId+"; this._data: ", this._data);
//      console.trace();
      // Can't do anything until pickers are all loaded.
      if (this._pickersLoading > 0)
       {
         var that = this;
         setTimeout(function() { that.updatePage(toPageId, fieldChange, skipValidation); }, 250);
         return;
       }
      
      if (this._pageId != null) // actually updating a form page's visual aspect/data
       {
         var p = this._formDefs[this._pageId];
         if (p != null)
          {
            var f = FloriaDOM.getElement(this._elementId+"_F");
            var MissingParams = [];
            p = p.fields != null ? p.fields : p.formDef;
            for (var i = 0; i < p.length; ++i)
             {
               var d = p[i];
               var formElementIds = [ this._elementId+'_F', d.name];
               if (d.questions != null)
                {
                  for (var j = 0; j < d.questions.length; ++j)
                    {
                      var d2 = d.questions[j];
                      var formElementIds = [ this._elementId+'_F', d2.name];
                      this._data[d2.name] = FloriaControls.GeneralControl.get(formElementIds);
                    }
                }
               else if (d.group != null)
                {
                  var groupCount = -1;
                  var emptyCount = 0;
                  this._data[d.name] = [];
                  for (var j = 0; j < 50; ++j)
                   {
//                     console.log("Looking at form group "+j);
//                     var hasVar = false;
                     var groupVal = { };
                     for (var k = 0; k < d.group.length; ++k)
                      {
                        var d2 = d.group[k];
                        var v = null;
                        var formElementIds = [ this._elementId+'_F', d2.name+'_'+j/**d.group.length+k)*/];
//                        console.log("      Element "+formElementIds);
                        if (d2.type=="checkbox")
                         v = FloriaControls.GeneralControl.get(formElementIds, true);
                        else if (d2.type=="rating")
                         v = FloriaControls.Rating.get(formElementIds);
                        else if (d2.type=="text" || d2.type=="hidden" || d2.type=="textarea" || d2.type=="number" || d2.type=="radio" || d2.type=="date" || d2.type=="dropdown")
                         {
                           v = f[d2.name+'_'+j];
                           if (v != null)
                            v = v.value;
                         }
                        else
                         {
                           v = f[d2.name+'_'+j];
                           if (v != null)
                            {
                              if (FloriaText.TextUtil.isNullOrEmpty(v.value) == true)
                                v = [];
                              else
                                {
                                  var values = v.value.split("``");
//                                  console.log("=>=>=>  values: ", d2.name, values);
                                  var descriptions = v.dataset.description;
                                  descriptions = descriptions != null ? descriptions.split("~~") : [];
                                  v = [];
                                  for(var m=0; m < values.length; m++)
                                    {
                                      v.push(values[m]);
                                      this._descriptions[d2.name] = this._descriptions[d2.name] || {};
                                      this._descriptions[d2.name][values[m]] = descriptions[m];
                                    }
                                }
                              // RPJ: Old Code
                              // v = v.value;
                              // v = FloriaText.TextUtil.isNullOrEmpty(v) == true ? [ ] : v.split("``");
                            }
                         }
//                        console.log("      Value for "+d2.type+": "+v);
//                        if (FloriaText.TextUtil.isNullOrEmpty(v) == false)
//                         hasVar = true
//                        else if (d.mandatory == true)
//                         MissingParams.push(d.name+'_'+j);
//                        console.log("     Value: ", v);
                        groupVal[d2.name] = v;
                      }
                     if (hasGroupValue(d.group, groupVal) == true)
                      this._data[d.name].push(groupVal);
                     else if (++emptyCount >= 3)
                      break;
                   }
                }
               else if (d.name == null) // Nothing to do for labels
                {
                }
               else if (d.type=="checkbox" || d.type=="dropdown")
                 this._data[d.name] = FloriaControls.GeneralControl.get(formElementIds);
               else if (d.type=="rating")
                 this._data[d.name] = FloriaControls.Rating.get(formElementIds);
               else if (d.type=="text" || d.type=="hidden" || d.type=="textarea" || d.type=="number" || d.type=="radio" || d.type=="date")
                 {
//                   console.log("FORM VALUE --> d.name: "+d.name+"; f[d.name].value: "+f[d.name].value+"; typeof f[d.name].value: "+typeof f[d.name].value);
                   console.log("d.name: "+ d.name);
                   this._data[d.name] = f[d.name].value;
                 }
               else
                 {
                   var v = f[d.name];
                   if (v != null)
                    v = v.value;
                   this._data[d.name] = FloriaText.TextUtil.isNullOrEmpty(v) == true ? [ ] : v.split("``");
                 }
               if (d.mandatory == true && FloriaText.TextUtil.isNullOrEmpty(this._data[d.name]) == true)
                 MissingParams.push(d.name);
             }
            this._failedValidation = MissingParams.length > 0;
            if (MissingParams.length > 0 && skipValidation != true)
             {
               for (var i = 0; i < p.length; ++i)
                {
                  var d = p[i];
                  var id = this._elementId+'_'+this._pageId+'_ROW_'+i;
                  if (MissingParams.indexOfSE(d.name) == -1)
                   FloriaDOM.removeCSS(id, "ErrorMessage");
                  else
                   FloriaDOM.addCSS(id, "ErrorMessage");
                }
               alert(this._validationErrMsg);
               this._failedValidation = true;
               return false;
             }
            if (this._persistId != null)
             FloriaDOM.localStorageSet(this._persistId, this._data);
            if (this._processCallbackFunc != null)
             this._processCallbackFunc(this._data, toPageId==null, fieldChange);
          }

         this.paintForm(toPageId);
       }
      else
       this.paint(toPageId);

      console.log("updatePage END: ", this._data);
      return true;
    }

   this.report = function(editable, commentElementId, pageId, frameContentOverride, showAllElements)
    {
      console.log("\n-------------------------------------------------------------------------");
      console.log("report START: ", this._data);
      this._customFrame = frameContentOverride!= null;
      if (frameContentOverride != null)
       {
         if (this._popupTitle != null)
          {
            if (this._pageId == null)
             this._dlg.show(this._popupTitle, null, 1, 1);
            this._dlg.setContent(frameContentOverride);
          }
         else
          {
            FloriaDOM.setInnerHTML(this._elementId, frameContentOverride);
          }
       }
      var Str = '<TABLE width="95%" align="center">';
      var Pickers = []
      var header1 = null; var label1 = null;
      var header2 = null; var label2 = null;
      for (var i = 0; i < this._formDefs.length; ++i) // loop top level formDefs
       {
         if (pageId != null && pageId != i)
          continue;
         var def = this._formDefs[i];
         if (editable == true)
           {
             header1='<TR><TD colspan="3"><DIV class="formReportSection"><A id="'+this._elementId+'_P'+i+'" href="javascript:void(0);">'+def.label+'</A></DIV></TD></TR>';
             label1 = def.label;
           }
         else if (pageId == null)
           {
             header1='<TR><TD colspan="3"><DIV class="formReportSection">'+def.label+'</DIV></TD></TR>';
             label1 = def.label;
           }

         var itemList = def.formDef != null ? def.formDef : def.fields;
         for (var j = 0; j < itemList.length; ++j) // def.formDef has actual form def. pickers, radios, checkbox, etc...
          {
            var f = itemList[j];
            if (f.name == null) // Label line
             {
               header2='<TR valign="top"><TD width="30px">&nbsp;</TD><TD colspan="2" class="fieldQuestion"><DIV class="formLabelName">'+f.label+'</DIV></TD></TR>';
               label2 = f.label;
             }
            else if (f.group != null) // Group // if group -> Pickers
             {
               if (itemList.length > 1)
                {
                  header2='<TR valign="top"><TD width="30px">&nbsp;</TD><TD colspan="2" class="fieldQuestion"><DIV class="formGroupName">'+f.label+'</DIV></TD></TR>';
                  label2 = f.label;
                }
               var values = this._data[f.name];
               if (values != null)
                for (var valuesIndex = 0; valuesIndex < values.length; ++valuesIndex)
                 {
                   var val = values[valuesIndex];
                   if (val == null || hasGroupValue(f.group, val) == false)
                    continue;
                   var firstProp = true;
                   for (var propIndex = 0; propIndex < f.group.length; ++propIndex)
                    {
                      var v = val[f.group[propIndex].name];
                      if (v != null)
                       {
                         if (f.type=="date")
                          v = FloriaText.isNoE(v)==true?"":FloriaDate.parseDateTime(v).printFriendly(true, false);
                         else if (f.type=="text" || f.type == "textarea")
                          v = FloriaText.TextUtil.replaceNewLinesWithBreaks(v, false);
                         else if (Array.isArray(v) == true && v.length > 0)
                           {
                             var field = f.group[propIndex];
                             var elementId = this._elementId + "_" + i + "_PH" + j + "_" + valuesIndex + "_" + propIndex;
                             var pickerDef = {fieldName: field.name, pickerName: field.type, elementId: elementId, multi: field.multi, params: field.params, values: v, descriptions: this._descriptions[field.name]}
                             
                             var valuesWithDescriptions = Object.keys(pickerDef.descriptions || {})
                             var valuesWODesc = pickerDef.values.filter(function(ele) { return valuesWithDescriptions.indexOf(ele) == -1; })
                             
                             if (valuesWODesc.length > 0)
                               {
                                 Pickers.push(pickerDef);
                                 v = 'Loading&nbsp;&nbsp;&nbsp;<img height="10px" src="/static/img/progress_dots.gif">';
                               }
                             else
                               {
                                 v = FloriaFactories.PickerRegistry.renderValue(pickerDef);
                               }
                           }
                         if (FloriaText.isNoE(v)==false || showAllElements == true) // Gotta check again after the transformation of v above.
                          {
                            if (header1!=null) Str+=header1;
                            if (header2!=null && label2 != label1) Str+=header2;
                            header1 = header2 = label1 = label2 = null;
                            Str+='<TR valign="top"><TD align="right" style="padding-left: 10px;">';
                            if (f.maxCount!=1)
                             Str+=(firstProp==true?valuesIndex+1:'');
                            firstProp = false;
                            if (f.group[propIndex].label.length > maxLabelLengthBeforeWrapping)
                             Str+='</TD><TD colspan="2" class="fieldQuestion">'+f.group[propIndex].label
                                 +(commentElementId == null?'':'<INPUT id="'+this._elementId+'_'+f.name+'_'+propIndex+'" type="checkbox">')
                                 +'</TD></TR><TR><TD width="30px">&nbsp;</TD><TD width="30px">&nbsp;</TD>'
                                 +'<TD id="'+this._elementId + "_" + i + "_PH" + j + "_" + valuesIndex + "_" + propIndex +'_VALUES(0)">'+FloriaText.print(v, '<SPAN class="NA"/>')+'</TD>'
                                 +'</TR>';
                            else
                             Str+='</TD><TD class="fieldQuestion" style="white-space: nowrap;" width="1px">'+f.group[propIndex].label
                                 +(commentElementId == null?'':'<INPUT id="'+this._elementId+'_'+f.name+'_'+propIndex+'" type="checkbox">')
                                 +'</TD><TD id="'+this._elementId + "_" + i + "_PH" + j + "_" + valuesIndex + "_" + propIndex +'_VALUES(0)">&nbsp;'+FloriaText.print(v, '<SPAN class="NA"/>')+'</TD>'
                                 +'</TR>';
                          }
                       }
                    }
                 }
                else if (showAllElements == true)
                 {
                   if (header1!=null) Str+=header1;
                   if (header2!=null && label2 != label1) Str+=header2;
                   header1 = header2 = label1 = label2 = null;
                   Str+='<TR valign="top"><TD align="right" style="padding-left: 10px;">';
                   if (f.maxCount!=1)
                    Str+=(firstProp==true?valuesIndex+1:'');
                   firstProp = false;
                   if (f.group[propIndex].label.length > maxLabelLengthBeforeWrapping)
                    {
                      Str+='</TD><TD colspan="2" class="fieldQuestion">'+f.group[propIndex].label
                          +(commentElementId == null ? '':'<INPUT id="'+this._elementId+'_'+f.name+'_'+propIndex+'" type="checkbox">')
                          +'</TD></TR><TR><TD width="30px">&nbsp;</TD><TD width="30px">&nbsp;</TD>'
                          +'<TD id="'+this._elementId + "_" + i + "_PH" + j + "_" + valuesIndex + "_" + propIndex +'_VALUES(0)">'+FloriaText.print(v, '<SPAN class="NA"/>')+'</TD>'
                          +'</TR>'
                          ;
                    }
                   else
                    {
                      Str+='</TD><TD class="fieldQuestion" width="1px" style="white-space: nowrap;">'+f.group[propIndex].label
                          +(commentElementId == null ? '':' <INPUT id="'+this._elementId+'_'+f.name+'_'+propIndex+'" type="checkbox">')
                          +'</TD><TD id="'+this._elementId + "_" + i + "_PH" + j + "_" + valuesIndex + "_" + propIndex +'_VALUES(0)">&nbsp;'+FloriaText.print(v, '<SPAN class="NA"/>')+'</TD>'
                          +'</TR>'
                          ;
                    }
                 }
               }
              else // Regular field
               {
                 var val = this._data[f.name];
                 if (val != null)
                  {
                    if (f.type=="date")
                     {
                       val = FloriaText.isNoE(val)==true || val=="---" ? null : FloriaDate.parseDateTime(val).printFriendly(true, false);
                     }
                    else if (f.type=="text" || f.type == "textarea")
                     val = FloriaText.TextUtil.replaceNewLinesWithBreaks(val, false);
                    else if (f.type=="boolean")
                     val = FloriaText.isNoE(val) ? null : val==1 ? 'Yes' : 'No';
                    else if (Array.isArray(val) == true)
                     {
                       if (f.values != null && Array.isArray(f.values) == true)
                        val = this.getFieldValueLabels(val, f.values);
                       val.sort();
                     }
                  }
                 if (FloriaText.isNoE(val) == false || showAllElements == true)
                  {
                    if (header1!=null) Str+=header1;
                    if (header2!=null && label2 != label1) Str+=header2;
                     header1 = header2 = label1 = label2 = null;
                    if (f.label.length > maxLabelLengthBeforeWrapping)
                     {
                       Str+='<TR valign="top"><TD width="30px"></TD><TD colspan="2" class="fieldQuestion">'+f.label
                           +(commentElementId==null?'':'<INPUT id="'+this._elementId+'_'+f.name+'" type="checkbox">')
                           +'</TD></TR><TR><TD width="30px">&nbsp;</TD><TD width="30px">&nbsp;</TD><TD>'+FloriaText.print(val, '<SPAN class="NA"/>')
                           +'</TD></TR>'
                           ;
                     }
                    else
                     {
                       Str+='<TR valign="top"><TD width="30px"></TD><TD class="fieldQuestion" width="1px" style="white-space: nowrap;">'+f.label
                           +(commentElementId==null?'':'<INPUT id="'+this._elementId+'_'+f.name+'" type="checkbox">')
                           +': </TD><TD>&nbsp;'+FloriaText.print(val, '<SPAN class="NA"/>')+'.</TD></TR>'
                           ;
                     }
                  }
               }
            }
       }
      Str+='</TABLE><BR><BR>';
      FloriaDOM.setInnerHTML(this._customFrame == true ? this._elementId+"_FDIV" : this._elementId, Str);

      // Render picker Values
      if (Pickers.length > 0)
        {
          var that = this;
          FloriaFactories.PickerRegistry.renderValues(Pickers, function(newDescriptions) 
            {
              Object.keys(newDescriptions).forEach(function(key) { that._descriptions[key] = newDescriptions[key] });
              console.debug("Descriptions Updated. ", that._descriptions);
            });          
        }
      
      if (editable == true)
       {
         var that = this;
         for (var i = 0; i < this._formDefs.length; ++i)
          FloriaDOM.addEvent(this._elementId+'_P'+i, "click", makeUpdatePageFunc(that, i));
       }
      if (commentElementId != null)
       {
         var that = this;
         var MakeHandler = function(name) { return function(e, event, target) { that.selectCommentItem(e, name, commentElementId); }; }; 
         for (var i = 0; i < this._formDefs.length; ++i)
          {
             var def = this._formDefs[i];
             for (var j = 0; j < def.formDef.length; ++j)
              {
                var f = def.formDef[j];
                FloriaDOM.addEvent(this._elementId+'_'+f.name, "click", MakeHandler(f.name));
              }
          }
       }
      console.log("report END: ", this._data);
    };
 
   this.selectCommentItem = function(checkboxId, itemId, commentElementId)
    {
      var e = FloriaDOM.getElement(checkboxId);
      var c = FloriaDOM.getElement(commentElementId+'_VALUES');
      var values = c==null?[]:c.value.split("``");
      var itemVal = itemId;
      if (e.checked == true)
       {
         if (values.indexOfSE(itemVal) == -1)
          values.push(itemVal);
       }
      else
       {
         var i = values.indexOfSE(itemVal);
         if (i != -1)
          values.remove(i);
       }
      var Str = '<input type="hidden" name="sectionsAndFields" id="'+commentElementId+'_VALUES" value="';
      for (var i = 0; i < values.length; ++i)
       {
         if (i != 0)
          Str+='``';
         Str+=values[i];
       }
      Str+='">';
      for (var i = 0; i < values.length; ++i)
       {
         if (i != 0)
          Str+='&nbsp;&nbsp;&nbsp; ';
         Str+=values[i];
       }
      Str+='<BR>';
      FloriaDOM.setInnerHTML(commentElementId, Str);
    };
 };
  
FloriaForms.getFormTypes = function()
 {
   var types = [ ["text", "Text"]
                ,["textarea", "Paragraph"]
                ,["int", "Integer"]
                ,["number", "Number"]
                ,["date", "Date"]
                ,["boolean", "Boolean"]
                ,["radio", "Radios"]
                ,["checkbox", "Checkboxes"]
                ,["dropdown", "Dropdown"]
                ,["rating", "Rating"]
               ];
   types = types.concat(FloriaFactories.PickerRegistry.getPickerList());
   return types;
 }

function processField(formElement, fieldNames, def)
 {
   var OK = true;
   for(var i = 0; i < fieldNames.length; ++i)
    {
       var elementName = fieldNames[i];
       var value = FloriaDOM.getFormElementValue(formElement, elementName);
       var e = formElement[elementName].parentNode.parentNode;
       if (FloriaText.isNoE(value) == true)
        {
          FloriaDOM.addCSS(e, "ErrorMessage");
          OK = false;
        }
       else
        {
          def[elementName] = value;
          FloriaDOM.removeCSS(e, "ErrorMessage");
        }
    }
   return OK;
 }

function makeSubmitHandlerFunc(elementId, callbackFunc)
 {
   return function(e, event, target) {
      var def = { };
      var OK = true;
      if (processField(e, ["type", "label"], def) == false)
        OK = false;


      var fields = [];
      if (def.type != "label")
        {
          fields.push("name");
          fields.push("mandatory");
        }
      if (def.type=="textarea")
       fields.push("rows");
      else if (def.type=="number")
       {
         fields.push("min");
         fields.push("step");
       }
      else if (def.type=="radio" || def.type=="checkbox" || def.type=="dropdown")
       fields.push("cols");
      else if (def.type=="rating")
       fields.push("max");
       
      if (processField(e, fields, def) == false)
        OK = false;

      if (def.mandatory != null)
        def.mandatory = def.mandatory == "1";
      
      if (def.type=="radio" || def.type=="checkbox" || def.type=="dropdown")
       {
          var values = [];
          for (var i = 0; i < 100; ++i)
           {
             var value = FloriaDOM.getFormElementValue(e, "value"+i);
             var label = FloriaDOM.getFormElementValue(e, "label"+i);
             if (value == null)
              break;
             var valueElement = e["value"+i].parentNode;
             var labelElement = e["label"+i].parentNode;
             FloriaDOM.removeCSS(valueElement, "ErrorMessage");
             FloriaDOM.removeCSS(labelElement, "ErrorMessage");
             if (FloriaText.isNoE(value) == false && FloriaText.isNoE(label) == false)
              {
                values.push([value, label]);
              }
             else if (FloriaText.isNoE(value) == false || FloriaText.isNoE(label) == false)
              {
                OK = false;
                if (FloriaText.isNoE(value) == true)
                 FloriaDOM.addCSS(valueElement, "ErrorMessage");
                if (FloriaText.isNoE(label) == true)
                 FloriaDOM.addCSS(labelElement, "ErrorMessage");
              }
           }
          if (values.length > 0)
           def.values = values;
          else
           {
             OK = false;
             FloriaDOM.addCSS(e["value0"].parentNode, "ErrorMessage");
             FloriaDOM.addCSS(e["label0"].parentNode, "ErrorMessage");
           }
        }
    
      if (OK == false)
       alert("There are missing or invalid fields");
      else
       callbackFunc(def);
    
      return false;
    };
 }

FloriaForms.paintFieldGenerator = function(elementId, type, callbackFunc, field)
 {
   if (type == null || field != null)
    {
      var types = this.getFormTypes();
      types.push(["label", "Label"])
      var Str = '<FORM id="'+elementId+'_F" onsubmit="return false;" >\n'
                 +'<BR>'
                 +'<TABLE border="0px" width="100%" id="'+elementId+'_T">\n'
                    +'<TR class="bottomPadded"><TD colspan="3"><DIV class="section">Main Information</DIV></TD></TR>\n'
                    +'<TR id="'+elementId+'_ROW_NAME" class="bottomPadded"><TD width="20px">&nbsp;</TD><TD class="fieldName">Name </TD><TD><INPUT name="name" type="text" value="'+(field==null?"":FloriaText.print(field.name,""))+'"></TD></TR>\n'
                    +'<TR class="bottomPadded"><TD></TD><TD class="fieldName">Type </TD><TD>'+FloriaControls.Dropdown.gen(null, [elementId+'_F', "type"], types, true, null, field==null?null:field.type)+'</TD></TR>\n'
                    +'<TR id    ="'+elementId+'_ROW_MANDATORY" class="bottomPadded"><TD></TD><TD class="fieldName">Mandatory </TD><TD>'+FloriaControls.Radio.gen(null, [elementId+'_F', "mandatory"], [["1", "Yes"], ["0", "No"]], null, null, field==null?null:field.mandatory==true?1:0)+'</TD></TR>\n'
                    +'<TR class="bottomPadded"><TD></TD><TD class="fieldName">Label</TD><TD><INPUT name="label" type="text" value="'+(field==null?"":FloriaText.print(field.label,""))+'"><INPUT id="'+elementId+'_PREV_TYPE" type="hidden"></TD></TR>\n'
                    +'<TR class="bottomPadded"><TD colspan="3"><BR><BR><DIV class="section">Additional Information</DIV></TD></TR>\n'
                    +'<TR class="bottomPadded"><TD></TD><TD colspan="2">\n'
                          +'<CENTER style="font-size: 125%">\n'
                            +'<IMG src="/static/img/warning.gif" width="50px" align="absmiddle"><BR>\n'
                            +'Please, select a type.\n'
                          +'</CENTER>\n'
                    +'</TD></TR>\n'
                 +'</TABLE>\n'
                 +'<BR><BR>'
                 +'<CENTER><BUTTON class="formButton">'+(field==null?"Add":"Update")+'</BUTTON></CENTER>'
               +'</FORM>\n'
               ;
      FloriaDOM.setInnerHTML(elementId, Str);
      var that = this;
      FloriaDOM.addEvent(elementId+"_F_type", "change", function(e, event, target) {
         that.paintFieldGenerator(elementId, FloriaControls.Dropdown.get([elementId+"_F", "type"]));
         return false;
      });
      FloriaDOM.addEvent(elementId+'_F', "submit", makeSubmitHandlerFunc(elementId, callbackFunc));
    }
   if (type != null)
    {
      var oldTypeElement = FloriaDOM.getElement(elementId+'_PREV_TYPE');
      var oldType = oldTypeElement.value;
      var isTypeRCD    = type   =="radio" || type   =="checkbox" || type   =="dropdown";
      var isOldTypeRCD = oldType=="radio" || oldType=="checkbox" || oldType=="dropdown";
      var replaceRows = isTypeRCD == false || isOldTypeRCD == false;
      oldTypeElement.value=type;
      
      if (type == "label")
        {
          FloriaDOM.hide(elementId+"_ROW_NAME");
          FloriaDOM.hide(elementId+"_ROW_MANDATORY");
        }
      else
        {
          FloriaDOM.show(elementId+"_ROW_NAME");
          FloriaDOM.show(elementId+"_ROW_MANDATORY");
        }

      if (FloriaText.isNoE(oldType) == false && replaceRows == true)
       {
         if (confirm("Changing the field's type will reset some field values.\nDo you want to continue?\n\n") == false)
          {
            FloriaControls.Dropdown.set("type", oldType);
            oldTypeElement.value = oldType;
            return;
          }
       }
      var t = FloriaDOM.getElement(elementId+'_T');
      if (replaceRows == true)
       FloriaDOM.removeRows(t, 6);
      if (type=="text" || type=="date" || type=="boolean" || type=="int")
       {
         FloriaDOM.addRow(t, 'bottomPadded', '<TD></TD><TD colspan="2">No additional information for this field type</TD>\n');
       }
      else if (type=="textarea")
       {
         FloriaDOM.addRow(t, 'bottomPadded', '<TD></TD><TD class="fieldName">Rows</TD><TD><INPUT name="rows" type="number" min="1" step="1" value="'+(field==null?"":FloriaText.print(field.rows,"10"))+'"></TD>\n');
       }
      else if (type=="number")
       {
         FloriaDOM.addRows(t, 'bottomPadded', [ '<TD></TD><TD class="fieldName">Min </TD><TD><INPUT name="min"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.min,"1"))+'"></TD>\n'
                                              ,'<TD></TD><TD class="fieldName">Step</TD><TD><INPUT name="step" type="number" step="1" value="'+(field==null?"":FloriaText.print(field.step,"1"))+'"></TD>\n'
                                             ]);
       }
      else if (type=="radio" || type=="checkbox" || type=="dropdown")
       {
         if (replaceRows == true)
          {
            var Str = '<TD></TD><TD class="fieldName">Values</TD><TD>\n'
                        +'<TABLE BORDER="0px" align="center" width="80%" id="'+elementId+'_TVALS">\n'
                        +'<TR class="bottomPadded" align="left"><TH></TH><TH>Value</TH><TH>Label</TH></TR>\n'
                        ;
            if (field == null || field.values == null || field.values.length == 0)
              {
             Str+= '<TR class="bottomPadded"><TD>1</TD><TD><INPUT type="text" name="value0"></TD><TD><INPUT type="text" name="label0"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>2</TD><TD><INPUT type="text" name="value1"></TD><TD><INPUT type="text" name="label1"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>3</TD><TD><INPUT type="text" name="value2"></TD><TD><INPUT type="text" name="label2"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>4</TD><TD><INPUT type="text" name="value3"></TD><TD><INPUT type="text" name="label3"></TD></TR>\n'
                  ;
              }
            else for (var i = 0; i < field.values.length; ++i)
             {
               var v = field.values[i];
               Str+='<TR class="bottomPadded"><TD>'+(i+1)+'</TD><TD><INPUT type="text" name="value'+i+'" value="'+FloriaText.TextUtil.printFuncParam(v[0])+'"></TD><TD><INPUT type="text" name="label'+i+'" value="'+FloriaText.TextUtil.printFuncParam(v[1])+'"></TD></TR>\n'
             }
            Str+='<TR class="bottomPadded"><TD COLSPAN="2" align="center"><A border="0px" href="javascript:void(0);" id="'+elementId+'_TADD"><IMG height="12px" border="0px" hspace="5px" src="/static/img/add.gif">New values</A></TD>'
                +'<TD>Change type to <SPAN id="'+elementId+'_TBUT">'
                            +'<BUTTON onClick="void(0)" style="margin-left: 20px; font-size:75%;"'+(type=="radio"   ?" disabled":"")+'>Radios</BUTTON>'
                            +'<BUTTON onClick="void(0)" style="margin-left: 20px; font-size:75%;"'+(type=="checkbox"?" disabled":"")+'>Checkboxes</BUTTON>'
                            +'<BUTTON onClick="void(0)" style="margin-left: 20px; font-size:75%;"'+(type=="dropdown"?" disabled":"")+'>Dropdown</BUTTON>'
               +'</SPAN></TD></TR>'
             +'</TABLE>\n'
            +'</TD>\n'

            FloriaDOM.addRows(t, 'bottomPadded', [ '<TD></TD><TD class="fieldName">Columns</TD><TD><INPUT name="cols"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.cols,"4"))+'"></TD>\n'
                                                 ,Str
                                                ]);
          }
         var span = FloriaDOM.getElement(elementId+'_TBUT');
         span.childNodes[0].disabled = type == "radio";
         span.childNodes[1].disabled = type == "checkbox";
         span.childNodes[2].disabled = type == "dropdown";
       }
      else if (type=="rating")
       {
         FloriaDOM.addRow(t, 'bottomPadded', '<TD></TD><TD class="fieldName">Max</TD><TD><INPUT name="max"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.max,"5"))+'"></TD>');
       }
      else if (type != "label")
       {
         FloriaDOM.alertThrow("System Error: unknown Floria Form element type '"+type+"'.");
       }

      if (replaceRows == true && isTypeRCD == true)
       {
         FloriaDOM.addEvent(elementId+'_TADD', "click", function(e, event, target) {
            var t = e.parentNode.parentNode.parentNode;
            var rowCount = t.rows.length;
            FloriaDOM.addRows(t, 'bottomPadded', [ '<TD>'+(rowCount-1)+'</TD><TD><INPUT type="text" name="value'+(rowCount-2)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-2)+'"></TD>'
                                                 ,'<TD>'+(rowCount+0)+'</TD><TD><INPUT type="text" name="value'+(rowCount-1)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-1)+'"></TD>'
                                                 ,'<TD>'+(rowCount+1)+'</TD><TD><INPUT type="text" name="value'+(rowCount-0)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-0)+'"></TD>'
                                                ], rowCount-1);          
         });
         FloriaDOM.addEvent(elementId+'_TBUT', "click", function(e, event, target) {
            oldTypeElement.value=type;
            var txt = target.innerHTML;
            FloriaControls.Dropdown.set([elementId+"_F", "type"], txt == "Radios" ? "radio" : txt == "Checkboxes" ? "checkbox" : "dropdown");
            target.parentNode.childNodes[0].disabled = txt == "Radios";
            target.parentNode.childNodes[1].disabled = txt == "Checkboxes";
            target.parentNode.childNodes[2].disabled = txt == "Dropdown";
            event.preventDefault();
            return false;            
         });
       }
    }
 }

FloriaForms.paintFieldList = function(elementId, fieldDefs, callbackFunc, editCallbackFunc)
 {   
   var Str = '<TABLE class="tableLayout" id="'+elementId+'_LIST">'
            +'<TR align="left"><TH>Label</TH><TH>Id</TH><TH>Type</TH><TH colspan="4" align="center">Actions</TH></TR>'
            ;
   for (var i = 0; i < fieldDefs.length; ++i)
    {
      var f = fieldDefs[i];
      Str+='<TR><TD>'+f.label+'</TD><TD>'+FloriaText.print(f.name)+'</TD>'
              +'<TD>'+f.type+'</TD>'
              +(i == 0 ? '<TD></TD>' : '<TD width="1px"><IMG style="cursor: pointer;" id="up-'+i+'" src="/static/img/up.gif" height="16px"></TD>')
              +(i == fieldDefs.length-1 ? '<TD></TD>' : '<TD width="1px"><IMG style="cursor: pointer;" id="down-'+i+'" src="/static/img/down.gif" height="16px"></TD>')
              +'<TD width="50px" align="center"><IMG style="cursor: pointer;" src="/static/img/edit.gif" id="edit-'+i+'"  height="16px"></TD>'
              +'<TD width="1px" align="center"><IMG style="cursor: pointer;" src="/static/img/delete.gif" id="del-'+i+'" height="16px"></TD>'
          +'</TR>'
          ;      
    }
   Str+='</TABLE>';
   FloriaDOM.setInnerHTML(elementId, Str);
   FloriaDOM.addEvent(elementId+'_LIST', "click", function(e, event, target) {
     var id = target.id;
     if (FloriaText.isNoE(id) == true)
      return;
     id = id.split("-");
     if (id.length != 2)
      return;
     var i = Number(id[1]);
     if (id[0] == "up")
      {
        FloriaDOM.addCSS(target.parentNode.parentNode, "highlight");
        FloriaDOM.addCSS(target.parentNode.parentNode.previousSibling, "fadeOut");
        var f = fieldDefs[i-1];
        fieldDefs[i-1] = fieldDefs[i];
        fieldDefs[i] = f;
        --i;
      }
     else if (id[0] == "down")
      {
        FloriaDOM.addCSS(target.parentNode.parentNode, "highlight");
        FloriaDOM.addCSS(target.parentNode.parentNode.nextSibling, "fadeOut");
        var f = fieldDefs[i+1];
        fieldDefs[i+1] = fieldDefs[i];
        fieldDefs[i] = f;
        ++i;
      }
     else if (id[0] == "edit")
      {
        editCallbackFunc(i);
        return;
      }
     else if (id[0] == "del")
      {
        fieldDefs.splice(i, 1);
        FloriaDOM.addCSS(target.parentNode.parentNode, "fadeOut");
      }
     else
      return;
     setTimeout(function() { 
         callbackFunc(fieldDefs);
         if (id[0] == "up" || id[0] == "down")
          FloriaDOM.flashCSS(FloriaDOM.getElement(elementId+'_LIST').rows[i], "highlight", 250);
      }, 500);
  });
   
 }

 /**
  * Data must be an array and have at least 1 element, and not contain the value
  */
 FloriaForms.fieldNotContains = function(data, value)
  {
    return data != null && data.length!=0 && data.indexOf(value)==-1;
  }
 FloriaForms.fieldEmptyOrContains = function(data, value)
 {
   return data == null || data.length==0 || data.indexOf(value)!=-1;
 }

