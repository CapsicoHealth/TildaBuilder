"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Array extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/textutil", "floria/superdom"], function(FloriaText, SuperDOM)
{
if (!Array.prototype.randomElement)
  Array.prototype.randomElement = function()
  {
    return this[Math.floor((Math.random() * this.length))];
  }

if (!Array.prototype.indexOfSE)
  Array.prototype.indexOfSE = function(obj, field, throwMsg)
  {
    if (field == null)
    {
      for (var i = 0; i < this.length; i++)
        if (this[i] == obj)
          return i;
    }
    else
    {
      for (var i = 0; i < this.length; i++)
        if (this[i][field] == obj)
          return i;
    }
    if (throwMsg != null)
      SuperDOM.alertThrow(throwMsg);
    return -1;
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
      SuperDOM.alertThrow(throwMsg);
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
       var o = SuperDOM.printObject(this.A[i]);
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
     if (ColumnName != null && ColumnName != this.sortColumn) // new
     // sorting
     {
       this.sortColumn = "" + ColumnName;
       this.sortOrder = -1; // Next sort will reverse. We want to start
       // asc.
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
         return SortOrder * SuperDOM.compareValues(a[SortColumn], b[SortColumn]);
       });
     return SortOrder;
   };
  this.getSortOrder = function()
   {
     return SuperDOM.compareValues(this.A[0][this.sortColumn], this.A[this.A.length - 1][this.sortColumn]) > 0 ? -1 : 1;
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
      var o = SuperDOM.printObject(this.A[i][1]);
      if (flat === false)
        o = TextUtil.replaceNewLinesWithCommas(o);
      Str += this.A[i][0] + " -> " + o + "<BR>\n";
    }
    return Str;
  };
}

return { "SortedStringArray": SortedStringArray, "SortedObjectArray": SortedObjectArray, "SortedObjectMap": SortedObjectMap };

});