"use strict";

import { FloriaDOM } from "./module-dom.js";
import { FloriaText } from "./module-text.js";
import { DojoSimple } from "./module-dojosimple.js";


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Base Factory infrastructure
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
function FactoryRegistry(baseTypeName, funcNames)
{
  if (baseTypeName == null)
    FloriaDOM.alertThrow("FactoryRegistry instanciated with baseTypeName=null");
  if (funcNames == null)
   funcNames = [];

  funcNames.push("init");
  
  this._componentRegistry        = { };
  this._componentPackageRegistry = { };
  this._baseTypeName = baseTypeName;
  this._mandatoryFuncNames = funcNames;

  this.register = function(typeName, defaultParams, constructorFunc, takeOverPackageName)
    {
      if (defaultParams == null)
        defaultParams = { };
      if (FloriaText.TextUtil.isNullOrEmpty(typeName) == true)
        FloriaDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"' called with a null typeName");
      if (constructorFunc == null)
        FloriaDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"."+typeName+"'' called with a null constructorFunc");

      var packageName = "DEFAULT";
      var parts = typeName.split(/\./);
      if (parts.length < 1 || parts.length > 2)
       FloriaDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"' called with an invalid typeName '"+typeName+"'. Must be '(<packageName>.)?<componentName>'.");
      else if (parts.length == 2)  
       {
         packageName = parts[0];
         typeName = parts[1];
       }
      console.log("Registering "+this._baseTypeName+" component '"+packageName+"."+typeName+"'"+(takeOverPackageName==null?"":" overriding '"+takeOverPackageName+"."+typeName+"'."));
      
      var componentPackage = this._componentPackageRegistry[packageName+"."+typeName];
      if (componentPackage != null)
       FloriaDOM.alertThrow("System error: the " + this._baseTypeName + " '" + typeName + "' is being registered more than once in package "+packageName+".");
      
      var component = this._componentRegistry[typeName];
      if (component != null && component._packageName != takeOverPackageName)
       FloriaDOM.alertThrow("System error: the " + this._baseTypeName + " '" + typeName + "' is being registered in package "+packageName+" with a duplicate previously registed in "+component._packageName+" and no valid override specification '"+takeOverPackageName+"'.");
     
      this._componentRegistry[typeName] = this._componentPackageRegistry[packageName+"."+typeName] = {_packageName: packageName, _typeName: typeName, _constructor: constructorFunc, _overridenComponent: component, _defaultParams: defaultParams};
      var cla = new constructorFunc();
      var Str = "";
      for (var i = 0; i < this._mandatoryFuncNames.length; ++i)
        {
          if (cla[this._mandatoryFuncNames[i]] == null)
          {
            if (Str.length != 0)
              Str += ", "
            Str += this._mandatoryFuncNames[i] + "()";
          }
        }
      if (Str.length != 0)
        FloriaDOM.alertThrow("System error: the class for '" + this._baseTypeName+"."+typeName + "' is missing mandatory methods " + Str + ".");
    };

  this.getInstance = function(componentDef, allowPackageOverride)
    {
      if (typeof componentDef == "string" || componentDef instanceof String == true)
       componentDef = { name: componentDef, params: { } };
    
      var ObjDef = allowPackageOverride == true ? this._componentPackageRegistry[componentDef.name] : null;
      if (ObjDef == null)
       {
         console.log("Getting a new instance of "+this._baseTypeName+" component '"+componentDef.name+"'.");
         ObjDef = this._componentRegistry[componentDef.name];
         if (ObjDef == null)
          {
            console.log("Cannot find "+this._baseTypeName+" component '"+componentDef.name+"'.");
            return null;
          }
       }
      else
       console.log("Getting a new instance of overriden component '"+componentDef.name + "'.");
        
      console.log("   -> Got '"+ObjDef._packageName+"."+ObjDef._typeName+"'.");
      var Obj = new ObjDef._constructor();
      var dataDef = [];
      try {
        if (Obj.init != null) 
         dataDef = Obj.init(FloriaDOM.mergeProperies(ObjDef._defaultParams, componentDef.params));
      } catch(e) { console.error(e); return null; }
      
      return {
        _obj     : Obj,
        _packageName: ObjDef._packageName,
        _typeName: componentDef.name,
        _dataDef : dataDef == null ? [ ] : dataDef
      };
  };
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Fetchers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var DataFetcherRegistry = new FactoryRegistry("DataFetcher", ["getData"]);

function FetcherList()
 {
   this._Callbacks = [];
   this._Fetchers  = [];
   this.clean = function()
    {
      this._Callbacks = [];
      var executed = 0;
      this._Fetchers.forEach(function(e){ if (e.executed == true) ++ executed; });
      if (executed == 0)
       {
         var Str = "";
         this._Fetchers.forEach(function(e){ Str+="**   - "+e.name+"\n"; });
         console.warn("FetcherList.clean\n"
                     +"*********************************************************************************************************\n"
                     +"** WARNING!!!\n"
                     +"** Wiping fetchers from a prior list that has never been executed. You may be running multiple sets of\n"
                     +"** fetchers concurrently and calling DataFetcherRegistry.clean() before or during async runs.\n"
                     +Str
                     +"*********************************************************************************************************\n"
                     );
         console.trace();
       }
      this._Fetchers  = [];
    };
   this.getFetcher = function(name, sig)
    {
      if (typeof name == "string")
       return this._Fetchers.getSE(name+'``'+sig, "__key");
      return this._Fetchers[name]; // It's a number, i.e., an index.
    };
   this.getFetcherCount = function()
    {
      return this._Fetchers.length;
    };
   this.removeFetcher = function(name, sig)
    {
      return this._Fetchers.remove(this._Fetchers.indexOfSE(name+'``'+sig, "__key"));
    };
   this.addFetcher = function(fetcher)
    {
      if (fetcher.instance == null)
       FloriaDOM.alertThrow("Cannot find DataFetcher '"+fetcher.name+"'.");

//      console.log("adding fetcher ",fetcher, ", ", _Fetchers);
      var pos = 99999;
      if (fetcher.instance._dataDef != null && fetcher.instance._dataDef.length != 0)
       {
         DataFetcherRegistry.addFetchers(fetcher.instance._dataDef, null, "Composition Callback", true);
         for (var i = 0; i < fetcher.instance._dataDef.length; ++i)
          {
            var dependencyName = fetcher.instance._dataDef[i].name;
            for (var j = 0; j < this._Fetchers.length; ++j)
             if (this._Fetchers[j].name == dependencyName && j < pos)
              pos = j;
          }
       }
      fetcher.__key = fetcher.name+'``'+fetcher.sig;
      if (pos >= this._Fetchers.length)
        this._Fetchers.push(fetcher);
      else
        this._Fetchers.splice(pos+1, 0, fetcher);
//      console.log("added. ", _Fetchers);
      return fetcher;
    };
   this.printFetcherList = function()
    {
      var Str = "";
      for(var i = 0; i < this._Fetchers.length; ++i)
       {
         var f = this._Fetchers[i];
         if (f == null)
           throw "printFetcherList>>  Null fetcher '_Fetchers["+i+"].";
         Str+="   "+f.instance._packageName+"."+f.instance._typeName;
         if (f.instance._obj.getDescription != null)
          Str+=" ("+f.instance._obj.getDescription()+")";
         Str+="\n";
       }
      return Str;
    };
   this.getCallbackCount = function()
    {
      return this._Callbacks.length;
    };
   this.getCallback = function(index)
    {
      return this._Callbacks[index];
    };
   this.addCallback = function(callbackDef)
    {
      this._Callbacks.push(callbackDef);
    };
   this.stashCallbacks = function()
    {
      this._stachedCallbacks = this._Callbacks;
      this._Callbacks = [];
    };
   this.unstashCallbacks = function()
    {
      this._Callbacks = this._stachedCallbacks;
      this._stachedCallbacks = null;
    };
 }
