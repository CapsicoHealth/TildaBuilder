"use strict";

import { FloriaDOM         }  from "/static/floria.v2.0/module-dom.js";
import { FloriaText        }  from "/static/floria.v2.0/module-text.js";
import { FloriaDate        }  from "/static/floria.v2.0/module-date.js";


function getColumnDescriptionTitle(colName, dataDictionary)
 {
   if (dataDictionary != null)
    {
      var col = dataDictionary.getSE(colName, "columnName");
      if (col != null)
       return 'title="'+FloriaText.TextUtil.printHtmlAttrValue(col.description)+'"';
    }
   return "";
 }
 
function paintHeaders(mappings, dataDictionary, start)
 {
   var str = "<TH></TH>";
   for (let m = start; m < mappings.length; ++m)
     str+='<TH class="rotate" '+getColumnDescriptionTitle(mappings[m].field, dataDictionary)+'><DIV><SPAN>'+FloriaText.print(mappings[m].label, FloriaText.spanNA)+'</SPAN></DIV></TH>';
   return str;
 }
 
function paintRows(data, mappings, isTotalRow)
 {
   if (data == null || data.length == 0)
    return '<TR><TD colspan="'+(mappings.length+1)+'"><BR><BR><BR>No data found at this time. Check your filter settings.</TD></TR>';

   var str = "";
   for (let i = 0; i < data.length; ++i)
     {
       var d = data[i];
       if (isTotalRow==true)
        str+='<TR class="totalRow"><TD>&nbsp;</TD>';
       else
        str+='<TR class="selectableItem" data-rowid="'+i+'"><TD align="right"  class="boldable">'+(i+1)+'</TD>';

       for (var m = 0; m < mappings.length; ++m)
         {
           var map = mappings[m];
           var title = '';
           if (map.title != null)
            {
              title = map.title;
              if (map.columns != null)
               for (var c = 0; c < map.columns.length; ++c)
                title = title.replaceAll("$"+(c+1), d[map.columns[c]]);
              title = "title=\""+title+"\"";
            }
           var backgroundColor = map.backgroundColorFormatter == null ? null : map.backgroundColorFormatter(d);
           backgroundColor = backgroundColor == null ? "" : 'style="background-color:'+backgroundColor+';"';
           if (map.formatter != null)
            str+='<TD '+title+' '+backgroundColor+'>'+map.formatter(d)+'</TD>';
//           else if (map.score != null)
//            str+='<TD '+title+'><img border="1px" src="/static/img/gauge'+CohortRiskManager.getRiskScale(map.score, d[map.field])+'.jpg"></TD>';
           else if (map.flag == true)
            str+='<TD '+title+' '+backgroundColor+'>'+FloriaText.TextUtil.getSemanticCheckbox(d[map.field])+'</TD>';
           else if (map.date == true)
            str+='<TD '+title+' '+backgroundColor+'>'+FloriaText.print(FloriaDate.toDtStr(d[map.field], true), FloriaText.spanNA)+'</TD>';
           else if (isTotalRow==true && d[map.field] == undefined)
            str+='<TD>&nbsp;</TD>';
           else 
            str+='<TD '+title+' '+backgroundColor+' '+(m==0?' class="boldable"':'')+'>'+FloriaText.print(d[map.field], FloriaText.spanNA)+'</TD>';
         }
       str+='</TR>';
     }
    return str;
 }


export var BoardManager = { };

BoardManager.paint = function(divId, data, mappings, dataDictionary, timerFunc, tableCssClasses)
 {
   var config = mappings==null || mappings.length == 0 ? null : mappings[0].config;
   var idCol = config?.idCol;
   var toolbarClassName = config?.toolbarClassName;
   
   var dt = config?.dateCol == null || data == null || data.length == 0 
          ? ""
          : "Refreshed on: "+FloriaDate.toDtStr(data[0][config.dateCol])+' 00:00'
          ;
   if (tableCssClasses == null)
    tableCssClasses = "tableLayout rowSelectable rowHighlightable stickyHeader";
   var timingDivId = divId+"_TIMING";
   var str = `<TABLE class="${tableCssClasses}" border="0px" cellpadding="2px">
              <TR valign="bottom">
                <TH colspan="2" style="text-align:left; width:1px;">
                  ${FloriaText.isNoE(toolbarClassName)==true?'':'<DIV id="'+divId+'_MINI_TOOLBAR" class="'+toolbarClassName+'"></DIV><BR>'}
                  <DIV id="${timingDivId}">${dt}</DIV>
                  <BR>
                  Patient Count: ${data==null?0:data.length}<BR>
                  <BR>
                  ${mappings[0].label}
                </TH>
             `;
   str+=paintHeaders(mappings, dataDictionary, 1);
   str+='</TR>';
   str+=paintRows(data, mappings);
   str+='</TABLE>';
   FloriaDOM.setInnerHTML(divId, str);
   if (timerFunc != null)
    timerFunc(timingDivId);
 }


export var HeatTable = { };

HeatTable.paint = function(divId, data, mappings, dataDictionary, totalRowFields, title, tableCssClasses, onClickHandler)
 {
   var str = (title||'')+`<TABLE id="${divId}_TABLE" class="${tableCssClasses}"><TR valign="bottom">`;
   str+=paintHeaders(mappings, dataDictionary, 0);
   str+='</TR>';
   str+=paintRows(data, mappings);
   if (totalRowFields != null)
    {
      var totalRow = data.createTotalRow(totalRowFields);
      str+='<TR class="blankRow"><TD colspan="'+mappings.length+1+'">&nbsp</TD></TR>';
      str+=paintRows([totalRow], mappings, true);
    }
   str+='</TABLE>';
   FloriaDOM.setInnerHTML(divId, str);
   if (onClickHandler != null)
    {
      FloriaDOM.addEvent(divId+"_TABLE", "click", function(e, event, target) {
           var TR = FloriaDOM.getAncestorNode(target, 'TR');
           if (TR == null || TR.dataset.rowid == null)
            return;
           var TABLE = FloriaDOM.getAncestorNode(TR, 'TABLE');
           for (let i = 0; i < TABLE.rows.length; ++i)
            FloriaDOM.removeCSS(TABLE.rows[i], "selected");
           FloriaDOM.addCSS(TR, "selected");
           onClickHandler(data[TR.dataset.rowid]);
      }, null, true);
    }
};

