"use strict";

define(["floria/superdom", "floria/controls", "floria/textutil", "floria/factories", "floria/date"], function(SuperDOM, FloriaControls, FloriaText, FloriaFactories, FloriaDate) {

var dojoSimple = require(CapsicoDojoSimpleLibJS)


function makeUpdatePageFunc(that, toPageId) { return function() { that.updatePage(toPageId); }; };

function createNavEvents(form)
 {
   //console.log("form: ", form);
   if (form._formDefs.length > 1)
    {
      for (var i = 0; i < form._formDefs.length; ++i)
       SuperDOM.addEvent(form._elementId+'_F_'+i, "click", makeUpdatePageFunc(form, i));
      SuperDOM.addEvent(form._elementId+'_F_PREV', "click", function() { form.updatePage(form._pageId-1); });
      SuperDOM.addEvent(form._elementId+'_F_NEXT', "click", function() { form.updatePage(form._pageId+1); });
    }
   if (form._popupTitle==null)
    SuperDOM.addEvent(form._elementId+'_F_SUBMIT', "click", function() { form.updatePage(null); });
 }

function getFieldMarkup(d, elementId, pageId, rowId, subRowId, groupId, data, edgeFunc)
 {
   var fieldName = d.name+(groupId==null?"":"_"+groupId);
   var v = data == null ? null : data[d.name];
   if (v == null)
    v = d.defaultValue;
   
//   console.log("Painting element ", d);
//   console.log("Data : ", data);
//   console.log("   field name : "+fieldName);
//   console.log("   field value: "+v);
   var formElementIds = [ elementId+'_F', fieldName];
   var xid = rowId+(subRowId==null?'':'_'+subRowId);
   var Str = '<TR class="bottomPadded" valign="top" id="'+elementId+'_'+pageId+'_ROW_'+xid+'">'
                +'<TD class="fieldName'+(d.mandatory == true ? " mandatory":"")+'">'+d.label+'</TD><TD colspan="9" id="'+elementId+'_'+pageId+'_PH'+xid+'">'
           ;
   
   if (d.type=="text")
    Str+='<INPUT name="'+fieldName+'" type="text" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:90%">';
   else if (d.type=="textarea")
    Str+='<TEXTAREA name="'+fieldName+'" rows="'+(d.rows==null?10:d.rows)+'" style="width:90%">'+(FloriaText.isNoE(v) == true ? "" : FloriaText.print(v))+'</TEXTAREA>';
   else if (d.type=="number")
    Str+='<INPUT name="'+fieldName+'" type="number" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:100px" min="'+(d.min==null?1:d.min)+'" step="'+(d.step==null?1:d.step)+'">';
   else if (d.type=="int")
    Str+='<INPUT name="'+fieldName+'" type="number" value="'+FloriaText.TextUtil.printFuncParam(v)+'" style="width:100px" min="0" step="1">';
   else if (d.type=="date")
    Str+='<INPUT type="hidden" id="'+elementId+'_a_'+xid+'" name="'+fieldName+'" value="'+FloriaText.TextUtil.printFuncParam(v)+'"><DIV id="'+elementId+'_b_'+xid+'"><DIV>';
   else if (d.type=="radio")
    Str+=FloriaControls.Radio.gen(null, formElementIds, d.values, d.cols == null ? edgeFunc : FloriaControls.TableEdgeFunc(d.cols), null, v);
   else if (d.type=="boolean")
    Str+=FloriaControls.Radio.gen(null, formElementIds, [["1", "Yes"], ["0", "No"]], null, null,v);
   else if (d.type=="checkbox")
    Str+=FloriaControls.Checkbox.gen(null, formElementIds, d.values, d.cols == null ? edgeFunc : FloriaControls.TableEdgeFunc(d.cols), null, v);
   else if (d.type=="dropdown")
    Str+=FloriaControls.Dropdown.gen(null, formElementIds, d.values, true, null, v);
   else if (d.type=="rating")
    Str+=FloriaControls.Rating.gen(null, formElementIds, "from lowest to highest", d.max, null, v);
   Str+='</TD></TR>';
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


function getGroupUnitMarkup(group, elementId, pageId, rowId, subRowId, data, edgeFunc, noTR, oneOnly)
 {
   var Str = noTR == true ? '' : '<TR>';
   Str+='<TD valign="top">';
   if (oneOnly!=true)
    Str+='<A border="0px" href="javascript:void(0);"><img id="DEL`'+rowId+'`'+subRowId+'" src="/static/img/delete.gif" height="10px" hspace="3px" valign="absmiddle" border="0px"></A>'+(subRowId+1);
   Str+='</TD><TD><TABLE width="100%">';
   for (var k = 0; k < group.length; ++k)
    Str+=getFieldMarkup(group[k], elementId, pageId, rowId, subRowId*group.length+k, subRowId, data, edgeFunc);
   Str+='</TABLE></TD>';
   if (noTR != true)
    Str+='</TR>';
   return Str;
 }


function getGroupMarkup(d, elementId, pageId, rowId, data, edgeFunc)
 {
   var Str = '<TR><TD colspan="10" class="fieldName" style="text-align: left; font-size: 125%;"><BR>'+d.label+'<A border="0px" href="javascript:void(0);">';
   if (d.maxCount != 1)
    Str+='<img id="ADD`'+rowId+'" src="/static/img/add.gif" border="0px" height="12px" hspace="10px" valign="absmiddle"></A>';
   Str+= '</TD></TR>'
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
       Str+=getGroupUnitMarkup(d.group, elementId, pageId, rowId, ++groupCount, val, edgeFunc, false, d.maxCount==1);
       if (d.maxCount == 1)
        break;
     }
   if (groupCount == -1)
    for (var j = 0; j < 1; ++j)
     {
       Str+=getGroupUnitMarkup(d.group, elementId, pageId, rowId, ++groupCount, null, edgeFunc, false, d.maxCount==1);
     }
   Str+='</TABLE></TD></TR>';
   return Str;
 }


function fillField(d, elementId, pageId, rowId, subRowId, data, widgets, pickers, groupCount)
 {
   var fieldName = d.name+(groupCount!=null?"_"+groupCount : subRowId!=null?"_"+subRowId : "");
   var xid = rowId+(subRowId==null?'':'_'+subRowId);
   if (d.name == null || d.type=="textarea" || d.type=="number" || d.type=="boolean" || d.type=="rating" || d.type=="int")
    return;
   if (d.type=="text")
     {
//       if (d.keyUp == true)
//       SuperDOM.addEvent(xid, "keyup", function(e, event, target)
//           {
//             console.log("e->",e);
//             DelayedEvent.register('interNameType',300,function() { 
//               var e = document.getElementById(elementId+'_F');
//               if (e.change != null)
//                e.change();
//             });
//           });
       return;
     }
   if (d.type=="radio" || d.type=="checkbox" || d.type=="dropdown")
    return;
   if (d.type=="date")
    widgets.push(new dojoSimple.Calendar(elementId+'_b_'+xid, elementId+'_a_'+xid));
   else
    {
      console.log("Picker "+d.type+" on "+fieldName+"= ", data==null?null:data[fieldName]);
      var v = data==null?null:data[d.name];
      console.log(v, ", ", d.defaultValue);
      if (v == null || Array.isArray(v) == true && v.length == 0)
       v = d.defaultValue;
      if (v != null && Array.isArray(v) == false)
       v = [ v ] ;
      
      pickers.push({pickerName:d.type, elementId:elementId+"_"+pageId+"_PH"+xid, name:fieldName, multi:d.multi, params:d.params, values: v});
    }
 }

function fillGroup(d, elementId, pageId, rowId, data, widgets, pickers)
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
        fillField(d.group[k], elementId, pageId, rowId, groupCount*d.group.length+k, val, widgets, pickers, groupCount);
    }
   if (groupCount == -1)
    for (var j = 0; j < 2; ++j)
     {
       ++groupCount;
       for (var k = 0; k < d.group.length; ++k)
        fillField(d.group[k], elementId, pageId, rowId, groupCount*d.group.length+k, null, widgets, pickers, groupCount);
     }
 }


