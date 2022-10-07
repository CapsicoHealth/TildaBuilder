"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// String extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/collections"], function(FloriaCollections)
{

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
    REGEX_NL : /\r\n|(\n?)<\s*\/?\s*BR\s*>|\n/g,
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
    print : function(val, def)
    {
      if (TextUtil.isNullOrEmpty(def) == true)
       def = '<SPAN class="NA"></SPAN>';
      if (Array.isArray(val) == false)
       return TextUtil.isNullOrEmpty(val) == true ? def : val;
      var Str = "";
      for (var i = 0; i < val.length; ++i)
       {
         if (TextUtil.isNullOrEmpty(val[i]) == true)
          continue;
         if (Str.length != 0)
          Str+=", ";
         Str+=val[i];
       }
      return Str.length==0?def:Str;
    },
    replaceNewLinesWithBreaks : function(Str, paragraphIndent)
    {
      var indent = paragraphIndent == false ? "" : "&nbsp;&nbsp;&nbsp;";
      return Str == null ? "" : indent+Str.replace(this.REGEX_NL, "\n<BR>"+indent);
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
      alert(Str);
      return Str == null ? "" : Str.printHtmlAttrValue();
    }    
  };

  var NumberUtil = {
    printWith1Dec : function(n)
    {
      return Math.round(n * 10) / 10.0;
    },
    printWith2Dec : function(n)
    {
      return Math.round(n * 100) / 100.0;
    },
    printPercentWith1Dec : function(Total, Sub)
    {
      return NumberUtil.printWith1Dec(100.0 * ((Sub * 1.0) / (Total * 1.0)));
    },
    printPercentWith2Dec : function(Total, Sub)
    {
      return NumberUtil.printWith2Dec(100.0 * ((Sub * 1.0) / (Total * 1.0)));
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
    printWithThousands1Dec : function(n)
    {
      return n == null ? "N/A" : NumberUtil.printWith1Dec(n).toLocaleString();
    },
    printWithThousands2Dec : function(n)
    {
      return n == null ? "N/A" : NumberUtil.printWith2Dec(n).toLocaleString();
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
  return {
    "TextUtil" : TextUtil,
    "NumberUtil" : NumberUtil,
    "MetricUtil" : MetricUtil,
    "isNoE": TextUtil.isNullOrEmpty,
    "print": TextUtil.print
  };

});
