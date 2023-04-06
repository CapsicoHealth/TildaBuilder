"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Array extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { FloriaDOM } from "./module-dom.js";
import { FloriaText } from "./module-text.js";

if (!Array.prototype.randomElement)
  Array.prototype.randomElement = function()
  {
    return this[Math.floor((Math.random() * this.length))];
  }

if (!Array.prototype.indexOfSE)
  Array.prototype.indexOfSE = function(obj, field, throwMsg, index)
  {
    if (index == null)
     index = 0;
     
    if (field == null)
    {
      for (var i = index; i < this.length; i++)
        if (this[i] == obj)
          return i;
    }
    else
    {
      for (var i = index; i < this.length; i++)
        if (this[i][field] == obj)
          return i;
    }
    if (throwMsg != null)
      FloriaDOM.alertThrow(throwMsg);
    return -1;
  };


/**
 * Array.prototype.concatUnique
 * Adds the elements of Arr2 to this array unless they are already present. Returns a whole new Array just like
 * the plain concat(). Note that if this array includes duplicates, they will not get deduped.
 */
if (!Array.prototype.concatUnique)
 Array.prototype.concatUnique = function(Arr2)
  {
    if (Arr2 == null)
     return this.slice();

    var Arr = this.slice();
    for (var i = 0; i < Arr2.length; ++i)
     {
       var a = Arr2[i];
       if (Arr.indexOfSE(a) == false)
        Arr.push(a);
     }
    return Arr;
  };


if (!Array.prototype.getSE)
  Array.prototype.getSE = function(obj, field, throwMsg)
  {
    if (field == null)
    {
      for (var i = 0; i < this.length; i++)
        if (this[i] == obj)
          return this[i];
    }
    else
    {
      for (var i = 0; i < this.length; i++)
        if (this[i][field] == obj)
          return this[i];
    }
    if (throwMsg != null)
      FloriaDOM.alertThrow(throwMsg);
  };
  
//extract rows from Array (remove the rows) and returns the extracted elements, in order, in a new array.
  if (!Array.prototype.extractElements)
   Array.prototype.extractElements = function(obj, field, throwMsg)
    {
    var A = [];
      if (field == null)
       {
         for (var i = 0; i < this.length; i++)
          if (this[i] == obj)
           {
             A.push(this[i]);
             this.remove(i);
             --i;
           }
       }
      else
       {
         for (var i = 0; i < this.length; i++)
          if (this[i][field] == obj)
           {
             A.push(this[i]);
             this.remove(i);
             --i;
           }
       }
      return A;
    };


  //extract rows from Array and returns the extracted elements, in order, in a new array.
  if (!Array.prototype.allElements)
   Array.prototype.allElements = function(obj, field, throwMsg)
    {
      var A = [];
      if (field == null)
       {
         for (var i = 0; i < this.length; i++)
          if (this[i] == obj)
           A.push(this[i]);
       }
      else
       {
         for (var i = 0; i < this.length; i++)
          if (this[i][field] == obj)
           A.push(this[i]);
       }
      return A;
    };

    
if (!Array.prototype.addWrapped)
  Array.prototype.addWrapped = function(sourceArray, wrapSize, lastRowFillerObj)
   {
     var r = [];
     for (var i = 0; i < sourceArray.length; ++i)
       {
         r.push(sourceArray[i]);
         if (r.length % wrapSize == 0)
          {
            this.push(r);
            r = [ ];
          }
       }
     if (r.length != 0)
      {
        if (lastRowFillerObj != null)
         while (r.length % wrapSize != 0)
          r.push(lastRowFillerObj);
        this.push(r);
      }
   }
  
if (!Array.prototype.remove)
  Array.prototype.remove = function(i)
  {
    if (i < 0 || i >= this.length)
     return null;
    var old = this[i];
    this.splice(i, 1);
    return old;
  }
if (!Array.prototype.removeValue)
  Array.prototype.removeValue = function(val, field)
  {
    for (var i = 0; i < this.length; ++i)
     if (field == null && this[i] == val || field != null && this[i][field] == val)
      {
        this.splice(i, 1);
        return val;
      }
    return null;
  }

if (!Array.prototype.insertAt)
  Array.prototype.insertAt = function(pos, val)
   {
     this.splice(pos, 0, val);
   }

