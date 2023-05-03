"use strict";

import { FloriaCollections } from "./module-collections.js";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// String extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  if (!String.prototype.trim)
    String.prototype.trim = function()
    {
      return this.replace(TextUtil.REGEX_TRIM, "");
    };

  if (!String.prototype.endsWith)
    String.prototype.endsWith = function(str)
    {
      return this.match(str + "$") != null;
    };

  if (!String.prototype.startsWith)
    String.prototype.startsWith = function(str)
    {
      return this.match("^" + str) == str;
    };
  
  if (!String.prototype.hashValue)
  String.prototype.hashValue = function()
   { // taken from https://github.com/darkskyapp/string-hash/blob/master/index.js
      var hash = 5381;
      var i    = str.length;
      while(i)
        hash = (hash * 33) ^ str.charCodeAt(--i)
    
      /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
       * integers. Since we want the results to be always positive, convert the
       * signed int to an unsigned by doing an unsigned bitshift. */
      return hash >>> 0;
   }

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

  if (!String.prototype.printFuncParam)
    String.prototype.printFuncParam = function()
    {
      return this.replace(TextUtil.REGEX_SL, "\\\\").replace(TextUtil.REGEX_DQ, "&quot;").replace(TextUtil.REGEX_SQ, "\\\'");
    };

  if (!String.prototype.printHtmlAttrValue)
    String.prototype.printHtmlAttrValue = function()
    {
      return this.replace(TextUtil.REGEX_SL, "\\\\").replace(TextUtil.REGEX_DQ, "&quot;");
    };

  if (!String.prototype.highlight)
    String.prototype.highlight = function(Regex, ClassName)
    {
      return this.replace(Regex, '<SPAN class="' + ClassName + '">$1</SPAN>');
    }
  if (!String.prototype.getMatchList)
    String.prototype.getMatchList = function(Regex)
      {
        var MatchList = new FloriaCollections.SortedStringArray();
        while (true)
         {
           var Matches = Regex.exec(this);
           if (Matches == null)
            break;
           MatchList.add(Matches[1]);
         }
        return MatchList.A;
      }
  

  var TextUtil = {
    REGEX_DQ : /\"/g,
    REGEX_SQ : /\'/g,
    REGEX_SL : /\\/g,
    REGEX_SPACES : /\s/g,
    REGEX_TRIM : /^\s+|\s+$/g,
    REGEX_NL : /\s*(\r\n|(\n?)<\s*\/?\s*BR\s*>|\n|\\n)\s*/g,
    spanNA   : '<SPAN class="NA"></SPAN>',
    printFuncParam : function(Str)
    {
      return Str == null ? "" 
           : typeof Str == "string" ? Str.printFuncParam()
           : Str;
    },
    isNullOrEmpty : function(Str)
    {
      return  Str == null ? true 
            : Array.isArray(Str) == true && Str.length == 0 ? true 
            : typeof Str == "string" ? Str.isEmpty() 
            : false; // Must be some object... Should test if object has no properties? Maybe a deep test? Performance issues here perhaps.
    },
    print : function(val, def, maxCount)
    {
      if (TextUtil.isNullOrEmpty(def) == true)
       def = '<SPAN class="NA"/>';
      if (Array.isArray(val) == false)
        return TextUtil.isNullOrEmpty(val) == true ? def : (maxCount != null && val.length > maxCount ? val.substring(0, maxCount)+"..." : val);
      if (maxCount == null || maxCount < 2 || maxCount > val.length)
       maxCount = val.length;
      var Str = "";
      for (var i = 0; i < maxCount; ++i)
       {
         if (TextUtil.isNullOrEmpty(val[i]) == true)
          continue;
         if (Str.length != 0)
          Str+=", ";
         Str+=val[i];
       }
      if (maxCount < val.length && Str.length > 0)
       Str+="...";
      return Str.length==0?def:Str;
    },
    replaceNewLinesWithBreaks : function(Str, paragraphIndent)
    {
      var indent = paragraphIndent == false ? "" : "&nbsp;&nbsp;&nbsp;";
      return Str == null ? "" : indent+Str.replaceAll(this.REGEX_NL, "\n<BR>"+indent);
    },
    replaceNewLinesWithSpaces : function(Str)
    {
      return Str == null ? "" : Str.replace(this.REGEX_NL, " ");
    },
    replaceNewLinesWithCommas : function(Str)
    {
      return Str == null ? "" : Str.replace(this.REGEX_NL, ", ");
    },
    replaceSpacesWithNBSPs : function(Str)
    {
      return Str == null ? "" : Str.replace(StringProcessor.REGEX_SPACES, "&nbsp;");
    },
    REGEX_DictMatch : /\[\^([^\^]*)``\^\]/g,
    dictionaryMatchHighlight : function(Str, ClassName)
    {
      return Str == null ? "" : Str.highlight(this.REGEX_DictMatch, ClassName);
    },
    printHtmlAttrValue: function(Str)
    {
//      alert(Str);
      return Str == null ? "" : Str.printHtmlAttrValue();
    },
    printJsonWithHighlights: function(obj)
     {
        if (typeof obj != 'string') {
             obj = JSON.stringify(obj, undefined, 2);
        }
        obj = obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return obj.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'json_number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json_key';
                } else {
                    cls = 'json_string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json_boolean';
            } else if (/null/.test(match)) {
                cls = 'json_null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
     }
    ,getSemanticCheckbox: function(status, fontSize)
       {
         return status ==  0 ? '<B style="color:#AAA ;font-size:'+(fontSize==null?"120%":fontSize)+';">&#9744;</B>'
               :status ==  1 ? '<B style="color:green;font-size:'+(fontSize==null?"120%":fontSize)+';">&#9745;</B>'
               :status == -1 ? '<B style="color:red  ;font-size:'+(fontSize==null?"120%":fontSize)+';">&#9746;</B>'
               :TextUtil.spanNA;
       }
    ,getBooleanCheckbox: function(status, fontSize)
       {
         return status ==  0 ? '<B style="color:red  ;font-size:'+(fontSize==null?"120%":fontSize)+';">&#9746;</B>'
               :status ==  1 ? '<B style="color:green;font-size:'+(fontSize==null?"120%":fontSize)+';">&#9745;</B>'
               :TextUtil.spanNA;
       }
  };


  var NumberUtil = {
    leadingZero1: function(X)
      {
        return X >= 10 || X <= -10 ? X 
             : X >= 0 ? "0"+X 
             : "-0"+(-X);
      },
    leadingZero2: function(X)
      {
        return X >= 100 || X <= -100 ? X 
             : X > -100 && X <= -10 ? "-0"+(-X)
             : X > -10 && X < 0 ? "-00"+(-X) 
             : X >= 0 && X < 10 ? "00"+X
             : "0"+X;
      },
    leadingZero3: function(X)
      {
        return X >=  1000 || X <= -1000 ? X 
             : X >  -1000 && X <=  -100 ?   "-0"+(-X) 
             : X >   -100 && X <=   -10 ?  "-00"+(-X)
             : X >    -10 && X <      0 ? "-000"+(-X) 
             : X >=     0 && X <     10 ?  "000"+X
             : X >=    10 && X <    100 ?   "00"+X
             : "0"+X;
      },
    leadingZero4: function(X)
      {
        return X >=  10000 || X <= -10000 ? X 
             : X >  -10000 && X <=  -1000 ? "-0"+(-X) 
             : X >  -1000  && X <=  -100  ? "-00"+(-X) 
             : X >   -100  && X <=   -10  ? "-000"+(-X)
             : X >    -10  && X <      0  ? "-0000"+(-X) 
             : X >=     0  && X <     10  ? "0000"+X
             : X >=    10  && X <    100  ? "000"+X
             : X >=   100  && X <   1000  ? "00"+X
             : "0"+X;
      },
    printWith0Dec : function(n)
    {
      return Math.round(n);
    },
    printWith1Dec : function(n)
    {
      return Math.round(n * 10) / 10.0;
    },
    printWith2Dec : function(n)
    {
      return Math.round(n * 100) / 100.0;
    },
    printWith3Dec : function(n)
    {
      return Math.round(n * 1000) / 1000.0;
    },
    printPercentWith0Dec : function(Total, Sub, inverse)
    {
      return NumberUtil.printWith0Dec(inverse==true?100 - 100.0 * ((Sub * 1.0) / (Total * 1.0)) : 100.0 * ((Sub * 1.0) / (Total * 1.0)));
    },
    printPercentWith1Dec : function(Total, Sub)
    {
      return NumberUtil.printWith1Dec(100.0 * ((Sub * 1.0) / (Total * 1.0)));
    },
    printPercentWith2Dec : function(Total, Sub)
    {
      return NumberUtil.printWith2Dec(100.0 * ((Sub * 1.0) / (Total * 1.0)));
    },
    printPercentWith3Dec : function(Total, Sub)
    {
      return NumberUtil.printWith3Dec(100.0 * ((Sub * 1.0) / (Total * 1.0)));
    },
    printPerformancePerSecondWith1Dec : function(DurationMillis, Count)
    {
      return NumberUtil.printWith1Dec(1000.0 * Count / DurationMillis);
    },
    printPerformancePerSecondWith2Dec : function(DurationMillis, Count)
    {
      return NumberUtil.printWith2Dec(1000.0 * Count / DurationMillis);
    },
    printPerformancePerMillisWith1Dec : function(DurationMillis, Count)
    {
      return NumberUtil.printWith1Dec(1.0 * Count / DurationMillis);
    },
    printPerformancePerMillisWith2Dec : function(DurationMillis, Count)
    {
      return NumberUtil.printWith2Dec(1.0 * Count / DurationMillis);
    },
    printWithThousands : function(n)
    {
      return n == null ? "N/A" : n.toLocaleString();
    },
    printWithThousands0Dec : function(n)
    {
      return n == null ? "N/A" : Math.round(n).toLocaleString();
    },
    printWithThousands1Dec : function(n)
    {
      return n == null ? "N/A" : NumberUtil.printWith1Dec(n).toLocaleString();
    },
    printWithThousands2Dec : function(n)
    {
      return n == null ? "N/A" : NumberUtil.printWith2Dec(n).toLocaleString();
    },
    printDuration : function(millis)
    {
      var hours = Math.floor(millis /(1000.0*60*60));
      millis = millis - hours*60*60*1000;
      var minutes = Math.floor(millis/(1000.0*60));
      millis = millis - minutes*60*1000;
      var seconds = Math.floor(millis/(1000.0));

      var Str = "";
      if (hours >= 1)
        Str+= hours+"h";
      if (minutes >= 1)
        Str+= " "+minutes+"mn";
      if (seconds >= 1)
        Str+= " "+seconds+"s";
      if (Str == "")
        {
          millis = millis - seconds*1000;
          Str+=millis+" ms";
        }
      
      return Str;
    },
   printDataSize: function(bytes)
    {
      return bytes < 1024           ? NumberUtil.printWithThousands0Dec(bytes)+' B'
           : bytes < 1024*1024      ? NumberUtil.printWithThousands2Dec(bytes/1024.0)+' KB'
           : bytes < 1024*1024*1024 ? NumberUtil.printWithThousands2Dec(bytes/(1024.0*1024.0))+' MB'
           : NumberUtil.printWithThousands2Dec(bytes/(1024.0*1024.0*1024.0))+' GB'
    }
  }

  var MetricUtil = {
    printWithMetric : function printWithMetric(num, digits) {
       num = +num;
    	 var si = [
        { value: 1E18, symbol: "E" },
        { value: 1E15, symbol: "P" },
        { value: 1E12, symbol: "T" },
        { value: 1E9,  symbol: "G" },
        { value: 1E6,  symbol: "M" },
        { value: 1E3,  symbol: "K" },
        { value: 1,  symbol: "" }
      ], i;
      for (i = 0; i < si.length; i++) {
        if (num >= si[i].value) {
          return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol;
        }
      }
//      console.log("num: "+num+"; typeof: "+ (typeof num));
      return num.toFixed(digits).toString();
    },
    printWithCurrencyMetric : function printWithCurrencyMetric(num, digits) {
     num = +num;
   	 var si = [
       { value: 1E12, symbol: "T" },
       { value: 1E9,  symbol: "B" },
       { value: 1E6,  symbol: "M" },
       { value: 1E3,  symbol: "K" },
       { value: 1,  symbol: "" }
     ], i;
     for (i = 0; i < si.length; i++) {
       if (num >= si[i].value) {
         return "$"+(num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol;
       }
     }
//     console.log("num: "+num);
     return "$"+num.toFixed(digits).toString();
   }
  }

export var FloriaTextUtil = TextUtil;
export var FloriaNumberUtil = NumberUtil;
export var FloriaMetricUtil = MetricUtil;

export var FloriaText = {
    "TextUtil" : TextUtil
   ,"NumberUtil" : NumberUtil
   ,"MetricUtil" : MetricUtil
   ,"isNoE": TextUtil.isNullOrEmpty
   ,"print": TextUtil.print
   ,"replaceNewLinesWithBreaks": TextUtil.replaceNewLinesWithBreaks
   ,"spanNA":TextUtil.spanNA
  };

  
  