var x = function(elementId, data, formDefs, edgeColumnCount, processCallbackFunc, popupTitle, wizardMode, liveOnChange)
 { 
   formDefs = SuperDOM.clone(formDefs);
   this._elementId = elementId;
   this._data = data == null ? { } : data;
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
   if (popupTitle != null)
    {
      this._dlg = new dojoSimple.Dialog(elementId+"_DLG");
      var that = this;
      this._dlg.setOnHide(function() { that.updatePage(null); });
    }
   
   this.setDataObject = function(data)
    {
      this._data = data == null ? { } : data;
    }

   this.getDataObject = function()
    {
      return this._data;
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
         var Str = "";
         if (this._formDefs.length > 1)
          {
            Str+= '<DIV class="column" style="left: 0px; width:25%;">'
                   +'<DIV class="innerFlowedDiv" style="top: 0px; border-right: 1px solid #EEE;">'
                     +'<OL class="itemLayout selectable">';
            for (var i = 0; i < this._formDefs.length; ++i)
             Str+='<LI '+(i==pageId?'class="selected" ':'')+'id="'+this._elementId+'_F_'+i+'">'+this._formDefs[i].label+'</LI>';
 	          Str+=         '</OL>'
                       +'</DIV>'
 	                   +'</DIV>'
 	                   +'<DIV class="column right" style="left: 25.5%; top: 1em;">'
                       +'<DIV class="innerFlowedDiv" style="top: 0px; bottom: 30px;" id="'+this._elementId+'_FDIV"></DIV>'
                       +'<DIV style="position: absolute; left: -3px; bottom: 0px; height: 25px; width: 100%; background-color: #EEEEEE; padding-top: 3px; margin: 3px;">'
                         +'<CENTER><BUTTON id="'+this._elementId+'_F_PREV">Previous</BUTTON>&nbsp;&nbsp;&nbsp;&nbsp;'
                                 +'<BUTTON id="'+this._elementId+'_F_NEXT">Next</BUTTON>'
                                 +(this._popupTitle==null?'&nbsp;&nbsp;&nbsp;&nbsp;<BUTTON id="'+this._elementId+'_F_SUBMIT">Submit</BUTTON>':'')
                         +'</CENTER>'
                       +'</DIV>'
                     +'</DIV>'
             ;
          }
         else
          {
            Str+='<DIV class="column right" style="left: 0px; width: 100%;">'
                  +'<DIV class="innerFlowedDiv" style="top: 0px; bottom: 30px; width: 100%;" id="'+this._elementId+'_FDIV"></DIV>'
                  +'<DIV style="position: absolute; left: -3px; bottom: 0px; height: 25px; width: 100%; background-color: #EEEEEE; padding-top: 3px; margin: 3px;">'
                    +'<CENTER>'
                      +(this._popupTitle==null?'<BUTTON id="'+this._elementId+'_F_SUBMIT">Submit</BUTTON>':'')
                    +'</CENTER>'
                  +'</DIV>'
                  ;
          }
 	       if (this._popupTitle != null)
 	        {
 	          var that = this;
            this._dlg.show(this._popupTitle, null, 1, 1, function(cntId) { 
              SuperDOM.setInnerHTML(cntId ,Str);
              createNavEvents(that);
              that.paintForm(pageId);
              if (frameContentCallbackFunc != null)
                frameContentCallbackFunc();
            });
            return;
 	        }
 	       else
 	        {
   	    	  SuperDOM.setInnerHTML(this._elementId, Str);
            createNavEvents(this);
 	        }
       }
      else if (frameContentOverride != null)
       {
         if (this._popupTitle != null)
          {
            var that = this;
            this._dlg.show(this._popupTitle, null, 1, 1, function(cntId) { 
                SuperDOM.setInnerHTML(cntId ,frameContentOverride);
                that.paintForm(pageId);
                if (frameContentCallbackFunc != null)
                  frameContentCallbackFunc();
            });
            return;
          }
         else
          {
            SuperDOM.setInnerHTML(this._elementId, frameContentOverride);
          }
       }
      this.paintForm(pageId);
      if (frameContentCallbackFunc != null)
        frameContentCallbackFunc();
    };

   this.paintForm = function(pageId)
    {
      var p = this._formDefs[pageId];
      if (p == null)
       {
         return;
       }
      p = p.fields != null ? p.fields : p.formDef;
      
      if (this._wizardMode == true)
        {
          if (this._formDefs.length > 1)
           {
             SuperDOM.switchCSS(this._elementId+'_F_', this._pageId, pageId, "selected");
             SuperDOM.getElement(this._elementId+'_F_PREV').disabled = pageId == 0;
             SuperDOM.getElement(this._elementId+'_F_NEXT').disabled = pageId == this._formDefs.length-1;
           }
        }
       else
        {
        }

      this._pageId = pageId;
      var Str = '<FORM onSubmit="return false;" id="'+this._elementId+'_F"><TABLE width="100%">';
      var formId = this._elementId+'_F';

      var edgeFunc = function(i, before) { return before==true ? '<TD align="center">':'</TD>'};
      
      for (var i = 0; i < p.length; ++i)
       {
         var d = p[i];
         if (d.questions != null)
          {
            Str+='<TR><TD colspan="10" class="fieldName" style="text-align: left; font-size: 125%;"><BR>'+d.label+'</TD></TR>'
               +'<TR><TD>&nbsp;</TD>' + FloriaControls.Radio.header(d.values, '<TD align="center">', '</TD>') + '</TR>'
               ;
            
            for (var j = 0; j < d.questions.length; ++j)
              {
                var d2 = d.questions[j];
                var formElementIds = [ this._elementId+'_F', d2.name];
                Str+='<TR class="bottomPadded" valign="top" id="'+this._elementId+'_'+this._pageId+'_ROW_'+i+'"><TD class="fieldName">'+d2.label+'</TD>'
                    +FloriaControls.Radio.gen(null, formElementIds, d.values, edgeFunc, null, this._data[d2.name], null, true)
                    +'</TR>'
                    ;
              }
            continue;
          }
         if (d.name == null)
          {
            Str+='<TR><TD colspan="10">';
            if (i != 0)
             Str+='<BR>';
            Str+='<div style="font-weight: bold; font-style: italic; font-size: 125%; margin-bottom:10px;">'+d.label+'</div></TD></TR>';
            continue;
          }

         Str+= d.group == null ? getFieldMarkup(d, this._elementId, this._pageId, i, null, null, this._data, this._defaultEdgeFunc)
                               : getGroupMarkup(d, this._elementId, this._pageId, i, this._data, this._defaultEdgeFunc)
                               ;
       }
      Str+='</TABLE></FORM>';
      SuperDOM.setInnerHTML(this._wizardMode == true || this._customFrame == true ? this._elementId+"_FDIV" : this._elementId, Str);

      var that = this;
      SuperDOM.addEvent(this._elementId+'_F', "click", function(e, event, target) {
          if (target.tagName=="IMG" && FloriaText.isNoE(target.id) == false)
           {
             var parts = target.id.split("`");
             if (parts.length == 2 && parts[0] == "ADD")
               {
                 var e = SuperDOM.getElement(that._elementId+'_'+that._pageId+'_ROW_'+parts[1]);
                 if (e != null)
                  {
                    var d = p[parts[1]];
                    var Str = getGroupUnitMarkup(d.group, that._elementId, that._pageId, parts[1], e.rows.length, that._data, that._defaultEdgeFunc, true, d.maxCount==1);
                    SuperDOM.addRow(e, null, Str, e.rows.length, "top");
                    var Pickers = [];
                    for (var k = 0; k < d.group.length; ++k)
                     fillField(d.group[k], that._elementId, that._pageId, parts[1], d.group.length*(e.rows.length-1)+k, that._data, that._widgets, Pickers, e.rows.length-1);
                    if (Pickers.length > 0)
                     FloriaFactories.PickerRegistry.render(Pickers);
                  }
               }
             else if (parts.length == 3 && parts[0] == "DEL") 
               {
                 var e = SuperDOM.getElement(that._elementId+'_'+that._pageId+'_ROW_'+parts[1]);
                 if (e != null)
                  {
                    SuperDOM.removeRow(e, parts[2]);
                    that.updatePage(that._pageId);
                  }
               }
           }
          return false;
        });
      
      if (this._liveOnChange == true)
        SuperDOM.addEvent(elementId+'_F', "change", function(e, event, target)
          {
            that.updatePage(0);
          });

      var Pickers = [];
      for (var i = 0; i < p.length; ++i)
       {
         var d = p[i];
         if (d.group != null)
          fillGroup(d, this._elementId, this._pageId, i, this._data, this._widgets, Pickers);
         else
          fillField(d, this._elementId, this._pageId, i, null, this._data, this._widgets, Pickers);
       }
      if (Pickers.length > 0)
       FloriaFactories.PickerRegistry.render(Pickers);
    }; 
   
   this.updatePage = function(toPageId)
    {
      console.log("\n-------------------------------------------------------------------------");
      console.log("updatePage START: ", this._data);
      if (this._pageId != null)
       {
         var p = this._formDefs[this._pageId];
         if (p != null)
          {
            var f = SuperDOM.getElement(this._elementId+"_F");
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
                  for (var j = 0; j < 25; ++j)
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
                        if (d2.type=="checkbox" || d2.type=="dropdown")
                         v = FloriaControls.GeneralControl.get(formElementIds, true);
                        else if (d2.type=="rating")
                         v = FloriaControls.Rating.get(formElementIds);
                        else if (d2.type=="text" || d2.type=="textarea" || d2.type=="number" || d2.type=="radio" || d2.type=="date")
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
                              v = v.value;
                              v = FloriaText.TextUtil.isNullOrEmpty(v) == true ? [ ] : v.split("``");
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
               else if (d.type=="text" || d.type=="textarea" || d.type=="number" || d.type=="radio" || d.type=="date")
                 this._data[d.name] = f[d.name].value;
               else
                 {
                   var v = f[d.name].value;
                   this._data[d.name] = FloriaText.TextUtil.isNullOrEmpty(v) == true ? [ ] : v.split("``");
                 }
               if (d.mandatory == true && FloriaText.TextUtil.isNullOrEmpty(this._data[d.name]) == true)
                 MissingParams.push(d.name);
             }
            if (MissingParams.length > 0 && toPageId != null)
             {
               for (var i = 0; i < p.length; ++i)
                {
                  var d = p[i];
                  var id = this._elementId+'_'+this._pageId+'_ROW_'+i;
                  if (MissingParams.indexOfSE(d.name) == -1)
                   SuperDOM.removeCSS(id, "ErrorMessage");
                  else
                   SuperDOM.addCSS(id, "ErrorMessage");
                }
               alert("There are missing or invalid values.");
               return false;
             }
            if (this._processCallbackFunc != null)
              {
                this._processCallbackFunc(this._data, toPageId==null);
              }
          }
         this.paintForm(toPageId);
       }
      else
       this.paint(toPageId);

      console.log("updatePage END: ", this._data);
      return true;
    }

   this.report = function(editable, commentElementId, pageId, frameContentOverride)
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
            SuperDOM.setInnerHTML(this._elementId, frameContentOverride);
          }
       }
      var Str = '<TABLE width="95%" align="center">';
      for (var i = 0; i < this._formDefs.length; ++i)
       {
         if (pageId != null && pageId != i)
          continue;
      	 var def = this._formDefs[i];
         if (editable == true)
           Str+='<TR><TD colspan="3"><A id="'+this._elementId+'_P'+i+'" href="javascript:void(0);">'+def.label+'</A></TD></TR>';
         else if (pageId == null)
           Str+='<TR><TD colspan="3"><B>'+def.label+'</B></TD></TR>';

  	     for (var j = 0; j < def.formDef.length; ++j)
	        {
	          var f = def.formDef[j];
	          if (f.name == null) // Label line
             Str+='<TR valign="top"><TD width="100px"><BR></TD><TD class="fieldName" style="text-align: left; font-style: italic; border-bottom: 1px dotted #DDD;"><BR>'+f.label+'</TD><TD><BR></TD></TR>';
	          else if (f.group != null) // Group
             {
               var something = false;
               if (def.formDef.length > 1)
                Str+='<TR valign="top"><TD class="fieldName" style="font-style: italic; border-bottom: 1px dotted #DDD;">'+f.label+'</TD><TD></TD></TR>';
               var values = this._data[f.name];
               if (values != null)
                for (var valuesIndex = 0; valuesIndex < values.length; ++valuesIndex)
                 {
                   var val = values[valuesIndex];
                   if (val == null || hasGroupValue(f.group, val) == false)
                    continue;
                   something = true;
                   for (var propIndex = 0; propIndex < f.group.length; ++propIndex)
                    {
                      var v = val[f.group[propIndex].name];
                      if (v != null)
                       {
                         if (f.type=="date")
                          v = FloriaDate.parseDateTime(v).printFriendly(true, false);
                         else if (f.type=="text" || f.type == "textarea")
                          v = FloriaText.TextUtil.replaceNewLinesWithBreaks(v, false);
                         else if (Array.isArray(v) == true)
                           v.sort();
                       }
                      Str+='<TR valign="top"><TD align="right" style="padding-left: 10px;">';
                      if (f.maxCount!=1)
                       Str+=(propIndex==0?valuesIndex+1:'');
                      Str+='</TD><TD class="fieldName">'+f.group[propIndex].label
                         +(commentElementId==null?'':'<INPUT id="'+this._elementId+'_'+f.name+'_'+propIndex+'" type="checkbox">')
                         +'</TD><TD>'+FloriaText.print(v)+'</TD></TR>';
                    }
                 }
               if (something == false)
                 {
                   Str+='<TR valign="top"><TD></TD><TD class="fieldName">'+FloriaText.print(null)+'</TD></TR>';
                 }
	           }
	          else // Regular field
	           {
    	         var val = this._data[f.name];
    	         if (val != null)
    	          {
    	            if (f.type=="date")
    	             val = FloriaDate.parseDateTime(val).printFriendly(true, false);
    	            else if (f.type=="text" || f.type == "textarea")
    	             val = FloriaText.TextUtil.replaceNewLinesWithBreaks(val, false);
    	            else if (Array.isArray(val) == true)
    	             val.sort();
    	          }
    	         Str+='<TR valign="top"><TD width="100px"></TD><TD class="fieldName">'+f.label
    	             +(commentElementId==null?'':'<INPUT id="'+this._elementId+'_'+f.name+'" type="checkbox">')
    	             +'</TD><TD>'+FloriaText.print(val)+'</TD></TR>';
    	       }
	        }
       }
      Str+='</TABLE>';
      SuperDOM.setInnerHTML(this._customFrame == true ? this._elementId+"_FDIV" : this._elementId, Str);
     
      if (editable == true)
       {
         var that = this;
         for (var i = 0; i < this._formDefs.length; ++i)
          SuperDOM.addEvent(this._elementId+'_P'+i, "click", makeUpdatePageFunc(that, i));
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
                SuperDOM.addEvent(this._elementId+'_'+f.name, "click", MakeHandler(f.name));
              }
          }
       }
      console.log("report END: ", this._data);
    };
 
   this.selectCommentItem = function(checkboxId, itemId, commentElementId)
    {
      var e = SuperDOM.getElement(checkboxId);
      var c = SuperDOM.getElement(commentElementId+'_VALUES');
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
      SuperDOM.setInnerHTML(commentElementId, Str);
    };
 };
  