var _FL = new FetcherList();


function createParamList(params, fetcherDefs)
 {
   var Str = "";
   if (fetcherDefs != null)
    for (var j = 0; j < fetcherDefs.length; ++j)
     {
       if (j != 0)
        Str+=", ";
       var f = fetcherDefs[j];
       if (f == null)
        throw "createParamList>> fetcherDefs["+j+"].";
       Str+=f.name;
       f = _FL.getFetcher(f.name, f.sig!=null?f.sig:JSON.stringify(f.params));
       params.push(f==null?null:f.result); // Where did the fetcher go?!?
     }
   
   return { params: params, str: Str };
 }

DataFetcherRegistry.clean = function()
 {
   _FL.clean();
 };

DataFetcherRegistry.consoleFL = function()
 {
   console.log("_FL: ", JSON.parse(JSON.stringify(_FL)));
 };


DataFetcherRegistry.addFetchers = function(fetcherDefs, callback, callbackName, allowPackageOverride, statusUpdateCallbackFunc)
 {
//   var Str = ", ";
//   if (fetcherDefs != null)
//    fetcherDefs.forEach(function(e) { Str+=", "+e.name });
//   Str = Str.substring(2);
//   console.log("DataFetcherRegistry.addFetchers START: "+Str, fetcherDefs);

   var callbackDef = { callback: callback, callbackName: callbackName, fetchers: [ ] };
   _FL.addCallback(callbackDef);

   if (fetcherDefs != null)
    {
      for (var i = 0; i < fetcherDefs.length; ++i)
       {
         var d = fetcherDefs[i];
         if (d == null)
          continue;
         var newSig = JSON.stringify(d.params);
         var existingFetcher = _FL.getFetcher(d.name, newSig);

         console.log("fetcherName: "+d.name+"; existingFetcher: "+existingFetcher+";\nexistingFetcher.sig: "+(existingFetcher==null?null:existingFetcher.sig)+";\nnewSig: "+newSig+";");
         if (existingFetcher == null) // || newSig != existingFetcher.sig)
           {
             // addFetcher will throw if a data fetcher cannot be found or load (generally, parameters).
             try {
               existingFetcher = _FL.addFetcher({name: d.name, instance: DataFetcherRegistry.getInstance(d, allowPackageOverride), result: null, executed: false, optional: d.optional, statusUpdateCallbackFunc: statusUpdateCallbackFunc, sig: newSig });
               console.log("Created a new fetcher '"+existingFetcher.__key+"'.");
              }
             catch (e) {console.error(e); return null; };
           }
         else
           {
             console.log("Reusing existing fetcher'"+existingFetcher.__key+"'.");
           }
         callbackDef.fetchers.push(existingFetcher);
       }
    }

//   console.log("DataFetcherRegistry.addFetchers END: "+Str, _FL);
   return true;
 };

function saveFetcherResults(data, errorMsg, errorType, fetcher, cached)
 {
//    console.log("Saving results from DataFetcher '"+fetcher.name+"': '"+fetcher.sig+".");
//    console.log("             "+FloriaDOM.printObject(data).substring(0,500).replace(/\n/g, "\n             "));
    var f = _FL.getFetcher(fetcher.name, fetcher.sig);
    if (f == null)
      {
        console.error("saveFetcherResults>> Null fetcher '"+fetcher.name+"'. It is likely DataFetcherRegistry.clean() was called during asynchronous fetcher runs.");
//        console.log("_FL: ", _FL);
        return;
      }      

    if (cached != true)
     {
        if (f.instance._typeName.startsWith(f.instance._packageName) == true)
         console.log("DataFetcher '"+f.instance._typeName+"': overriden, saving results.");
        else
         console.log("DataFetcher '"+f.instance._packageName+"."+f.instance._typeName+"': saving results.");
     }
    f.result = data;
    f.errorMsg = errorMsg;
    f.errorType = errorType;
    f.executing = false;
    f.executed = true;    
    if (data == null)
     {
       console.log("DataFetcher '"+f.instance._typeName+"': returned null with errMsg '"+errorMsg+"' and errorType '"+errorType+"'.");
       if (errorMsg != null && f.optional != true)
         alert(errorMsg);
     }
    return f;
 }

function createNestedFunc(fetcher, prevFetcher, previousFunc)
 {
   return function(data, errorMsg, errorType, cached)
     {
       if (prevFetcher != null && prevFetcher.name != null)
        saveFetcherResults(data, errorMsg, errorType, prevFetcher, cached);

//       if (fetcher.executingCount % 10 == 0)
//        console.log("createNestedFunc.anonymous() >> fetcher="+fetcher.name+"; errorMsg="+errorMsg+"; executingCount="+fetcher.executingCount);
       if (fetcher.executing == true)
        {
          ++fetcher.executingCount;
          if (fetcher.executingCount > 480) // 2mn
           {
             console.error("DataFetcher '"+fetcher.instance._typeName+"' has failed or has not returned within 2 minutes.");
             return;
           }
          if (fetcher.executingCount % 10 == 0)
           console.log("DataFetcher '"+fetcher.instance._typeName+"': is currently executing. Waiting (count="+fetcher.executingCount+")...");
          setTimeout(function() { createNestedFunc(fetcher, prevFetcher, previousFunc)(data, errorMsg, errorType); }, 250);
          return;
        }
       else if (fetcher.executing == null)
        {
          var Params = createParamList([previousFunc], fetcher.instance._dataDef);
          if (fetcher.instance._typeName.startsWith(fetcher.instance._packageName) == true)
           console.log("DataFetcher '"+fetcher.instance._typeName+"': overriden, getData("+Params.str+").");
          else
           console.log("DataFetcher '"+fetcher.instance._packageName+"."+fetcher.instance._typeName+"': getData("+Params.str+").");
          fetcher.executing = true;
          fetcher.executingCount = 1;
          try { 
                 fetcher.instance._obj.getData.apply(fetcher.instance._obj, Params.params);
                 if (fetcher.instance._obj.setupStatusUpdate != null && fetcher.statusUpdateCallbackFunc != null)
                  fetcher.instance._obj.setupStatusUpdate(fetcher.statusUpdateCallbackFunc);
              } 
          catch (e) { console.error(e); }
        }
       else
         {
           console.log("DataFetcher '"+fetcher.instance._packageName+"."+fetcher.instance._typeName+"': taking cached value"/*, fetcher.result*/);
           previousFunc(fetcher.result, fetcher.errorMsg, fetcher.errorType, true);
         }
     }
 }

