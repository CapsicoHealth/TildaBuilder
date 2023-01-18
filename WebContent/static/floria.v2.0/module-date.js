"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Date extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { FloriaText } from "./module-text.js";

  Date.prototype.clone = function()
   {
     var d = new Date(this.getTime());
     d._timezone = this._timezone;
     return d;
   }
  
  Date.prototype.adjustToLocalTime = function()
  {
    if (this._timezone == null)
     return;
    var coh = this.getTimezoneOffset() / 60 + this._timezone.h;
    var com = this.getTimezoneOffset() % 60 + this._timezone.m;
    this.setHours(this.getHours() - coh);
    this.setMinutes(this.getMinutes() - com);
  }

  Date.prototype.adjustFromLocalTime = function()
  {
    if (this._timezone == null)
      return this;
    var d = new Date(this);
    d._timezone = this._timezone;
    var coh = d.getTimezoneOffset() / 60 + d._timezone.h;
    var com = d.getTimezoneOffset() % 60 + d._timezone.m;
    d.setHours(d.getHours() + coh);
    d.setMinutes(d.getMinutes() + com);
    return d;
  }

  Date.prototype.getAge = function(toDate)
  {
    if (toDate == null)
      toDate = new Date();
    var age = toDate.getFullYear() - this.getFullYear();
    // compare month and day to check if birthday has happened already. If not,
    // substract 1. to age.
    if (toDate.getMonth() < this.getMonth() || toDate.getMonth() == this.getMonth() && toDate.getDate() < this.getDate())
      --age;
    return age;
  }
  
  Date.prototype.getQuarter = function()
   {
     var m = this.getMonth();
     return m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4;
   }

  /**
   * Returns the number of hours (with decimal) between this date and otherDate. If otherDate is
   * after this date, the value returned will be positive. If it's before, the value
   * will be negative:
   */
  Date.prototype.diffHours = function(otherDate)
   {
     return Math.round((otherDate - this) / (1000 * 60 * 60));
   }

  /**
   * Returns the number of days between this date and otherDate. If otherDate is
   * after this date, the value returned will be positive. If it's before, the value
   * will be negative:
   *    var d = new Date('November 1 2019 00:00:00');
   *    var v1 = d.diffDays(new Date('October 31, 2019 00:00:00')); -> -1
   *    var v2 = d.diffDays(new Date('November 1, 2019 00:00:00')); -> 0
   *    var v3 = d.diffDays(new Date('November 2, 2019 00:00:00')); -> +1
   */
  Date.prototype.diffDays = function(otherDate)
   {
     var d0 = new Date(otherDate.getTime());
     d0.setHours(0,0,0,0);
     var d1 = new Date(this.getTime());
     d1.setHours(0,0,0,0);
     return Math.round((d0 - d1) / (1000 * 60 * 60 * 24)); // must be round to handle daylight saving time changes.
   }
  Date.prototype.diffMonths = function(laterDate)
   {
     return (laterDate.getFullYear()-this.getFullYear())*12+(laterDate.getMonth()-this.getMonth());
   }
  Date.prototype.diffQuarters = function(laterDate)
   {
     return (laterDate.getFullYear()-this.getFullYear())*4+(laterDate.getQuarter()-this.getQuarter());
   }

  Date.prototype.getDayOfYear = function()
  {
    return Math.ceil((this - new Date(this.getFullYear(), 0, 1)) / 86400000);
  };

  Date.prototype.getDaysSince = function(someDate)
  {
    var x = (this.getTime() - someDate.getTime()) / 86400000;
    return -1 < x && x < 1 && this.getDate() == someDate.getDate() ? 0 : x > 0 ? (x > 1 ? Math.ceil(x) : 1) : (x < -1 ? Math.ceil(x) : -1);
  };

  Date.prototype.getHoursSince = function(someDate)
  {
    var x = (this.getTime() - someDate.getTime()) / 3600000;
    return -1 < x && x < 1 && this.getDate() == someDate.getDate() ? 0 : x > 0 ? (x > 1 ? Math.ceil(x) : 1) : (x < -1 ? Math.ceil(x) : -1);
  };

  Date.prototype.getMinutesSince = function(someDate)
  {
    var x = (this.getTime() - someDate.getTime()) / (60*1000);
    return -1 < x && x < 1 && this.getDate() == someDate.getDate() ? 0 : x > 0 ? (x > 1 ? Math.ceil(x) : 1) : (x < -1 ? Math.ceil(x) : -1);
  };

  Date.prototype.getSecondsSince = function(someDate)
  {
    var x = (this.getTime() - someDate.getTime()) / (60*60*1000);
    return -1 < x && x < 1 && this.getDate() == someDate.getDate() ? 0 : x > 0 ? (x > 1 ? Math.ceil(x) : 1) : (x < -1 ? Math.ceil(x) : -1);
  };
  
  Date.prototype.printDuration = function(someDate)
      {
        var ms = this.getTime() - someDate.getTime();
        
        var h = Math.floor(ms / (60 * 60 * 1000.0));
        ms -= h * 60 * 60 * 1000;
        var mn = Math.floor(ms / (60 * 1000.0));
        ms -= mn * 60 * 1000;
        var s = Math.floor(ms / 1000.0);
        
        var str = "";
        if (h  != 0 || str.length != 0) str+=(str.length != 0 ? " " : "")+h+"h";
        if (mn != 0 || str.length != 0) str+=(str.length != 0 ? " " : "")+mn+"mn";
        if (s  != 0 || str.length != 0) str+=(str.length != 0 ? " " : "")+s+"s";

        return str;
      }
  

  Date.prototype.addHours = function(h)
  {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
  };  

  Date.prototype.roundDownHour = function(h)
  {
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
  };

  Date.prototype.addDays = function(d)
  {
    this.setDate(this.getDate() + d);
    return this;
  };

  Date.prototype.roundDownDay = function(h)
  {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
  };

  Date.prototype.DATE_MONTHS = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
  Date.prototype.DATE_DAYS = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');

  Date.prototype.printDayWithTH = function()
  {
    var d = this.getDate();
    return d + "<SUP style='font-size:60%;'>" + (d == 1 || d == 21 ? "st" : d == 2 || d == 22 ? "nd" : d == 3 || d == 23 ? "rd" : "th")
        + "</SUP>";
  };

  Date.prototype.print24hTime = function(Timezone)
  {
    return (this.getHours() < 10 ? "0" : "") + this.getHours() + ":" + (this.getMinutes() < 10 ? "0" : "") + this.getMinutes()
        + (Timezone == true && this._timezone != null ? " (" + this._timezone.str + ")" : "");
  };

  Date.prototype.printShort = function(PrintTime)
  {
    return this.__printShort(PrintTime, false);
  };
  
  Date.prototype.printYearMonth = function(month)
  {
    var m = this.getMonth();
    return this.getFullYear() + "/" + (month == true ? this.DATE_MONTHS[m] : m < 9 ? "0"+(m+1) : (m+1));
  };
  
  Date.prototype.printMonth = function()
  {
    return this.DATE_MONTHS[this.getMonth()];
  };
  
  
  Date.prototype.printMonthDay = function(month)
  {
    var m = this.getMonth()+1;
    var d = this.getDate();
    return (m < 10 ? "0"+m : m) + "/" + (d < 10 ? "0"+d : d);
  };
  

  Date.prototype.printYYYYMMDD = function()
  {
    var m = this.getMonth()+1;
    var d = this.getDate();
    return this.getFullYear() + "/" + (m < 10 ? "0"+m : m) + "/" + (d < 10 ? "0"+d : d);
  };

  Date.prototype.printYearQuarter = function()
  {
    return this.getFullYear() + "/Q" + Math.floor(this.getMonth()/3+1);
  };

  Date.prototype.printShortInTZ = function(PrintTime, PrintTimezone, PrintYear)
  {
    return this.adjustFromLocalTime().__printShort(PrintTime, PrintTimezone, PrintYear);
  };
  
  Date.prototype.__printShort = function(PrintTime, PrintTimezone, PrintYear)
  {
    return this.DATE_MONTHS[this.getMonth()] + "/" + this.getDate() + (PrintYear == false ? "" : "/" + this.getFullYear())
        + (PrintTime == true ? " " + this.print24hTime(PrintTimezone) : "");
  };

  Date.prototype.printFriendly = function(PrintYear, PrintTime)
  {
    return this.__printFriendly(PrintYear, PrintTime, false);
  };
  
  Date.prototype.printFriendlyInTZ = function(PrintYear, PrintTime)
  {
    return this.adjustFromLocalTime().__printFriendly(PrintYear, PrintTime, true);
  };
  
  Date.prototype.__printFriendly = function(PrintYear, PrintTime, Timezone)
  {
    return this.DATE_DAYS[this.getDay()] + ", " + this.DATE_MONTHS[this.getMonth()] + " " + this.printDayWithTH()
        + (PrintYear == true ? " " + this.getFullYear() : "") + (PrintTime == true ? ", at " + this.print24hTime(Timezone) : "");
  };

  Date.prototype.print = function() // "2010.10.06_01.50.56.123+0400"
  {
    var d = this.adjustFromLocalTime();
    return d.getFullYear() + "." + (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1) + "." + (d.getDate() < 10 ? "0" : "") + d.getDate()
        + "_" + (d.getHours() < 10 ? "0" : "") + d.getHours() + "." + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + "."
        + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds() + "."
        + (d.getMilliseconds() >= 100 ? "" : d.getMilliseconds() >= 10 ? "0" : "00") + d.getMilliseconds()
        + (d._timezone ? d._timezone.str : "");
  };

  Date.prototype.printContextual = function()
  {
    return this.__printContextual(false);
  }
  
  Date.prototype.printContextualInTZ = function()
  {
    return this.adjustFromLocalTime().__printContextual(true);
  }
  
  Date.prototype.__printContextual = function(xxx)
  {
    var today = new Date();
    if (xxx == true)
    {
      today._timezone = this._timezone;
      today = today.adjustFromLocalTime();
    }

    var Days = this.getDaysSince(today);

    if (Days == 0) // today
    {
      var Minutes = today.getMinutesSince(this);
      if (Minutes < 10)
        return "moments ago";
      if (Minutes < 60)
        return Minutes + " minutes ago";
      var Hours = today.getHoursSince(this);
      if (Hours < 4)
        return Hours + " hours ago";
      return "at " + this.print24hTime(xxx) + " today";
    }

    if (Days > -8 && Days < -1) // last week
      return "last " + this.DATE_DAYS[this.getDay()] + " (" + this.printDayWithTH() + ") at " + this.print24hTime(xxx);
    if (Days == -1) // yesterday
      return "at " + this.print24hTime(xxx) + " yesterday";
    if (Days == 1) // tomorrow
      return "at " + this.print24hTime(xxx) + " tomorrow";
    if (Days > 1 && Days < 8) // this week
      return "this " + this.DATE_DAYS[this.getDay()] + " (" + this.printDayWithTH() + ") at " + this.print24hTime(xxx);
    return "on " + xxx == true ? this.printFriendlyInTZ(true, true) : this.printFriendly(true, true);
  }

  /**
   * Adds/substract randomly between minDays and maxDays number of days to this
   * date and sets the hours within the range prescribed (min/maxHour).
   */
  Date.prototype.addRandomDeltaDays = function(minDays, maxDays, minHour, maxHour)
  {
    var days = Math.floor((Math.random() * (maxDays - minDays)) + minDays);
    var hours = Math.floor((Math.random() * (maxHour - minHour)) + minHour);
    var minutes = Math.floor((Math.random() * 60));
    this.setDate(this.getDate() + days);
    this.setHours(hours);
    this.setMinutes(minutes);
    return this;
  }

  /**
   * Adds/substract randomly between minDays and maxDays number of days to this
   * date and sets the hours within the range prescribed (min/maxHours).
   */
  Date.prototype.addRandomDeltaHours = function(minHours, maxHours)
  {
    var hours = Math.floor((Math.random() * (maxHours - minHours)) + minHours);
    var minutes = Math.floor((Math.random() * 60));
    this.setHours(this.getHours() + hours);
    this.setMinutes(minutes);
    return this;
  }