if (!Array.prototype.fill)
  Array.prototype.fill = function(val)
   {
     for (var i = 0; i < this.length; ++i)
      this[i]=val;
     return this;
   }


/**
 * A wrapper to a sorted String array. If an array is passed into the
 * constructor, it must be sorted asc.
 */
function SortedStringArray(A)
{
  this.A = A != null ? A : new Array();
  this.add = function(Str)
  {
    var i = this.A.indexOf(Str);
    if (i != -1)
      return false;
    for (var i = 0; i < this.A.length; ++i)
     if (this.A[i] > Str)
      {
        this.A.splice(i, 0, Str);
        return true;
      }
    this.A.push(Str);
    return true;
  };
  this.get = function(Str)
  {
    var i = this.A.indexOf(Str);
    return i == -1 ? null : Str;
  };
  this.remove = function(Element)
  {
    var i = this.A.indexOf(Element);
    if (i == -1)
      return null;
    var old = this.A[i][1];
    this.A.splice(i, 1);
    return old;
  };
  this.clear = function()
  {
    this.A = new Array();
  };
  this.toString = function()
  {
    return this.A.toString();
  }
}

/**
 * A wrapper to a sorted array of Objects. If an array is passed into the
 * constructor, it must be sorted (either asc or desc, it doesn't matter). If
 * not, you must sort right away.
 */
function SortedObjectArray(sortColumn, A)
{
  this.add = function(Element)
  {
    for (var i = 0; i < this.A.length; ++i)
      if (this.sortOrder == 1 && Element[this.sortColumn] <= this.A[i][this.sortColumn] || this.sortOrder == -1
          && Element[this.sortColumn] >= this.A[i][this.sortColumn])
      {
        this.A.splice(i, 0, Element);
        return true;
      }
    this.A.push(Element);
    return true;
  };
  this.getIteration = function(ColumnValue)
  {
    for (var i = 0; i < this.A.length; ++i)
      if (this.A[i]["" + this.sortColumn] == ColumnValue)
        return this.A[i];
    return null;
  };
  this.get = function(ColumnValue)
  {
    var i = 0;
    var j = this.A.length;
    while (i < j)
    {
      var m = ~~((i + j) / 2);
      var val = this.A[m]["" + this.sortColumn];
      if (ColumnValue > val)
        i = m + 1;
      else if (ColumnValue < val)
        j = m;
      else
        return ColumnValue == val ? this.A[m] : null;
    }
    return i < this.A.length && ColumnValue == this.A[i]["" + this.sortColumn] ? this.A[i] : null;
  };
  this.remove = function(ColumnValue)
  {
    for (var i = 0; i < this.A.length; ++i)
      if (this.A[i]["" + this.sortColumn] == ColumnValue)
      {
        var old = this.A[i][1];
        this.A.splice(i, 1);
        return old;
      }
    return null;
  };
  this.clear = function()
   {
     this.A = new Array();
   };
  this.toString = function(nonflat)
   {
     var Str = "";
     for (var i = 0; i < this.A.length; ++i)
     {
       var o = FloriaDOM.printObject(this.A[i]);
       if (nonflat != true)
       {
         o = FloriaText.TextUtil.replaceNewLinesWithCommas(o);
       }
       Str += o + "<BR>\n";
     }
     return Str;
   };
  this.setSortColumn = function(ColumnName)
   {
     if (ColumnName != null && ColumnName != this.sortColumn) // new sorting
      {
        this.sortColumn = "" + ColumnName;
        this.sortOrder = -1; // Next sort will reverse. We want to start asc.
        this.sort();
      }
     else
      {
        this.sort();
      }
   };
  this.sort = function(sortOrder)
   {
     this.sortOrder = sortOrder != null ? sortOrder : -this.sortOrder; // reverse
     // sort
     // order
     var SortColumn = this.sortColumn;
     var SortOrder = this.sortOrder;
     this.A.sort(function(a, b)
       {
         return SortOrder * FloriaDOM.compareValues(a[SortColumn], b[SortColumn]);
       });
     return SortOrder;
   };
  this.getSortOrder = function()
   {
     return FloriaDOM.compareValues(this.A[0][this.sortColumn], this.A[this.A.length - 1][this.sortColumn]) > 0 ? -1 : 1;
   }

  this.A = A != null ? A : new Array();
  this.setSortColumn(sortColumn);
}

/**
 * Maintains a sorted array of [n, v], where 'v' can be any object, and 'n' is a
 * case insensitive key
 */