DataFetcherRegistry.runAll = function(finalCallback)
 {
   console.log("RPJ: Fetchers Count: %s before runAll", _FL.getFetcherCount());
   
   console.log("\n\n------------------------------------------------------------------------------------\nDataFetcherRegistry.runAll\n"+_FL.printFetcherList());
   if (_FL.getFetcherCount() == 0)
    return finalCallback != null ? finalCallback() : null;

//   console.log("DataFetcherRegistry.runAll() >> creating f(): Fetcher list\n"+_FL.printFetcherList());
   var lastFetcher = _FL.getFetcher(_FL.getFetcherCount()-1);
   var f = function(data, errorMsg, errorType, cached)
     { 
//       console.log("DataFetcherRegistry.runAll.f() >> Fetcher list\n"+_FL.printFetcherList());
//       console.log("DataFetcherRegistry.runAll.f() >> Fetcher "+lastFetcher.name+": "+errorMsg);
       saveFetcherResults(data, errorMsg, errorType, lastFetcher, cached);
       console.log("Running all callbacks.");
       for (var i = 0; i < _FL.getCallbackCount(); ++i)
        {
          var callbackDef = _FL.getCallback(i);
          if (callbackDef == null || callbackDef.callback == null)
           continue;
          var Params = createParamList([], callbackDef.fetchers);
          console.log("Invoking the callback '"+callbackDef.callbackName+"' with "+Params.str+".");
          try { callbackDef.callback.apply(null, Params.params); } catch (e) { console.error(e); }
        }
       console.log("Running finalCallback (in DataFetcherRegistry.runAll.f()).");
       if (finalCallback != null)
        finalCallback();
       _FL._Callbacks = [ ];
       
       console.log("RPJ: Fetchers Count: %s after runAll", _FL.getFetcherCount());       
     };
     
    for(var i = _FL.getFetcherCount()-1; i >= 0; --i)
     {
       var fetcher = _FL.getFetcher(i);
       var prevFetcher = i == 0 ? { name: null, optional: null } : _FL.getFetcher(i-1);
       f = createNestedFunc(fetcher, prevFetcher, f);
       if (f == null)
         throw "DataFetcherRegistry>> WHUUUT???";
       
     }
   if (f != null)
    setTimeout(f, 1);
 }

var lastAddAndRunFetchers = null;
DataFetcherRegistry.addAndRunFetchers = function(fetcherDefs, callback, callbackName)
  {
//    console.log("DataFetcherRegistry.addFetchers (and run) START: ", fetcherDefs, _FL);
    if (FloriaText.isNoE(callbackName) == true)
      callbackName = "UNKNOWN";
    if (lastAddAndRunFetchers != null)
       console.error("Two DataFetcherRegistry.addAndRunFetchers ('"+callbackName+"' and previously '"+lastAddAndRunFetchers+"') are being called concurrently. This should be avoided.")

    lastAddAndRunFetchers = callbackName;
    _FL.stashCallbacks();
    DataFetcherRegistry.addFetchers(fetcherDefs, callback, callbackName);
    _FL.unstashCallbacks();
    
    var lastFetcher = _FL.getFetcher(_FL.getFetcherCount()-1);
    var f = function(data, errorMsg, errorType, cached)
     { 
//        console.log("DataFetcherRegistry.addAndRunFetchers.f(): final callback.");
//        console.log("DataFetcherRegistry.addAndRunFetchers.f() >> Fetcher list\n"+_FL.printFetcherList());
//        console.log("DataFetcherRegistry.addAndRunFetchers.f() >> Fetcher "+lastFetcher.name+": "+errorMsg);
        saveFetcherResults(data, errorMsg, errorType, lastFetcher, cached);
        var Params = createParamList([], fetcherDefs);
        console.log("DataFetcherRegistry.addAndRunFetchers.f(): Running single callback '"+callbackName+"' with "+Params.str+" (in DataFetcherRegistry.addAndRunFetchers.f).");
        lastAddAndRunFetchers = null;
        try { callback.apply(null, Params.params); } catch(e) { console.error(e); }
        
//        console.log("DataFetcherRegistry.addFetchers (and run) END: ", _FL);
      };

     for(var i = _FL.getFetcherCount()-1; i >= 0; --i)
      {
        var fetcher = _FL.getFetcher(i);
        var prevFetcher = i == 0 ? { name: null, optional: null } : _FL.getFetcher(i-1);
        f = createNestedFunc(fetcher, prevFetcher, f);
      }

    if (f != null)
     setTimeout(f, 1);
  }


DataFetcherRegistry.getFetcherListSummary = function()
 {
   return _FL.printFetcherList();
 }







/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Row Painters
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var RowPainterRegistry = new FactoryRegistry("RowPainter", ["paintRow"]);
RowPainterRegistry.render = function(rowPainterName, elementId, itemList, tableClass, tableStyle, paramObject)
 {
   var rowPainter = RowPainterRegistry.getInstance({name: rowPainterName, params: paramObject});
   if (rowPainter == null)
    return '<img src="/static/img/error.gif" height="20px"> RowPainter \''+rowPainterName+'\' not found or initialized properly.';
   rowPainter = rowPainter._obj;
   rowPainter.config = paramObject==null || paramObject.config == null ? { } : paramObject.config;
   var columns = rowPainter["config"]["columns"];
   rowPainter.getColumnColor = function(columnKey, columnValue)
   {
      var config = columns;
      var prefixClass = "no-color";
      if(config[columnKey] == null || config[columnKey]["value"] == null)
        {
          console.log("Cannot find colorConfig for '"+columnKey+"'");
          return prefixClass;
        }
        var comparableValue = config[columnKey]["value"];
        if(columnValue == comparableValue)
          {
            prefixClass = columnKey+"_eq";
          }
        if(columnValue > comparableValue)
          {
            prefixClass = columnKey+"_high";
          }
        if(columnValue == comparableValue)
          {
            prefixClass = columnKey+"_low";
          }
        return prefixClass;
   };
   var Str = '<TABLE border="0px" cellspacing="0px" class="' + tableClass +'" style="'+ tableStyle + '">\n';
   var count = 0;
   var tableDOM = null;
   if (rowPainter.paintFirst != null)
     Str+=rowPainter.paintFirst();
   for (var i = 0; i < itemList.length; ++i)
     if (rowPainter.check == null || rowPainter.check(itemList[i]) == true)
       Str += rowPainter.paintRow(i, ++count, itemList[i]);
   if (rowPainter.paintLast != null)
     Str+=rowPainter.paintLast(count);
   Str += '</TABLE>\n';
   
   var wrapper= document.createElement('div');
   wrapper.innerHTML= Str;
   tableDOM = wrapper.firstChild
   var cells = tableDOM.rows[0].cells;
   var sortCallback = rowPainter.config["sortCallBack"];
   for(var configKey in columns)
     {
       var columnConfig = columns[configKey];
       var columnHTML = configKey;
       for( var i = 0; i < cells.length; ++i)
         {
           var cell = cells[i];
           var cellHTML = cell.innerHTML;
           var sortOrder = columnConfig["order_asc"];
           var flag = cellHTML == columnHTML && columnConfig["sortable"] == true;
           FloriaDOM.addCSS(cell, "tableSorter-header");
           if(flag == false)
             {
               FloriaDOM.addCSS(cell, "sorter-false")
               continue;
             }
           if(sortOrder == null)
             {
               FloriaDOM.addCSS(cell, "tableSorter-headerUnSorted");               
             }
           else
             {
               FloriaDOM.addCSS(cell, sortOrder == 0 ? "tableSorter-headerAsc" : "tableSorter-headerDesc");
             }
           if(flag == true)
             {
               cell.setAttribute("data-column", configKey);
               cell.addEventListener("click", function()
                   {
                     sortCallback(this.getAttribute("data-column"));
                   }, false);               
             }
         }
     }

   if (elementId == null)
       return tableDOM;
   FloriaDOM.setInnerHTML(elementId, tableDOM);
 }





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Tile Registry
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var TileRegistry = new FactoryRegistry("Tile", ["close", "getTitle", "getLinks", "render"]);

