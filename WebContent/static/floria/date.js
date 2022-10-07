"use strict";

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Date extensions
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define(["floria/textutil"], function(FloriaText)
{
  Date.prototype.adjustToLocalTime = function()
  {
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

  Date.prototype.getAge = function()
  {
    var today = new Date();
    var age = today.getFullYear() - this.getFullYear();
    // compare month and day to check if birthday has happened already. If not,
    // substract 1. to age.
    if (today.getMonth() < this.getMonth() || today.getMonth() == this.getMonth() && today.getDate() < this.getDate())
      --age;
    return age;
  }

  Date.prototype.diffDays = function(laterDate)
  {
    var d = Math.floor((laterDate - this) / (1000 * 60 * 60 * 24));
    if (this.getDate() != laterDate.getDate())
      ++d;
    return d;
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
    var x = (this.getTime() - someDate.getTime()) / 60000;
    return -1 < x && x < 1 && this.getDate() == someDate.getDate() ? 0 : x > 0 ? (x > 1 ? Math.ceil(x) : 1) : (x < -1 ? Math.ceil(x) : -1);
  };

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

  Date.prototype.printYearQuarter = function()
  {
    return this.getFullYear() + "/Q" + Math.floor(this.getMonth()/3+1);
  };

  Date.prototype.printShortInTZ = function(PrintTime, PrintTimezone)
  {
    return this.adjustFromLocalTime().__printShort(PrintTime, true);
  };
  
  Date.prototype.__printShort = function(PrintTime, Timezone)
  {
    return this.DATE_MONTHS[this.getMonth()] + "/" + this.getDate() + "/" + this.getFullYear()
        + (PrintTime == true ? " " + this.print24hTime(Timezone) : "");
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

  return {
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
        var tzm = DateTimeStr.substring(26, 28);

        var d = new Date(yea, mon - 1, day, hou, min, sec, mil);
        // alert("DateTimeStr:
        // "+DateTimeStr+";\nyea:"+yea+"\nmon:"+(mon-1)+"\nday:"+day+"\nhou:"+hou+"\nmin:"+min+"\nsec:"+sec+"\nmil:"+mil+"\n--->"+d);
        d._timezone = {
          str : tzp + tzh + tzm,
          h : tzp == '+' ? +tzh : -tzh,
          m : tzp == '+' ? +tzm : -tzm
        };
        d.adjustToLocalTime();
      }
//      console.log(DateTimeStr+" -> "+d+" -> "+d.printContextual()+"\n     "+SuperDOM.printObject(d));
      return d;
    }
  }

});