export var FloriaDate = {
    /**
     * Takes a date time string as 'YYYY.MM.DD HH.MM.SS.mmmZ' where the separator
     * characters don't matter.
     * 
     * @param DateTimeStr
     * @returns {Date}
     */
    parseDateTime : function(DateTimeStr)
    {
      if (FloriaText.TextUtil.isNullOrEmpty(DateTimeStr) == true)
        return null;
      var i = DateTimeStr.indexOf('[');
      if (i != -1)
      {
        d = new Date(DateTimeStr.substring(0, i));
        var offset = d.getTimezoneOffset();
        var pom = offset >= 0 ? '+' : '-';
        if (offset < 0)
          offset = -offset;
        var h = offset / 60;
        var m = offset % 60;
        d._timezone = {
          str : pom + (h < 10 ? "0" : "") + h + ':' + (m < 10 ? "0" : "") + m,
          h : h,
          m : m
        };
      }
      else
      {
        var yea = DateTimeStr.substring(0, 4);
        var mon = DateTimeStr.substring(5, 7);
        var day = DateTimeStr.substring(8, 10);
        var hou = DateTimeStr.substring(11, 13);
        var min = DateTimeStr.substring(14, 16);
        var sec = DateTimeStr.substring(17, 19);
        var mil = DateTimeStr.substring(20, 23);
        var tzp = DateTimeStr.charAt(23);
        var tzh = DateTimeStr.substring(24, 26);
        var semicolon = DateTimeStr.charAt(26)==':'?1:0;
        var tzm = DateTimeStr.substring(26+semicolon, 28+semicolon);

        var d = new Date(yea, mon - 1, day, hou, min, sec, mil);
        var x = tzp + tzh + tzm;
        // alert("DateTimeStr: "+DateTimeStr+";\nyea:"+yea+"\nmon:"+(mon-1)+"\nday:"+day+"\nhou:"+hou+"\nmin:"+min+"\nsec:"+sec+"\nmil:"+mil+"\n--->"+d);
        if (FloriaText.isNoE(x) == false)
         {
           d._timezone = { str : x,
                             h : tzp == '+' ? +tzh : -tzh,
                             m : tzp == '+' ? +tzm : -tzm
                         };
           d.adjustToLocalTime();
        }
       else 
        d._timezone = null;
      }
      return d;
    },
    printYYYYMMDD: function(DateTimeStr)
     {
       if (DateTimeStr != null)
         DateTimeStr = this.parseDateTime(DateTimeStr);
       if (DateTimeStr != null)
         DateTimeStr = DateTimeStr.printYYYYMMDD();
       return DateTimeStr;
     }
   ,toDtStr: function(d, friendly)
     {
       if (d != null && typeof d == "string")
        d = FloriaDate.parseDateTime(d);
       if (d != null && d instanceof Date)
        d = friendly == true ? d.printFriendly(true,false) : d.printYYYYMMDD();
       return d;
     }
  }