var _tileCounter = 0;
var _tiles   = { };
var _layouts = { };


function paintTileLinks(links)
 {
   var Str = "";
   if (links != null)
     {
       for (var i = 0; i < links.length; ++i)
        {
          var l = links[i];
          if (l == null)
           continue;
          if (l.markup==null)
            Str+='<A href="javascript:'+l.action+'"><img src="'+l.img+'"'+(l.alt==null?'':'alt="'+l.alt+'" title="'+l.alt+'"')+'></A>';
           else
            Str+='&nbsp;&nbsp;&nbsp;'+(l.fontSize==null?"":'<SPAN style="font-size: '+l.fontSize+'%">')+l.markup+(l.fontSize==null?"":'</SPAN>');
        }
     }
   return Str;
 }


function createTileInstance(layoutId, compDef)
 {
   var layout = _layouts[layoutId];
   if (layout == null)
    layout = _layouts[layoutId] = [];

   var comp = TileRegistry.getInstance(compDef);
   if (comp != null)
     {
       comp._obj._tileId = layoutId+"_"+(++_tileCounter)+"_"+comp._typeName;
       comp._obj.setContent = function(Str) { if (document.getElementById(this._tileId)==null) console.log("Tile "+this._tileId+" cannot be found in the DOM"); else FloriaDOM.setInnerHTML(this._tileId, Str);  };
       comp._obj.setError   = function(Str) { if (document.getElementById(this._tileId)==null) console.log("Tile "+this._tileId+" cannot be found in the DOM"); else FloriaDOM.setInnerHTML(this._tileId, '<BR><CENTER><IMG height="25px" src="/static/img/warning.gif"><BR>'+Str+'</CENTER>'); }
       comp._obj.setLinks   = function(links) { FloriaDOM.setInnerHTML(comp._obj._tileId+'__LINKS', paintTileLinks(links)); }
       comp._obj.publishMsg = function(msgName, data) { TileRegistry.publishMessage(layoutId, msgName, data); }
       _tiles[comp._obj._tileId] = comp._obj;
       layout.push(comp._obj);
     }
   
   return comp;
 }

function cleanLayoutInstance(layoutId)
  {
    var layout = _layouts[layoutId];
    if (layout == null)
     return;
    
    for (var i = 0; i < layout.length; ++i)
     {
       var obj = layout[i];
       obj.close();
       delete _tiles[obj._tileId];
     }
    
    delete _layouts[layoutId];
  }

TileRegistry.get = function(tileId)
  {
    var c = _tiles[tileId];
    if (c == null)
     FloriaDOM.alertThrow("ERROR: Cannot get component "+tileId+".");
    return c;
  }

function renderTile(layoutId, compDef, rowLength)
  {
    if (compDef.name == null)
     return "";
    
    var expand = compDef.expand != null ? compDef.expand : -1;
    var comp = createTileInstance(layoutId, compDef);
    if (comp == null)
     {
       return '<DIV class="tileHeader rounded">'+compDef.name+'</DIV>'
             +'<CENTER><BR><img src="/static/img/error.gif" height="20px"><BR><SPAN class="ErrorMessage">Tile not found or initialized properly.</SPAN></CENTER>'
             ;
     }
   
    if (compDef.header != false)
     {
        var Str = '<DIV class="tileHeader rounded '+(expand==0?'minimized':'')+'">';
        if (expand != -1)
         Str+='<SPAN id="MMI'+comp._obj._tileId+'" class="'+(expand==1?'minMax':'maxMin')+'" onClick="FloriaFactories.TileRegistry.minMax(\''+comp._obj._tileId+'\')"/>';
        Str+='<SPAN class="tileTitle">'+comp._obj.getTitle()+'</SPAN>'+(expand != -1?'</SPAN>':'')
            +'<SPAN id="'+comp._obj._tileId+'__LINKS" class="actions">'
            +paintTileLinks(comp._obj.getLinks())
            +'</SPAN></DIV>';
     }
    Str+='<DIV id="'+comp._obj._tileId+'" class="tileContents overflowable" style="'+(expand == 0 ? (comp._obj._minimized=true, 'display:none;'):'')+(compDef.height != null?'height:'+compDef.height+' !important;max-height:'+(compDef.height)+' !important;':compDef.maxHeight != null?'max-height:'+compDef.maxHeight+' !important;':'')+'">'
        +   '<BR><CENTER><IMG align="center" src="/static/img/progress.gif" height="75px"></CENTER>'
        +   '<DIV id="'+comp._obj._tileId+'_STATUS_UPDATE" style="text-align: center; font-style: italic;"></DIV>'
        +'</DIV>';
    console.log("Setting up status update for long running.");
    if(comp._dataDef.length == 0)
      {
        setTimeout(function(){
          comp._obj.render.apply(comp._obj, arguments);
        }, 1);
      }
    else
      {
        DataFetcherRegistry.addFetchers(comp._dataDef, function() { comp._obj.render.apply(comp._obj, arguments); }, comp._obj._tileId, null, 
            function(message, percent) { 
              if (message != null)
               FloriaDOM.setInnerHTML(comp._obj._tileId+'_STATUS_UPDATE',  message);
            });
      }
    return Str;
  }