function SortedObjectMap()
{
  this.A = new Array();
  this.put = function(n, v)
  {
    n = n.toLowerCase();
    if (this.A.length == 0)
      this.A[0] = [ n, v ];
    else
    {
      for (var i = 0; i < this.A.length; ++i)
      {
        if (n < this.A[i][0])
        {
          this.A.splice(i, 0, [ n, v ]);
          return;
        }
        if (n == this.A[i][0])
        {
          var old = this.A[i][1];
          this.A[i][1] = v
          return old;
        }
      }
      this.A.push([ n, v ]);
    }
    return null;
  };
  this.get = function(n)
  {
    n = n.toLowerCase();
    for (var i = 0; i < this.A.length; ++i)
    {
      if (this.A[i][0] == n)
        return this.A[i][1];
    }
    return null;
  };
  this.remove = function(n)
  {
    n = n.toLowerCase();
    for (var i = 0; i < this.A.length; ++i)
    {
      if (this.A[i][0] == n)
      {
        var old = this.A[i][1];
        this.A.splice(i, 1);
        return old
      }
    }
    return null;
  };
  this.toString = function(flat)
  {
    var Str = "";
    for (var i = 0; i < this.A.length; ++i)
    {
      var o = FloriaDOM.printObject(this.A[i][1]);
      if (flat === false)
        o = TextUtil.replaceNewLinesWithCommas(o);
      Str += this.A[i][0] + " -> " + o + "<BR>\n";
    }
    return Str;
  };
}

var ArrayAggs = {
  max: function(a, field)
   {
     if (a == null || a.length == 0)
      return 0;
     var max = a[0][field];
     for (var i = 1; i < a.length; ++i)
       {
         var v = a[i][field];
         if (max < v)
          max = v;
       }
     return max;
   }
 ,min: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     var min = a[0][field];
     for (var i = 1; i < a.length; ++i)
       {
         var v = a[i][field];
         if (min > v)
          min = v;
       }
     return min;
   }
 ,range: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     
     var min = a[0][field];
     var max = a[0][field];
     for (var i = 1; i < a.length; ++i)
      {
        var v = a[i][field];
        if (min > v)
         min = v;
        if (max < v)
         max = v;
      }
     return max-min;
   }
 ,rangeMid: function(a, field)
   {
      return ArrayAggs.range(a, field) / 2;
   }
 ,sum: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     var sum = 0;
     for (var i = 1; i < a.length; ++i)
      sum+=a[i][field];
     return sum;
   }
 ,average: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     return ArrayAggs.sum(a, field) / a.length;
   }
 ,median: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     a = a.slice(0);
     a.sort(function(x, y) { return x[field] > y[field] ? 1 : x[field] < y[field] ? -1 : 0; });
     var mid = a.length / 2;
     return mid % 1 ? a[mid - 0.5][field] : (a[mid - 1][field] + a[mid][field]) / 2;
   }
 ,variance: function(a, field)
   {
//     console.log("\n\n-------------------------------------------------------------------------------------------------------------------------------------");
     if (a == null || a.length == 0)
       return 0;
     var avg = ArrayAggs.average(a, field);
     var sum = 0;
     for (var i = 1; i < a.length; ++i)
       {
//         console.log("a[i][field]: ",a[i][field],"; avg: ",avg,"; a[i][field] - avg: ",a[i][field] - avg,"; Math.pow(a[i][field] - avg, 2): ",Math.pow(a[i][field] - avg, 2),";");
         sum+=Math.pow(a[i][field] - avg, 2);
       }
//     console.log("sum/a.length: ", sum/a.length);
     return sum/a.length;
   }
 ,standardDeviation: function(a, field)
   {
     if (a == null || a.length == 0)
       return 0;
     return Math.sqrt(ArrayAggs.variance(a, field));
   }
 ,sumArrayLengths: function()
   {
     var sum = 0;
     for (var i = 0; i < arguments.length; i++)
      if (arguments[i] != null && Array.isArray(arguments[i]) == true)
       sum+=arguments[i].length;
     return sum;
   }
};


export var FloriaCollections = { "SortedStringArray": SortedStringArray
                               , "SortedObjectArray": SortedObjectArray
                               , "SortedObjectMap": SortedObjectMap
                               , "ArrayAggs": ArrayAggs
                               };