x.getFormTypes = function()
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
       var value = SuperDOM.getFormElementValue(formElement, elementName);
       var e = formElement[elementName].parentNode.parentNode;
       if (FloriaText.isNoE(value) == true)
        {
          SuperDOM.addCSS(e, "ErrorMessage");
          OK = false;
        }
       else
        {
          def[elementName] = value;
          SuperDOM.removeCSS(e, "ErrorMessage");
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
             var value = SuperDOM.getFormElementValue(e, "value"+i);
             var label = SuperDOM.getFormElementValue(e, "label"+i);
             if (value == null)
              break;
             var valueElement = e["value"+i].parentNode;
             var labelElement = e["label"+i].parentNode;
             SuperDOM.removeCSS(valueElement, "ErrorMessage");
             SuperDOM.removeCSS(labelElement, "ErrorMessage");
             if (FloriaText.isNoE(value) == false && FloriaText.isNoE(label) == false)
              {
                values.push([value, label]);
              }
             else if (FloriaText.isNoE(value) == false || FloriaText.isNoE(label) == false)
              {
                OK = false;
                if (FloriaText.isNoE(value) == true)
                 SuperDOM.addCSS(valueElement, "ErrorMessage");
                if (FloriaText.isNoE(label) == true)
                 SuperDOM.addCSS(labelElement, "ErrorMessage");
              }
           }
          if (values.length > 0)
           def.values = values;
          else
           {
             OK = false;
             SuperDOM.addCSS(e["value0"].parentNode, "ErrorMessage");
             SuperDOM.addCSS(e["label0"].parentNode, "ErrorMessage");
           }
        }
    
      if (OK == false)
       alert("There are missing or invalid fields");
      else
       callbackFunc(def);
    
      return false;
    };
 }