TileRegistry.layout = function(layoutId, layoutDef, forceSingleColumn, callbackFunc)
  {
    cleanLayoutInstance(layoutId);
    var Str = '<DIV class="tileLayout" id="TILELAYOUT_'+layoutId+'">\n';
    for (var i = 0; i < layoutDef.length; ++i)
     {
       var row = layoutDef[i];
       var overrideCount = 0;
       for (var j = 0; j < row.length; ++j)
         if (row[j].overrideDiv != null)
          ++overrideCount;
       if (overrideCount != 0 && overrideCount != row.length)
         FloriaDOM.alertThrow("Incompatible Tile Layout row: a mix of "+overrideCount+" overridden tiles and "+(row.length-overrideCount)+" normal tiles were found.");
       
       Str+='<DIV class="tileLayoutRow">\n';
       for (var j = 0; j < row.length; ++j)
        {
          if (row[j].overrideDiv != null)
           FloriaDOM.setInnerHTML(row[j].overrideDiv, renderTile(layoutId, row[j], row.length));
          else
           Str+='<DIV class="tileLayoutCell w'+row.length+'">'+renderTile(layoutId, row[j], row.length)+'</DIV>\n';
        }
       Str+='</DIV>';
     }
    Str+='</DIV>\n';
    DataFetcherRegistry.runAll(callbackFunc != null ? callbackFunc : function() { });
    return Str;
  }


TileRegistry.minMax = function(tileId)
 {
   var obj = TileRegistry.get(tileId);
   if (obj._minimized == true)
    {
      obj._minimized = false;
      FloriaDOM.show(tileId);
      FloriaDOM.removeCSSFromPreviousSibling(tileId, "minimized");
      FloriaDOM.removeCSS("MMI"+obj._tileId, "maxMin");
      FloriaDOM.addCSS("MMI"+obj._tileId, "minMax");
    }
   else 
    {
      obj._minimized = true;
      FloriaDOM.hide(tileId);
      FloriaDOM.addCSSToPreviousSibling(tileId, "minimized");
      FloriaDOM.removeCSS("MMI"+obj._tileId, "minMax");
      FloriaDOM.addCSS("MMI"+obj._tileId, "maxMin");
    }
 }


TileRegistry.publishMessage = function(layoutId, msgName, data)
  {
    for (var prop in _layouts)
      {
        var layout = _layouts[prop];
        if (layout == null)
         return;
//        var visible = FloriaDOM.isElementInViewport("TILELAYOUT_"+prop);
//        if (visible == false)
//         continue;
        for (var i = 0; i < layout.length; ++i)
         {
           var t = layout[i];
           var f = t["subscribe_"+msgName];
           if (f != null)
            f.apply(t, [data]);
         }
      }
  };







/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Pickers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var PickerRegistry = new FactoryRegistry("Picker", ["getDimensionPercents", "getName", "refill", "render"]);

var pickers = {};
var descriptions = {};

PickerRegistry.getPicker = function(elementId)
 {
   if (elementId.endsWith("_PICKER") == true)
     elementId = elementId.substring(0, elementId.length-"_PICKER".length);
   var p = pickers[elementId];
   if (p == null)
    FloriaDOM.alertThrow("Cannot find picker '"+elementId+"'.");
   return p._obj;
 }

function mergeValuesAndDescriptions(values, descriptions)
  {
    var formatted_values = [];
    for(var i=0; i < values.length; i++)
      {
        if(descriptions != null && descriptions[values[i]] != null)
          formatted_values.push({value: values[i], descr: descriptions[values[i]]})
        else
          formatted_values.push({value: values[i], descr: null})
      }
    return formatted_values;
  }

function copyPickerDescriptions(picker, p)
  {
    descriptions[p.fieldName] = descriptions[p.fieldName] || {}
    for(var i=0; i<picker._internal.values.length;i++)
      {
        var value = picker._internal.values[i];
        descriptions[p.fieldName][value.value] = value.descr || value.label;
      }
  }

function prepareRefiller(picker, p, callbackFunction)
 {
   var pickerCopy = picker;
   var defCopy = p;
   
   if (DataFetcherRegistry.addFetchers(picker._dataDef, function() {
         var selected_values = p.values==null?[]:p.values;
         var formatted_values = mergeValuesAndDescriptions(selected_values, p.descriptions);
         
         var args = [formatted_values];
         for (var i = 0; i < arguments.length; ++i)
           args.push(arguments[i]);
    
         picker._internal.values = picker._obj.refill.apply(picker._obj, args);
         picker._internal.values_backup = picker._internal.values.slice();
         
         if (callbackFunction != null)
           callbackFunction(pickerCopy, defCopy);
    
        }, "Picker "+picker._internal.elementId) == null)
    {
      if (callbackFunction != null)
       callbackFunction(pickerCopy, defCopy);
      return null;
    }
   return true;
 }

function prepareHiderFunc(pickerId)
 {
   return function() 
    {
      var picker = pickers[pickerId];
      if (picker == null)
       throw "Picker '"+pickerId+"' cannot be found.";
      picker._internal.values_backup = picker._internal.values.slice();
      pick(picker);
    };
 }

PickerRegistry.renderInline = function(p)
 {
   PickerRegistry.render([p], true);
 };

PickerRegistry.renderValue = function(pickerDef)
  {
    var picker = PickerRegistry.getInstance({name: pickerDef.pickerName, params: pickerDef.params})
    if (picker == null || picker._obj.renderValues == null)
      {
        return FloriaText.print(pickerDef.values);
      }

    picker._internal = { 
        elementId: pickerDef.elementId, 
        name: pickerDef.name, 
        values: pickerDef.values,
        multi: pickerDef.multi,
        quickSelect: pickerDef.quickSelect,
        summarySelectionsOnly: pickerDef.summarySelectionsOnly
     };

    var selected_values = pickerDef.values==null?[]:pickerDef.values;
    var formatted_values = mergeValuesAndDescriptions(selected_values, pickerDef.descriptions);
    picker._internal.values = picker._obj.refill.apply(picker._obj, [formatted_values, []]);

    return picker._obj.renderValues();
  }

PickerRegistry.renderValues = function(pickerDefs, descriptionsCallback)
{
  var fetchersCount = 0;
  for (var i = 0; i < pickerDefs.length; ++i)
    {
      console.log(_FL.printFetcherList());
      var pickerDef = pickerDefs[i];
      var params = FloriaDOM.mergeProperies(pickerDef.params, {search: "2", text: pickerDef.values.join(", ")})

      var picker = PickerRegistry.getInstance({name: pickerDef.pickerName, params: params})
      if (picker == null || picker._obj.renderValues == null)
        {
          FloriaDOM.setInnerHTML(pickerDef.elementId + "_VALUES(0)", FloriaText.print(pickerDef.values));
          continue;
        }
      picker._internal = { 
          elementId: pickerDef.elementId, 
          name: pickerDef.name, 
          values: pickerDef.values,
          multi: pickerDef.multi,
          quickSelect: pickerDef.quickSelect,
          summarySelectionsOnly: pickerDef.summarySelectionsOnly
       };
      ++fetchersCount;
      prepareRefiller(picker, pickerDef, function(pickerCopy, defCopy) {
        var Str = pickerCopy._obj.renderValues();
        FloriaDOM.setInnerHTML(pickerCopy._internal.elementId + "_VALUES(0)", FloriaText.print(Str));
        copyPickerDescriptions(pickerCopy, defCopy);
      })
    }

  if (fetchersCount > 0)
    DataFetcherRegistry.runAll(function() {
        console.log("Pickers have been refilled.");
        if (descriptionsCallback != null)
          descriptionsCallback(descriptions);
      });
}
 
