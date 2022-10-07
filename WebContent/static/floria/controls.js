"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Radio buttons and check boxes and dropdowns and...
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/textutil", "floria/superdom"], function(FloriaText, SuperDOM)
{
  
function defaultEdgeFunc()
 {
   return "";
 }

function tableEdgeFunc(columnsCount, classNames)
 { 
    if (classNames == null)
     classNames = "";
    if (columnsCount == null)
     columnsCount = 4;
    var width=Math.floor(100/columnsCount)+"%";
    return function(i, before, count, tdExtras)
     {
        if (tdExtras == null)
         tdExtras = "";
        if (before == true)
         return i == 0                    ? '<TABLE align="center" border="0px" cellpadding="0px" cellspacing="0px" width="98%" class="'+classNames+'"><TR><TD width="'+width+'" '+tdExtras+'>' 
              : i!=0 && i%columnsCount==0 ? '<TR valign="top"><TD width="'+width+'" '+tdExtras+'>'
                                          : '<TD width="'+width+'" '+tdExtras+'>' ;
        else if (i == count-1)
          {
            var Str = '</TD>';
            while (i % columnsCount != columnsCount-1)
              {
                Str+='<TD width="'+width+'">&nbsp;</TD>';
                ++i;
              }
            return Str+'</TR></TABLE>\n';
          }
        else
         return i % columnsCount == columnsCount-1 ? '</TD></TR>' : '</TD>';
      };
};

function makeRelIds(elementId)
 {
   var isArray = Array.isArray(elementId); 
   var formId = isArray == false ? null : elementId[0];
   if (isArray == true)
    elementId = elementId[1];
   return {formId: formId, elementId: elementId, fullId: formId+'_'+elementId};
 }

var Radio = {
  header : function(Values, Before, After)
    {
      var Str = '';
      for (var i = 0; i < Values.length; ++i)
        Str += Before + Values[i][1] + After + '\n';
      return Str;
    },
  gen : function(ContainerId, elementId, Values, edgeFunc, onChange, Default, Mode, noLabels, readOnly)
    {
      if (edgeFunc == null)
       edgeFunc = defaultEdgeFunc;
      if (Default != null && Default.indexOfSE != null)
        Default = Default.length == 0 ? null : Default[0];
      var Ids = makeRelIds(elementId);
      var Str = '<INPUT id="'+Ids.fullId+'" name="' + Ids.elementId + '"'
      if (Default != null)
        Str += ' value="' + Default + '"';
      Str += ' type="hidden">';
      if (readOnly != true)
       for (var i = 0; i < Values.length; ++i)
        {
          var v = Values[i];
          var fullId = Ids.fullId+'_'+i;
          Str += edgeFunc(i, true, Values.length) + '<A id="RADIO_'+fullId+'" class="Radio_' + (Default == v[0] ? 'ON' : 'OFF')
              + '" title="' + v[2] + '" href="javascript:Radio.click([\'' + Ids.formId + '\',\'' + Ids.elementId + '\'], \'' + v[0] + '\', \'RADIO_' + fullId
              + '\', ' + onChange + ',' + Mode + ');' + '">' + (noLabels == true ? '&nbsp;' : v[1]) + '</A>' + edgeFunc(i, false, Values.length) + '\n';
        }
      else 
        for (var i = 0; i < Values.length; ++i)
          {
            var v = Values[i];
            if (Default != v[0])
              continue;
            var fullId = Ids.fullId+'_'+i;
            Str += '<B>'+v[1]+'<B>';
          }
      if (ContainerId == null)
        return Str;
      SuperDOM.setInnerHTML(ContainerId, Str);
    },
  click : function(elementId, Value, TriggerId, onChange, Mode)
    {
      var Ids = makeRelIds(elementId);
      var e = document.getElementById(Ids.fullId);
      if (e == null)
        return;
      if (e.value == Value && Mode == null)
       {
         e.value = '';
         var t = document.getElementById(TriggerId);
         t.className = t.className.split("_")[0] + "_OFF";
       }
      else
       {
         e.value = Value;
         var t = document.getElementById(TriggerId);
         var ClassName = t.className.split("_")[0];
         t.className = ClassName + "_ON";
         ClassName = ClassName + "_OFF";
         for (var i = 0; i < 20; ++i)
          {
            var r = document.getElementById("RADIO_" + Ids.fullId + "_" + i);
            if (r == null)
             break;
            if (r.className == t.className && r != t)
             {
               r.className = ClassName;
               break;
             }
          }
       }
      if (onChange != null)
        onChange(Ids.fullId);
      else if (e.form != null)
        SuperDOM.fireEvent(e.form, "change");         
    },
  get : function(elementId)
    {
      var Ids = makeRelIds(elementId);
      var e = document.getElementById(Ids.fullId);
      return e == null || FloriaText.TextUtil.isNullOrEmpty(e.value) ? null : e.value;
    }
};

var Dropdown = {
  gen : function(ContainerId, elementId, Values, firstEmpty, onChange, Default)
    {
      var Ids = makeRelIds(elementId);
      var Str = '<SELECT id="'+Ids.fullId+'" name="' + Ids.elementId + '"';
      if (onChange != null)
        Str += ' onChange="' + onChange + '"';
      Str += '>';
      if (firstEmpty == true)
        Str += '<OPTION value=""></OPTION>';
      for (var i = 0; i < Values.length; ++i)
       {
         var v = Values[i];
         Str += '<OPTION ' + (Default == v[0] ? 'selected' : '') + ' value="' + v[0] + '">' + v[1] + '</OPTION>';
       }
      Str += '</SELECT>';
      if (ContainerId == null)
        return Str;
      SuperDOM.setInnerHTML(ContainerId, Str);
    },
  get : function(elementId)
    {
      var Ids = makeRelIds(elementId);
      var e = document.getElementById(Ids.fullId);
      return e.selectedIndex == -1 ? null : e.options[e.selectedIndex].value;
    },
  set : function(elementId, Value)
    {
      var Ids = makeRelIds(elementId);
      var e = SuperDOM.getElement(Ids.fullId, "Cannot find element "+Ids.fullId+".");
      var o = e.options;
      for (var i = 0; i < o.length; ++i)
        if (o[i].value == Value || o[i].label == Value || o[i].text == Value)
        {
          e.selectedIndex = i;
          return;
        }
    }
};

var Checkbox = {
  header : Radio.header,
  gen : function(ContainerId, elementId, Values, edgeFunc, onChange, Defaults, noLabels)
    {
      if (edgeFunc == null)
       edgeFunc = defaultEdgeFunc;
      
      if (Defaults != null && Defaults.indexOfSE == null)
        Defaults = [ Defaults ];
      
      var Ids = makeRelIds(elementId);
      var Str = '';
      for (var i = 0; i < Values.length; ++i)
      {
        var v = Values[i];
        var match = Defaults != null && Defaults.indexOfSE(v[0]) != -1;
        var fullId = Ids.fullId + '_' + i;
        Str += edgeFunc(i, true, Values.length) + '<A href="javascript:Checkbox.click([\'' + Ids.formId + '\',\'' + Ids.elementId+'_'+i+ '\'], ' + onChange + ');' + '" id="CHECKBOX_'
            + fullId + '" class="Checkbox_' + (match ? 'ON' : 'OFF') + '" title="' + v[2] + '"><INPUT id="' + fullId
            + '" name="' + Ids.elementId + v[0] + '" type="hidden" value="' + (match ? '1' : '0') + '">' + (noLabels == true ? '' : v[1])
            + '</A>' + edgeFunc(i, false, Values.length) + '\n';
      }
      if (ContainerId == null)
        return Str;
      SuperDOM.setInnerHTML(ContainerId, Str);
    },
  click : function(elementId, onChange)
    {
      var Ids = makeRelIds(elementId);
      var e = SuperDOM.getElement(Ids.fullId);
      if (e == null)
        return;
      if (e.value != 0)
      {
        e.parentNode.className = e.parentNode.className.split("_")[0] + "_OFF";
        e.value = 0;
//        if (e.change != null)
//         e.change();
//        else if (e.form != null && e.form.change != null)
//         e.form.change();
      }
      else
      {
        e.parentNode.className = e.parentNode.className.split("_")[0] + "_ON";
        e.value = 1;
//        if (e.change != null)
//         e.change();
//        else if (e.form != null && e.form.change != null)
//         e.form.change();
      }
      if (onChange != null)
        onChange(Ids.fullId);
      else if (e.form != null)
       SuperDOM.fireEvent(e.form, "change");         
      
    },
  get : function(elementId)
    {
      var Ids = makeRelIds(elementId);
      var vals = [];
      for (var i = 0; i < 20; ++i)
      {
        var r = document.getElementById(Ids.fullId + "_" + i);
        if (r == null)
          break;
        if (r.value != 0)
         vals.push(r.name.substring(Ids.elementId.length));
      }
      return vals;
    }
};

var GeneralControl = {
    get : function(elementId, optional)
     {
       var Ids = makeRelIds(elementId);
       var e = document.getElementById(Ids.fullId);
       if (e == null)
        e = document.getElementById(Ids.fullId+"_0");
       if (e != null)
        {
          if (e.tagName == "INPUT" && e.type == "hidden")
           {
             if (e.id == Ids.fullId)
              {
                var v = Radio.get([Ids.formId, Ids.elementId]);
                return FloriaText.TextUtil.isNullOrEmpty(v) == true ? [] : [v];
              }
             return Checkbox.get([Ids.formId, Ids.elementId])
           }
          else if (e.tagName == "INPUT" && (e.type=="text" || e.type=="number") || e.tagName == "TEXTAREA")
           {
             return [e.value];
           }
          else if (e.tagName == "SELECT")
           {
             return [Dropdown.get([Ids.formId, Ids.elementId])];
           }
        }

       if (optional != true)
         SuperDOM.alertThrow("Cannot find Control element "+Ids.fullId);

       return [];
     },
    makeUrlParams: function(paramDefs)
     {
       var error = false;
       var urlParams = "";
       for (var i = 0; i < paramDefs.length; ++i)
        {
          var p = paramDefs[i];
          var val = GeneralControl.get(p.id);
          if (p.mandatory == true && (val == null || val.length == 0 || FloriaText.TextUtil.isNullOrEmpty(val[0]) == true))
           {
             var Ids = makeRelIds(p.id);
             var e = SuperDOM.getElement(Ids.fullId);
             if (e == null)
              {
                e = SuperDOM.getElement(Ids.fullId+"_0");
                if (e != null)
                 e = e.parentNode;
              }
             SuperDOM.addCSSToParent(e, "ErrorMessage");
             error = true;
           }
          if (val != null)
           for (var j = 0; j < val.length; ++j)
          urlParams+="&"+p.name+"="+escape(val[j]);
        }
       return error == true ? null : urlParams;
     }
};

var Rating = {
  gen : function(ContainerId, ElementId, label, maxValue, onChange, Default)
    {
      var Str = '<INPUT id="' + ElementId + '" name="' + ElementId + '"'
      if (Default != null)
        Str += ' value="' + Default + '"';
      Str += ' type="hidden"><SPAN id="' + ElementId + '_STARS" class="RatingStars">';
  
      for (var i = 1; i <= maxValue; ++i)
      {
        var match = Default != null && i <= Default;
        Str += '<A href="javascript:Rating.click(\'' + ElementId + '\', ' + i + ', ' + maxValue + ', ' + onChange + ', \'' + onChange
            + '\');' + '"><IMG src="/static/img/star' + (match == true ? "On" : "Off") + '.gif"></A>\n';
      }
      Str += '</SPAN><SPAN class="RatingLabel">' + label + '</SPAN>';
      if (ContainerId == null)
        return Str;
      SuperDOM.setInnerHTML(ContainerId, Str);
    },
  click : function(ElementId, v, maxValue, onChange, onChangeStr)
    {
      var e = document.getElementById(ElementId);
      if (e == null)
        return;
      e.value = v;
      var Str = "";
      for (var i = 1; i <= maxValue; ++i)
      {
        var match = i <= v;
        Str += '<A href="javascript:Rating.click(\'' + ElementId + '\', ' + i + ', ' + maxValue + ', ' + onChange + ');'
            + '"><IMG src="/static/img/star' + (match == true ? "On" : "Off") + '.gif"></A>\n';
      }
      SuperDOM.setInnerHTML(ElementId + '_STARS', Str);
      if (onChange != null)
        onChange(ElementId);
    },
  get : function(ElementId)
    {
      var e = document.getElementById(ElementId);
      return e == null ? null : e.value;
    }
};

var Ranking = {
  gen : function(ContainerId, ElementId, Values, onChange, Defaults)
  {
    if (Defaults != null && typeof Defaults == "string")
     Defaults = Defaults.split(",");
    if (Defaults != null && typeof Defaults == "Array" && Defaults.length > 0)
      {
        for (var i = 0; i < Defaults.length; ++i)
           if (Values.getSE(Defaults[i], 0) == null)
            {
              Defaults = null;
              break;
            }
      }
    else
     Defaults = null;

    if (Defaults == null)
     {
       Defaults = [];
       for (var i = 0; i < Values.length; ++i)
        Defaults.push(Values[i][0]);
     }

    var Str = '<INPUT id="' + ElementId + '" name="' + ElementId + '" value="' + Defaults + '" type="hidden">'
             +'<SPAN id="' + ElementId + '_RANKING" class="Ranking">';
    for (var i = 0; i < Defaults.length; ++i)
    {
      var v = Values.getSE(Defaults[i], 0, "Cannot locate option XXX");
      var Prev = '<A href="javascript:Checkbox.click(\'' + ElementId + '\', '+i+', -1, ' + onChange + ');' + '"><IMG class="left" src="/static/img/arrow-left.gif"></A>';
      var Next = '<A href="javascript:Checkbox.click(\'' + ElementId + '\', '+i+',  1, ' + onChange + ');' + '"><IMG class="right" src="/static/img/arrow-right.gif"></A>';
      Str += (i==0?'':Prev) + '<SPAN id="'+ElementId+'_'+v[0]+'">'+v[1]+'</SPAN>' + (i==Values.length-1?'':Next) + '\n';
    }
    Str+='</SPAN>';
    if (ContainerId == null)
      return Str;
    SuperDOM.setInnerHTML(ContainerId, Str);
  },
  click : function(ElementId, i, direction, onChange)
  {
    var e = document.getElementById(ElementId);
    //childNode[4].parentNode.insertBefore(childNode[4], childNode[3]);
    if (e == null)
      return;
    if (e.value != 0)
    {
      e.parentNode.className = e.parentNode.className.split("_")[0] + "_OFF";
      e.value = 0;
    }
    else
    {
      e.parentNode.className = e.parentNode.className.split("_")[0] + "_ON";
      e.value = 1;
    }
    if (onChange != null)
      onChange(ElementId);
  },
  get : function(ElementId)
  {
    var vals = [];
    for (var i = 0; i < 20; ++i)
    {
      var r = document.getElementById(ElementId + "_" + i);
      if (r == null)
        break;
      if (r.value != 0)
       vals.push(r.name.substring(ElementId.length));
    }
    return vals;
  }
};

  window.Radio = Radio;
  window.Dropdown = Dropdown;
  window.Checkbox = Checkbox;

  return { "Radio": Radio, "Dropdown": Dropdown, "Checkbox": Checkbox, "GeneralControl": GeneralControl, "Rating": Rating, "Ranking": Ranking, "TableEdgeFunc": tableEdgeFunc };
  
});