x.paintFieldGenerator = function(elementId, type, callbackFunc, field)
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
                    +'<TR id="'+elementId+'_ROW_MANDATORY" class="bottomPadded"><TD></TD><TD class="fieldName">Mandatory </TD><TD>'+FloriaControls.Radio.gen(null, [elementId+'_F', "mandatory"], [["1", "Yes"], ["0", "No"]], null, null, field==null?null:field.mandatory==true?1:0)+'</TD></TR>\n'
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
                 +'<CENTER><BUTTON>'+(field==null?"Add":"Update")+'</BUTTON></CENTER>'
               +'</FORM>\n'
               ;
      SuperDOM.setInnerHTML(elementId, Str);
      var that = this;
      SuperDOM.addEvent(elementId+"_F_type", "change", function(e, event, target) {
         that.paintFieldGenerator(elementId, FloriaControls.Dropdown.get([elementId+"_F", "type"]));
         return false;
      });
      SuperDOM.addEvent(elementId+'_F', "submit", makeSubmitHandlerFunc(elementId, callbackFunc));
    }
   if (type != null)
    {
      var oldTypeElement = SuperDOM.getElement(elementId+'_PREV_TYPE');
      var oldType = oldTypeElement.value;
      var isTypeRCD    = type   =="radio" || type   =="checkbox" || type   =="dropdown";
      var isOldTypeRCD = oldType=="radio" || oldType=="checkbox" || oldType=="dropdown";
      var replaceRows = isTypeRCD == false || isOldTypeRCD == false;
      oldTypeElement.value=type;
      
      if (type == "label")
        {
          SuperDOM.hide(elementId+"_ROW_NAME");
          SuperDOM.hide(elementId+"_ROW_MANDATORY");
        }
      else
        {
          SuperDOM.show(elementId+"_ROW_NAME");
          SuperDOM.show(elementId+"_ROW_MANDATORY");
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
      var t = SuperDOM.getElement(elementId+'_T');
      if (replaceRows == true)
       SuperDOM.removeRows(t, 6);
      if (type=="text" || type=="date" || type=="boolean" || type=="int")
       {
         SuperDOM.addRow(t, 'bottomPadded', '<TD></TD><TD colspan="2">No additional information for this field type</TD>\n');
       }
      else if (type=="textarea")
       {
         SuperDOM.addRow(t, 'bottomPadded', '<TD></TD><TD class="fieldName">Rows</TD><TD><INPUT name="rows" type="number" min="1" step="1" value="'+(field==null?"":FloriaText.print(field.rows,"10"))+'"></TD>\n');
       }
      else if (type=="number")
       {
         SuperDOM.addRows(t, 'bottomPadded', [ '<TD></TD><TD class="fieldName">Min </TD><TD><INPUT name="min"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.min,"1"))+'"></TD>\n'
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
             Str+= '<TR class="bottomPadded"><TD>1</TD><TD><INPUT type="text" name="value0"></TD><TD><INPUT type="text" name="label0"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>2</TD><TD><INPUT type="text" name="value1"></TD><TD><INPUT type="text" name="label1"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>3</TD><TD><INPUT type="text" name="value2"></TD><TD><INPUT type="text" name="label2"></TD></TR>\n'
                  +'<TR class="bottomPadded"><TD>4</TD><TD><INPUT type="text" name="value3"></TD><TD><INPUT type="text" name="label3"></TD></TR>\n'
                  ;
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

            SuperDOM.addRows(t, 'bottomPadded', [ '<TD></TD><TD class="fieldName">Columns</TD><TD><INPUT name="cols"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.cols,"4"))+'"></TD>\n'
                                                 ,Str
                                                ]);
          }
         var span = SuperDOM.getElement(elementId+'_TBUT');
         span.childNodes[0].disabled = type == "radio";
         span.childNodes[1].disabled = type == "checkbox";
         span.childNodes[2].disabled = type == "dropdown";
       }
      else if (type=="rating")
       {
         SuperDOM.addRow(t, 'bottomPadded', '<TD></TD><TD class="fieldName">Max</TD><TD><INPUT name="max"  type="number" step="1" value="'+(field==null?"":FloriaText.print(field.max,"5"))+'"></TD>');
       }
      else if (type != "label")
       {
         SuperDOM.alertThrow("System Error: unknown Floria Form element type '"+type+"'.");
       }

      if (replaceRows == true && isTypeRCD == true)
       {
         SuperDOM.addEvent(elementId+'_TADD', "click", function(e, event, target) {
            var t = e.parentNode.parentNode.parentNode;
            var rowCount = t.rows.length;
            SuperDOM.addRows(t, 'bottomPadded', [ '<TD>'+(rowCount-1)+'</TD><TD><INPUT type="text" name="value'+(rowCount-2)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-2)+'"></TD>'
                                                 ,'<TD>'+(rowCount+0)+'</TD><TD><INPUT type="text" name="value'+(rowCount-1)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-1)+'"></TD>'
                                                 ,'<TD>'+(rowCount+1)+'</TD><TD><INPUT type="text" name="value'+(rowCount-0)+'"></TD><TD><INPUT type="text" name="label'+(rowCount-0)+'"></TD>'
                                                ], rowCount-1);          
         });
         SuperDOM.addEvent(elementId+'_TBUT', "click", function(e, event, target) {
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

x.paintFieldList = function(elementId, fieldDefs, callbackFunc, editCallbackFunc)
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
   SuperDOM.setInnerHTML(elementId, Str);
   SuperDOM.addEvent(elementId+'_LIST', "click", function(e, event, target) {
     var id = target.id;
     if (FloriaText.isNoE(id) == true)
      return;
     id = id.split("-");
     if (id.length != 2)
      return;
     var i = Number(id[1]);
     if (id[0] == "up")
      {
        SuperDOM.addCSS(target.parentNode.parentNode, "highlight");
        SuperDOM.addCSS(target.parentNode.parentNode.previousSibling, "fadeOut");
        var f = fieldDefs[i-1];
        fieldDefs[i-1] = fieldDefs[i];
        fieldDefs[i] = f;
        --i;
      }
     else if (id[0] == "down")
      {
        SuperDOM.addCSS(target.parentNode.parentNode, "highlight");
        SuperDOM.addCSS(target.parentNode.parentNode.nextSibling, "fadeOut");
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
        SuperDOM.addCSS(target.parentNode.parentNode, "fadeOut");
      }
     else
      return;
     setTimeout(function() { 
         callbackFunc(fieldDefs);
         if (id[0] == "up" || id[0] == "down")
          SuperDOM.flashCSS(SuperDOM.getElement(elementId+'_LIST').rows[i], "highlight", 250);
      }, 500);
  });
   
 }

 return x;
});