PickerRegistry.render = function(pickerDefs, Inline, afterRenderCallbackFunc, onChangeCallbackFunc)
 {
   // console.log("PickerRegistry.render: start");
       for (var i = 0; i < pickerDefs.length; ++i)
        {
          var p = pickerDefs[i];
          console.log("Creating new instance of picker "+p.pickerName);
          var picker = PickerRegistry.getInstance({name: p.pickerName, params: p.params});
          if (picker == null)
           {
             FloriaDOM.setInnerHTML(p.elementId, '<img src="/static/img/error.gif" height="20px"> Picker \''+p.pickerName+'\' not found or initialized properly.');
             continue;
           }
          pickers[p.elementId] = picker;
          var Str = '<input type="hidden" id="'+p.elementId+'_'+p.name+'" name="'+p.name+'"/>';
          if (Inline == true)
            Str+='<DIV id="'+p.elementId+'_PICKER" style="width:100% !important; padding:15px;"><BR><CENTER><IMG align="center" src="/static/img/progress.gif" height="75px"></CENTER></DIV>';
          else
            Str+='<A href="javascript:FloriaFactories.PickerRegistry.show(\''+p.elementId+'\')">Pick...</A><SPAN class="codesSelectionBox" id="'+p.elementId+'_VALUES">&nbsp;<img height="10px" src="/static/img/progress_dots.gif"></SPAN>';
            
          FloriaDOM.setInnerHTML(p.elementId, Str);

          picker._internal = { 
              elementId: p.elementId, 
              name: p.name, 
              values: [],
              values_backup: [],
              multi: p.multi,
              quickSelect: p.quickSelect,
              summarySelectionsOnly: p.summarySelectionsOnly
           };
          
          picker._onChange = onChangeCallbackFunc;
          picker._internal.dlg = new DojoSimple.Dialog(p.elementId+"_POPUP");
          picker._internal.dlg.setOnHide(prepareHiderFunc(p.elementId));
          picker._obj._picker = picker;
          picker._obj._pickerName = p.pickerName;
          picker._obj._elementId = p.elementId+"_PICKER";
          picker._obj.updateValueList = function() { 
            pick(getPickerInstance(this._elementId)); 
          }
          picker._obj.getPickerId = function() {
            var pickerIDs = { drgs: "DRG", icd9s: "ICD9DX", icd9s2: "ICD9DX2", prc9s: "ICD9PRC", icd10s: "ICD10DX", icd10s2: "ICD10DX2",
                              prc10s: "ICD10PRC", hcpcss: "HCPCS", cpts: "CPT", ndcs: "NDC",
                              includedDrgs: "DRG", includedIcds: "ICD10DX", includedHcpcss: "HCPCS"
                            }
            var picker = getPickerInstance(this._elementId);
            var pickerName = picker._internal.name.split('_')[0];
            return pickerIDs[pickerName];
          }
          picker._obj.remove = function(selectionId)
           {
             if (this._picker._internal.values != null && this._picker._internal.values.length > 0)
               {
                 var parts = selectionId.split('``');
                 if (parts.length == 3)
                  {
                     this._picker._internal.values.removeValue(parts[1], "value");
                     setValues(this._picker);
                     if (this._picker._obj.getValues == null) // managed picker
                      {
                        var e = document.querySelectorAll('*[id^="'+this._picker._internal.elementId+'_PICKER``'+parts[1]+'``"]');
                        if (e != null && e.length == 1)
                         e = e[0];
                        if (e != null)
                         FloriaDOM.toggleCSS(e, "selected");
                        if (this._picker._onChange != null)
                          this._picker._onChange();
                      }
                     else if (this._picker._obj.removeValue != null)
                       this._picker._obj.removeValue(parts[1]);
                   }
                 else
                   {
                     this._picker._internal.values.removeValue(selectionId, "value");
                     setValues(this._picker);
                     if (this._picker._obj.getValues == null) // managed picker
                      {
                        var e = document.querySelectorAll('*[id^="'+this._picker._internal.elementId+'_PICKER``'+selectionId+'``"]');
                        if (e != null && e.length == 1)
                         e = e[0];
                        if (e != null)
                         FloriaDOM.toggleCSS(e, "selected");
                        if (this._picker._onChange != null)
                          this._picker._onChange();
                      }
                     else if (this._picker._obj.removeValue != null)
                       this._picker._obj.removeValue(selectionId);
                   }
               }
           }
          picker._obj.add = function(selectionId)
           {
            if (this._picker._internal.values != null)
              {
                var parts = selectionId.split('``');
                if (parts.length == 3)
                 {
// need more infrastructure here.
//                    var description = e.getAttribute("data-description")
//                    if(description != null)
//                      var v = { descr: description, value: parts[1], label: parts[2] };
//                    else
                    var v = { value: parts[1], label: parts[2] };
                    this._picker._internal.values.push(v);
                    setValues(this._picker);
                    if (this._picker._obj.getValues == null) // managed picker
                     {
                       var e = document.querySelectorAll('*[id^="'+this._picker._internal.elementId+'_PICKER``'+parts[1]+'``"]');
                       if (e != null && e.length == 1)
                        e = e[0];
                       if (e != null)
                        FloriaDOM.toggleCSS(e, "selected");
                     }
                    else if (this._picker._obj.addValue != null)
                      this._picker._obj.addValue(v);
                 }
              }
           }
//          picker._obj.getPickerName = function() {
//            var pickerIDs = { drgs: "DRG", icd9s: "ICD9DX", icd9s2: "ICD9DX2", prc9s: "ICD9PRC", icd10s: "ICD10DX", icd10s2: "ICD10DX2",
//                    prc10s: "ICD10PRC", hcpcss: "HCPCS", cpts: "CPT", ndcs: "NDC" }
//            var picker = getPickerInstance(this._elementId);
//            var pickerName = picker._internal.name.split('_')[0];
//            return pickerIDs[pickerName];
//              return this._pickerName;
//         }
          if (prepareRefiller(picker, p, function(pickerCopy, defCopy) {
               pick(pickerCopy);
              }) == null)
           FloriaDOM.setInnerHTML(p.elementId, '<img src="/static/img/error.gif" height="20px"> Picker \''+p.pickerName+'\' was not initialized properly.');
        }
       console.log("Refilling pickers ");
       DataFetcherRegistry.runAll(function() { 
          console.log("Pickers have been refilled.");
          if (Inline == true)
           FloriaFactories.PickerRegistry.show(pickerDefs[0].elementId, true); // assuming only one picker when inline.
          else
           {
             var props = Object.getOwnPropertyNames(pickers);
             for (var i = 0; i < props.length; ++i) // update display of all pickers.
              setValues(pickers[props[i]]);
           }
          if (afterRenderCallbackFunc != null)
            afterRenderCallbackFunc();
        });
   // console.log("PickerRegistry.render: end");
 };

  
PickerRegistry.show = function(elementId, Inline)
 {
   console.log("PickerRegistry.show: start");

   var picker = pickers[elementId];
   if (picker._internal.dlg != null && Inline != true)
    {
      var dim = picker._obj.getDimensionPercents();
      picker._internal.dlg.show(picker._obj.getName(), null, dim.w, dim.h);
      if (picker._onChange != null /*&& picker._internal.quickSelect != true && picker._internal.multi != true*/) // quickselect is optional, so check for == true or != true.
        picker._internal.dlg.setOnHide(function() { 
           picker._onChange(null, "submit"); 
        });
      var Str = '<DIV id="'+picker._internal.elementId+'_PICKER" style="width:100% !important; padding:15px;"><BR><CENTER><IMG align="center" src="/static/img/progress.gif" height="75px"></CENTER></DIV>';
      picker._internal.dlg.setContent(Str);
    }
   if (picker._obj.getValues == null) // managed picker 
    {
      picker._internal.onClickHandler = function(originalElement, event, targetElement) {
        var e = targetElement;
        while (e != null && e.id != picker._internal.elementId)
         {
           if (e.id != null)
            {
              var parts = e.id.split('``');
              if (parts.length == 3)
               {
                  var description = e.getAttribute("data-description")
                  if(description != null)
                    var v = { descr: description, value: parts[1], label: parts[2] };
                  else
                    var v = { value: parts[1], label: parts[2] };
                  if (picker._internal.quickSelect == true && picker._internal.multi == false && FloriaDOM.hasCSS(e, "selected") == true)
                   return; // Can't unselect an item in a quickSelect scenario as this means one value should always be selected.
                  if (FloriaDOM.toggleCSS(e, "selected") == true)
                   {
                     if (picker._internal.multi == false)
                      {
                        var lastPick = picker._internal.values.pop();
                        if (lastPick != null)
                         {
                           var lastPickedElement = FloriaDOM.getElement(picker._internal.elementId+'_PICKER``'+lastPick.value+'``'+lastPick.label);
                           if (lastPickedElement != null)
                            {
                              FloriaDOM.removeCSS(lastPickedElement, "selected");
                            }
                         }
                      }
                     picker._internal.values.push(v);
                   }
                  else
                   {
                     picker._internal.values.removeValue(v.value, "value");
                   }
                  setValues(picker);
                  if (picker._internal.quickSelect == true && picker._internal.multi == false)
                   {
                     picker._internal.dlg.hide();
                   }
                  return;
               }
            }
           e = e.parentNode;
         }
      };
      FloriaDOM.addEvent(picker._internal.elementId+'_PICKER', "click", picker._internal.onClickHandler);
    }
   
   DataFetcherRegistry.addAndRunFetchers(picker._dataDef, function() {
        var args = [picker._internal.elementId+'_PICKER', picker._internal.values];
        if (picker._obj.getValues != null)
         args.push(picker._internal.multi);
        for (var i = 0; i < arguments.length; ++i)
         args.push(arguments[i]);
        setTimeout(function() { picker._obj.render.apply(picker._obj, args); setValues(picker); }, 200);
     }, "Picker "+picker._internal.elementId);
   console.log("PickerRegistry.show: end");
 };


 
function writeValuesToDisplayDiv(picker)
{
  var Str1 = "", Str2 = "";
  var temp = "";
  if (picker._internal.values != null && picker._internal.values.length > 0)
    {
      if (picker._internal.summarySelectionsOnly == true)
       {
         var titleStr = '';
         for (var i = 0; i < picker._internal.values.length; ++i)
          {          
            titleStr += (i==0?'':i%4==0?",\n":", ")+picker._internal.values[i].label;
          }        
         temp = '&nbsp;<SPAN title="'+titleStr.printFuncParam()+'">&nbsp;'+picker._internal.values.length+' value'+(picker._internal.values.length>1?'s':'')+' selected&nbsp;</SPAN>';
         Str1 = temp;
         Str2 = temp;
       }
      else
       {
          for (var i = 0; i < picker._internal.values.length; ++i)
            {          
              var v = picker._internal.values[i];
              temp = "<span title=\""+(v.descr != null ? v.descr : v.label).printFuncParam()+"\">"+v.label+"";
              Str1 += temp + '&nbsp;<A href="javascript:FloriaFactories.PickerRegistry.remove(\''+picker._internal.elementId+'\', \''+v.value+'\', true)"><img src="/static/img/delete.gif" height="15px"></A></span>&nbsp;&nbsp;&nbsp;&nbsp;';
              Str2 += temp + '&nbsp;<A href="javascript:FloriaFactories.PickerRegistry.remove(\''+picker._internal.elementId+'\', \''+v.value+'\')"><img src="/static/img/delete.gif" height="15px"></A></span>&nbsp;&nbsp;&nbsp;&nbsp;';
            }
       }
    }
   else
     {
       temp = '<IMG src="/static/img/warning.gif" height="20px" align="absmiddle">&nbsp;No value selected.';
       Str1 = temp;
       Str2 = temp;
     }       
  
  FloriaDOM.setInnerHTML(picker._internal.elementId+"_VALUES", Str1);
  FloriaDOM.setInnerHTML(picker._internal.elementId+"_PICKER_VALUES(2)", Str2);
  //console.log(picker._internal.elementId+"_VALUES -> "+Str);
}
 
function writeValuesToInternalDiv(picker)
{
  var v = "";
  var d = "";
  for (var i = 0; i < picker._internal.values.length; ++i)
   {
     if (v.length != 0) {
       v += "``";
       d += "~~";
     }
     v += picker._internal.values[i].value;
     d += (picker._internal.values[i].descr || picker._internal.values[i].label || "");
   }
  var elementName= picker._internal.elementId+'_'+picker._internal.name;
  var e = FloriaDOM.getElement(elementName);
  if (e != null)
    {
      e.value=v;
      e.dataset.description = d;
//      console.log("values=", v, "; descriptions=", d);
    }       
  else
    console.error("Cannot find element "+elementName+" to set the picker value");
}

function setValues(picker)
 {
   // console.log("PickerRegistry.setValues: start");
   // console.log("setValues() -> Values: ", picker._internal.values, ";");

   writeValuesToDisplayDiv(picker);
   writeValuesToInternalDiv(picker);
   
   var resetBtn = FloriaDOM.getElement(picker._internal.elementId+"_PICKER_reset");
   if(resetBtn == null)
     return;

   if(picker._obj.matchesValues != null)
     {
       resetBtn.style.display = "";
       resetBtn.disabled = picker._obj.matchesValues(picker._internal.values_backup);
     }
   else
     resetBtn.style.display = "none";
 }

function pick(picker)
 {
   console.log("PickerRegistry.pick: start");
   if (picker._obj.getValues != null)
    {
      var vals = picker._obj.getValues(picker._internal.elementId+'_PICKER');
      picker._internal.values = vals == null ? [] : vals;
    }
   setValues(picker);
 };

PickerRegistry.pick = function(elementId)
 {
   console.log("PickerRegistry.pick(elementId): start");
   var picker = pickers[elementId];
   if (picker == null)
    FloriaDOM.alertThrow("Unknown picker "+elementId);
   pick(picker);
   console.log("PickerRegistry.pick(elementId): end");
 }

PickerRegistry.remove = function(elementId, value, replaceBackup)
 {
   console.log("PickerRegistry.remove: start");
   var picker = pickers[elementId];
   if (picker != null)
     picker._obj.remove(value)
   console.log("PickerRegistry.remove: end");
 }

PickerRegistry.resetValues = function(elementId)
  {
    var confirmed = confirm("This will undo all the changes, Are you sure ?");
    if(confirmed == false)
      return;
    
    var pickerId = elementId;
    if (pickerId.endsWith("_PICKER") == true)
      pickerId = pickerId.substring(0, pickerId.length-"_PICKER".length);
    var picker = pickers[pickerId];
    picker._internal.values = picker._obj.refill.apply(picker._obj, [picker._internal.values_backup])
    picker._obj.renderSearch.apply(picker._obj, [elementId]);
    pick(picker);
  }

PickerRegistry.getPickerList = function()
 {
   var types = [];
   for (var i = 0; i < this._componentRegistry.length; ++i)
     {
       var n = this._componentRegistry[i]._typeName;
       types.push([n, n]);
     }
   return types;
 }

function getPickerInstance(elementId)
 {
   if (elementId.endsWith("_PICKER") == true)
     elementId = elementId.substring(0, elementId.length-"_PICKER".length);
   return pickers[elementId]
 }

PickerRegistry.updatePicker = function(elementId)
 {
   var picker = getPickerInstance(elementId)
   picker._internal.values = picker._obj._values
   setValues(picker);   
 }

PickerRegistry.showTemplates = function(elementId)
 {
   var picker = getPickerInstance(elementId);
   var templateDivId = elementId+"_TEMPLATE";
   DataFetcherRegistry.addAndRunFetchers([{ name: "pickerTemplates", params: {"type": picker._obj.getPickerId() ,"text": "", "search": 1, "owner": ""} , optional: true }], function(data) {
     var templateDlg = new DojoSimple.Dialog(templateDivId+"_POPUP");
     picker._internal.templateDlg = templateDlg;
     var Str = '<DIV id="'+templateDivId+'" style="width:100% !important; padding:15px;">&nbsp;</DIV>';
     templateDlg.setContent(Str);
     var dim = {'h': 0.8, 'w': 0.8};
     var title = "Choose a "+picker._obj.getPickerId()+" template";
     picker._obj.templatesFactory().renderTemplates(data); 
     templateDlg.show(title, null, dim.h, dim.w);
  }, "Picker "+picker._internal.elementId+" Template", true); 
 }

PickerRegistry.loadTemplate = function(elementId, templateRefnum)
 {
   var picker = getPickerInstance(elementId);
   var template = picker._obj.templates.getSE(templateRefnum, "refnum");
   if(!template)
     return;
   picker._obj.selectedTemplate = {refnum: template.refnum};
   var formattedValues = mergeValuesAndDescriptions(template.values, []);
   picker._internal.values = picker._obj.refill(formattedValues);
   var args = [picker._obj._elementId, picker._internal.values];
   if (picker._obj.getValues != null)
    args.push(picker._internal.multi);
   picker._obj.render.apply(picker._obj, args); 
   setValues(picker);
   picker._internal.templateDlg.hide();
 }

PickerRegistry.updateTemplate = function(elementId)
 {
    var picker = getPickerInstance(elementId);
    var ErrorMsg = "An error has occurred: cannot update the Template.";
    var formElements = document.getElementById(elementId+"_TEMPLATE_FORM").elements;
    var params = {
        name: formElements.name.value,
        description: formElements.description.value,
        values: FloriaText.TextUtil.isNullOrEmpty(formElements.values) == true ? [] :  formElements.values.value.split(','),
        refnum: formElements.refnum.value 
    } 
    var url = '/web/svc/cms/templates/update'+"?name=" + params.name + "&description=" + params.description 
            + "&refnum=" + params.refnum + "&values=" + params.values.join('&values=');
    
    DojoSimple.ajaxUrl(url, "POST", ErrorMsg, function(data) {
        if (data == null)
         FloriaDOM.alertThrow(ErrorMsg);
        var index = picker._obj.templates.indexOfSE(params.refnum, "refnum");
        picker._obj.templates[index] = data;
        picker._obj.templatesFactory().PaintTemplates(picker._obj.templates);
        picker._obj.templatesFactory().PaintDetails(data);
      });
    return false;
 }

PickerRegistry.createTemplate = function(elementId)
 {
    var picker = getPickerInstance(elementId);
    var ErrorMsg = "An error has occurred: cannot create the Template.";
    var formElements = document.getElementById(elementId+"_TEMPLATE_FORM").elements;
    var params = {
        name: formElements.name.value,
        description: formElements.description.value,
        type:  picker._obj.getPickerId(),
        values: FloriaText.TextUtil.isNullOrEmpty(formElements.values) == true ? [] :  formElements.values.value.split(',')
    }
    var url = '/web/svc/cms/templates/create' + "?name=" + params.name + "&description=" + params.description + "&type=" + params.type
            + "&values=" + params.values.join('&values=');;
    DojoSimple.ajaxUrl(url,"POST", ErrorMsg, function(data) {
        if (data == null)
         FloriaDOM.alertThrow(ErrorMsg);
        picker._obj.templates.push(data);
        picker._obj.selectedTemplate = {refnum: data.refnum};
        picker._obj.templatesFactory().PaintTemplates(picker._obj.templates);
        picker._obj.templatesFactory().PaintDetails(data);
      });
    return false;
 }

PickerRegistry.deleteTemplate = function(elementId, refnum)
{
   if (elementId.endsWith("_PICKER") == true)
     elementId = elementId.substring(0, elementId.length-"_PICKER".length);
   var picker = pickers[elementId];
   var ErrorMsg = "An error has occurred: cannot delete the Template.";
   var url = "/web/svc/cms/templates/delete?refnum=" + refnum;
   DojoSimple.ajaxUrl(url, "GET", ErrorMsg, function(data) {
       console.log(data);
       if (data == null)
        FloriaDOM.alertThrow(ErrorMsg);
       picker._obj.templates.removeValue(refnum, "refnum");
       if(picker._obj.selectedTemplate && picker._obj.selectedTemplate.refnum == refnum)
         picker._obj.selectedTemplate = {};
       picker._obj.templatesFactory().PaintTemplates(picker._obj.templates);
       picker._obj.templatesFactory().PaintDetails();
     });
   return false;
}

if (window.FloriaFactories == null)
 window.FloriaFactories = { };
window.FloriaFactories.TileRegistry = TileRegistry;
window.FloriaFactories.PickerRegistry = PickerRegistry;




export var FloriaFactories = { FactoryRegistry: FactoryRegistry
                             , DataFetcherRegistry: DataFetcherRegistry
                             , RowPainterRegistry: RowPainterRegistry
                             , TileRegistry: TileRegistry
                             , PickerRegistry: PickerRegistry
                             };

