"use strict";

define(["floria/textutil", "floria/superdom"], function(FloriaText, SuperDOM)
{

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Base Factory infrastructure
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
function FactoryRegistry(baseTypeName, funcNames)
{
  if (baseTypeName == null)
    SuperDOM.alertThrow("FactoryRegistry instanciated with baseTypeName=null");
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
        SuperDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"' called with a null typeName");
      if (constructorFunc == null)
        SuperDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"."+typeName+"'' called with a null constructorFunc");

      var packageName = "DEFAULT";
      var parts = typeName.split(/\./);
      if (parts.length < 1 || parts.length > 2)
       SuperDOM.alertThrow("FactoryRegistry.register for '"+this._baseTypeName+"' called with an invalid typeName '"+typeName+"'. Must be '(<packageName>.)?<componentName>'.");
      else if (parts.length == 2)  
       {
         packageName = parts[0];
         typeName = parts[1];
       }
      console.log("Registering "+this._baseTypeName+" component '"+packageName+"."+typeName+"'"+(takeOverPackageName==null?"":" overriding '"+takeOverPackageName+"."+typeName+"'."));
      
      var componentPackage = this._componentPackageRegistry[packageName+"."+typeName];
      if (componentPackage != null)
       SuperDOM.alertThrow("System error: the " + this._baseTypeName + " '" + typeName + "' is being registered more than once in package "+packageName+".");

      var component = this._componentRegistry[typeName];
      if (component != null && component._packageName != takeOverPackageName)
       SuperDOM.alertThrow("System error: the " + this._baseTypeName + " '" + typeName + "' is being registered in package "+packageName+" with a duplicate previously registed in "+component._packageName+" and no valid override specification '"+takeOverPackageName+"'.");
      
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
        SuperDOM.alertThrow("System error: the class for '" + this._baseTypeName+"."+typeName + "' is missing mandatory methods " + Str + ".");
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
         dataDef = Obj.init(SuperDOM.mergeProperies(ObjDef._defaultParams, componentDef.params));
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
   var _Callbacks = [];
   var _Fetchers  = [];
   this.clean = function()
    {
      _Callbacks = [];
      _Fetchers  = [];
    };
   this.getFetcher = function(name, sig)
    {
      if (typeof name == "string")
       return _Fetchers.getSE(name+'``'+sig, "__key");
      return _Fetchers[name]; // It's a number, i.e., an index.
    };
   this.getFetcherCount = function()
    {
      return _Fetchers.length;
    };
   this.removeFetcher = function(name, sig)
    {
      return _Fetchers.remove(_Fetchers.indexOfSE(name+'``'+sig, "__key"));
    };
   this.addFetcher = function(fetcher)
    {
      if (fetcher.instance == null)
       SuperDOM.alertThrow("Cannot find DataFetcher '"+fetcher.name+"'.");

//      console.log("adding fetcher ",fetcher, ", ", _Fetchers);
      var pos = 99999;
      if (fetcher.instance._dataDef != null && fetcher.instance._dataDef.length != 0)
       {
         DataFetcherRegistry.addFetchers(fetcher.instance._dataDef, null, "Composition Callback", true);
         for (var i = 0; i < fetcher.instance._dataDef.length; ++i)
          {
            var dependencyName = fetcher.instance._dataDef[i].name;
            for (var j = 0; j < _Fetchers.length; ++j)
             if (_Fetchers[j].name == dependencyName && j < pos)
              pos = j;
          }
       }
      fetcher.__key = fetcher.name+'``'+fetcher.sig;
      if (pos >= _Fetchers.length)
       _Fetchers.push(fetcher);
      else
       _Fetchers.splice(pos+1, 0, fetcher);
//      console.log("added. ", _Fetchers);
      return fetcher;
    };
   this.printFetcherList = function()
    {
      var Str = "";
      for(var i = 0; i < _Fetchers.length; ++i)
       {
         var f = _Fetchers[i];
         Str+="   "+f.instance._packageName+"."+f.instance._typeName;
         if (f.instance._obj.getDescription != null)
          Str+=" ("+f.instance._obj.getDescription()+")";
         Str+="\n";
       }
      return Str;
    };
   this.getCallbackCount = function()
    {
      return _Callbacks.length;
    };
   this.getCallback = function(index)
    {
      return _Callbacks[index];
    };
   this.addCallback = function(callbackDef)
    {
      _Callbacks.push(callbackDef);
    };
   this.stashCallbacks = function()
    {
      this._stachedCallbacks = _Callbacks;
      _Callbacks = [];
    };
   this.unstashCallbacks = function()
    {
      _Callbacks = this._stachedCallbacks;
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
       Str+=f.name;
       f = _FL.getFetcher(f.name, f.sig!=null?f.sig:JSON.stringify(f.params));
       params.push(f.result);
     }
   
   return { params: params, str: Str };
 }

DataFetcherRegistry.clean = function()
 {
   _FL.clean();
 };

DataFetcherRegistry.addFetchers = function(fetcherDefs, callback, callbackName, allowPackageOverride, statusUpdateCallbackFunc)
 {
//   console.log("DataFetcherRegistry.addFetchers");
   var callbackDef = { callback: callback, callbackName: callbackName, fetchers: [ ] };
   _FL.addCallback(callbackDef);
   
   if (fetcherDefs != null)
    for (var i = 0; i < fetcherDefs.length; ++i)
      {
         var d = fetcherDefs[i];
         if (d == null)
         {
            callbackDef.fetchers.push(null);
            console.log("DataFetcherRegistry.addFetchers: found null fetcherDef["+i+"]");
            continue;
          }
         var newSig = JSON.stringify(d.params);
         var existingFetcher = _FL.getFetcher(d.name, newSig);

//         console.log("fetcherName: "+d.name+"; existingFetcher: "+existingFetcher+";\nexistingFetcher.sig: "+(existingFetcher==null?null:existingFetcher.sig)+";\nnewSig: "+newSig+";");
         if (existingFetcher == null) // || newSig != existingFetcher.sig)
           {
             existingFetcher = _FL.addFetcher({name: d.name, instance: DataFetcherRegistry.getInstance(d, allowPackageOverride), result: null, executed: false, optional: d.optional, statusUpdateCallbackFunc: statusUpdateCallbackFunc, sig: newSig });
             console.log("Created a new fetcher '"+existingFetcher.__key+"'.");
           }
         else
           {
             console.log("Reusing existing fetcher'"+existingFetcher.__key+"'.");
           }
         callbackDef.fetchers.push(existingFetcher);
      }
 };

function saveFetcherResults(data, errorMsg, fetcher, cached)
 {
//    console.log("Saving results from DataFetcher '"+fetcherName+"'.");
//    console.log("             "+SuperDOM.printObject(data).substring(0,500).replace(/\n/g, "\n             "));
    var f = _FL.getFetcher(fetcher.name, fetcher.sig);
    if (cached != true)
     {
        if (f.instance._typeName.startsWith(f.instance._packageName) == true)
         console.log("DataFetcher '"+f.instance._typeName+"': overriden, saving results.");
        else
         console.log("DataFetcher '"+f.instance._packageName+"."+f.instance._typeName+"': saving results.");
     }
    f.result = data;
    f.errorMsg = errorMsg;
    f.executing = false;    
    if (data == null)
     {
       console.log("DataFetcher '"+f.instance._typeName+"': returned null.");
       if (errorMsg != null && f.optional != true)
        alert(errorMsg);
     }
    return f;
 }

function createNestedFunc(fetcher, prevFetcher, previousFunc)
 {
   return function(data, errorMsg, cached)
     {
       if (prevFetcher != null && prevFetcher.name != null)
        saveFetcherResults(data, errorMsg, prevFetcher, cached);

       if (fetcher.executing == true)
        {
          ++fetcher.executingCount;
          if (fetcher.executingCount > 50)
           {
             console.error("DataFetcher '"+fetcher.instance._typeName+"' is locked or has failed.");
             return;
           }
          if (fetcher.executingCount % 10 == 0)
           console.log("DataFetcher '"+fetcher.instance._typeName+"': is currently executing. Waiting (count="+fetcher.executingCount+")...");
          setTimeout(function() { createNestedFunc(fetcher, prevFetcher, previousFunc)(data, errorMsg); }, 1);
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
           previousFunc(fetcher.result, fetcher.errorMsg, true);
         }
     }
 }

DataFetcherRegistry.runAll = function(finalCallback)
 {
   console.log("\n\n------------------------------------------------------------------------------------\nDataFetcherRegistry.runAll\n"+_FL.printFetcherList());
   if (_FL.getFetcherCount() == 0)
    return finalCallback();

   var f = function(data, errorMsg, cached)
     { 
       var fetcher = _FL.getFetcher(_FL.getFetcherCount()-1);
       saveFetcherResults(data, errorMsg, fetcher, cached);
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
       finalCallback();
       _FL._Callbacks = [ ];
     };
     
    for(var i = _FL.getFetcherCount()-1; i >= 0; --i)
     {
       var fetcher = _FL.getFetcher(i);
       var prevFetcher = i == 0 ? { name: null, optional: null } : _FL.getFetcher(i-1);
       f = createNestedFunc(fetcher, prevFetcher, f);
     }
   setTimeout(f, 1);
 }

var lastAddAndRunFetchers = null;
DataFetcherRegistry.addAndRunFetchers = function(fetcherDefs, callback, callbackName)
  {
    console.log("\n\n------------------------------------------------------------------------------------\nDataFetcherRegistry.addAndRunFetchers");
    if (FloriaText.isNoE(callbackName) == true)
      callbackName = "UNKNOWN";
    if (lastAddAndRunFetchers != null)
     SuperDOM.alertThrow("Two DataFetcherRegistry.addAndRunFetchers ('"+callbackName+"' and previously '"+lastAddAndRunFetchers+"') are being called concurrently. This is not allowed."); 

    lastAddAndRunFetchers = callbackName;
//    console.log("DataFetcherRegistry.addAndRunFetchers with callback "+callbackName);
    _FL.stashCallbacks();
    DataFetcherRegistry.addFetchers(fetcherDefs, callback, callbackName);
    _FL.unstashCallbacks();
    
    var f = function(data, errorMsg, cached)
     { 
//        console.log("DataFetcherRegistry.addAndRunFetchers.f(): final callback.");
        var lastFetcher = _FL.getFetcher(_FL.getFetcherCount()-1);
        saveFetcherResults(data, errorMsg, lastFetcher, cached);
        var Params = createParamList([], fetcherDefs);
        console.log("DataFetcherRegistry.addAndRunFetchers.f(): Running single callback '"+callbackName+"' with "+Params.str+" (in DataFetcherRegistry.addAndRunFetchers.f).");
        lastAddAndRunFetchers = null;
        try { callback.apply(null, Params.params); } catch(e) { console.error(e); }
      };

     for(var i = _FL.getFetcherCount()-1; i >= 0; --i)
      {
        var fetcher = _FL.getFetcher(i);
        var prevFetcher = i == 0 ? { name: null, optional: null } : _FL.getFetcher(i-1);
        f = createNestedFunc(fetcher, prevFetcher, f);
      }

//    console.log("DataFetcherRegistry.addAndRunFetchers.f(): Running the fetchers.");    
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
   var Str = '<TABLE border="0px" cellspacing="0px" class="' + tableClass + '" style="' + tableStyle + '">\n';
   var count = 0;
   if (rowPainter.paintFirst != null)
     Str+=rowPainter.paintFirst();
   for (var i = 0; i < itemList.length; ++i)
     if (rowPainter.check == null || rowPainter.check(itemList[i]) == true)
       Str += rowPainter.paintRow(i, ++count, itemList[i]);
   if (rowPainter.paintLast != null)
     Str+=rowPainter.paintLast(count);
   Str += '</TABLE>\n';
   if (elementId == null)
    return Str;
   SuperDOM.setInnerHTML(elementId, Str);
 }





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Tile Registry
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var TileRegistry = new FactoryRegistry("Tile", ["close", "getTitle", "getLinks", "render"]);

var _tileCounter = 0;
var _tiles   = { };
var _layouts = { };

function createTileInstance(layoutId, compDef)
 {
   var layout = _layouts[layoutId];
   if (layout == null)
    layout = _layouts[layoutId] = [];

   var comp = TileRegistry.getInstance(compDef);
   if (comp != null)
     {
       comp._obj._tileId = layoutId+"_"+(++_tileCounter)+"_"+comp._typeName;
       comp._obj.setContent = function(Str) { if (document.getElementById(this._tileId)==null) console.log("Tile "+this._tileId+" cannot be found in the DOM"); else SuperDOM.setInnerHTML(this._tileId, Str);  };
       comp._obj.setError   = function(Str) { if (document.getElementById(this._tileId)==null) console.log("Tile "+this._tileId+" cannot be found in the DOM"); else SuperDOM.setInnerHTML(this._tileId, '<BR><CENTER><IMG height="25px" src="/static/img/warning.gif"><BR>'+Str+'</CENTER>'); }
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
     SuperDOM.alertThrow("ERROR: Cannot get component "+id+".");
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
            +'<SPAN class="actions">';
        var links = comp._obj.getLinks();
        if (links != null)
          {
            for (var i = 0; i < links.length; ++i)
             {
               var l = links[i];
               Str+='<A href="javascript:'+l.action+'"><img src="'+l.img+'"></A>';
             }
          }
        Str+='</SPAN></DIV>';
     }
    Str+='<DIV id="'+comp._obj._tileId+'" class="tileContents overflowable" style="'+(expand == 0 ? (comp._obj._minimized=true, 'display:none;'):'')+(compDef.height != null?'height:'+compDef.height+' !important;max-height:'+(compDef.height)+' !important;':compDef.maxHeight != null?'max-height:'+compDef.maxHeight+' !important;':'')+'">'
        +   '<BR><CENTER><IMG align="center" src="/static/img/progress.gif" height="75px"></CENTER>'
        +   '<DIV id="'+comp._obj._tileId+'_STATUS_UPDATE" style="text-align: center; font-style: italic;"></DIV>'
        +'</DIV>';
    console.log("Setting up status update for long running.");
    DataFetcherRegistry.addFetchers(comp._dataDef, function() { comp._obj.render.apply(comp._obj, arguments); }, comp._obj._tileId, null, 
                                    function(message, percent) { 
                                      if (message != null)
                                       SuperDOM.setInnerHTML(comp._obj._tileId+'_STATUS_UPDATE',  message);     
                                    });
    return Str;
  }

TileRegistry.layout = function(layoutId, layoutDef, forceSingleColumn)
  {
    cleanLayoutInstance(layoutId);
    var Str = '<DIV class="tileLayout" id="TILELAYOUT_'+layoutId+'">\n';
    for (var i = 0; i < layoutDef.length; ++i)
     {
       var row = layoutDef[i];
       Str+='<DIV class="tileLayoutRow">\n';
       for (var j = 0; j < row.length; ++j)
        {
          Str+='<DIV class="tileLayoutCell w'+row.length+'">'+renderTile(layoutId, row[j], row.length)+'</DIV>\n';
        }
       Str+='</DIV>';
     }
    Str+='</DIV>\n'
    DataFetcherRegistry.runAll(function() { });
    return Str;
  }


TileRegistry.minMax = function(tileId)
 {
   var obj = TileRegistry.get(tileId);
   if (obj._minimized == true)
    {
      obj._minimized = false;
      SuperDOM.show(tileId);
      SuperDOM.removeCSSFromPreviousSibling(tileId, "minimized");
      SuperDOM.removeCSS("MMI"+obj._tileId, "maxMin");
      SuperDOM.addCSS("MMI"+obj._tileId, "minMax");
    }
   else 
    {
      obj._minimized = true;
      SuperDOM.hide(tileId);
      SuperDOM.addCSSToPreviousSibling(tileId, "minimized");
      SuperDOM.removeCSS("MMI"+obj._tileId, "minMax");
      SuperDOM.addCSS("MMI"+obj._tileId, "maxMin");
    }
 }









/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Pickers
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

var PickerRegistry = new FactoryRegistry("Picker", ["getDimensionPercents", "getName", "refill", "render"]);

var pickers = { };

PickerRegistry.getPicker = function(elementId)
 {
   if (elementId.endsWith("_PICKER") == true)
     elementId = elementId.substring(0, elementId.length-"_PICKER".length);
   var p = pickers[elementId];
   if (p == null)
    SuperDOM.alertThrow("Cannot find picker '"+elementId+"'.");
   return p._obj;
 }


function prepareRefiller(picker, p)
 {
   DataFetcherRegistry.addFetchers(picker._dataDef, function() { 
//       console.log("Got the data to refill picker "+p.pickerName);
//       console.log("      p.values: ", p.values);
       var args = [p.values==null?[]:p.values];
       for (var i = 0; i < arguments.length; ++i)
        args.push(arguments[i]);
       picker._internal.values = picker._obj.refill.apply(picker._obj, args);
       pick(picker);
//       console.log("      Picker "+p.pickerName+" has been refilled with ", picker._internal.values);
     }, "Picker "+picker._internal.elementId);
 }
function prepareHiderFunc(picker)
 {
   return function() { pick(picker); };
 }


PickerRegistry.renderInline = function(p)
 {
   PickerRegistry.render([p], true);
 };

 
PickerRegistry.render = function(pickerDefs, Inline)
 {
   require(["floria/dojoSimple"], function(dojoSimple) {
       for (var i = 0; i < pickerDefs.length; ++i)
        {
          var p = pickerDefs[i];
          console.log("Creating new instance of picker "+p.pickerName);
          var picker = PickerRegistry.getInstance({name: p.pickerName, params: p.params});
          if (picker == null)
           return SuperDOM.setInnerHTML(p.elementId, '<img src="/static/img/error.gif" height="20px"> Picker \''+p.pickerName+'\' not found or initialized properly.');
          pickers[p.elementId] = picker;
          var Str = '<input type="hidden" id="'+p.elementId+'_'+p.name+'" name="'+p.name+'"/>';
          if (Inline != true)
            Str+='<A href="javascript:FloriaFactories.PickerRegistry.show(\''+p.elementId+'\')">Pick...</A><SPAN id="'+p.elementId+'_VALUES"></SPAN>';
          if (Inline == true) // == true is not the opposite of != true!!!!
            Str+='<DIV id="'+p.elementId+'_PICKER" style="width:100% !important;"></DIV>';
          SuperDOM.setInnerHTML(p.elementId, Str);
    
          picker._internal = { 
              elementId: p.elementId, 
              name: p.name, 
              values: [],
              multi: p.multi
           };
          
          picker._internal.dlg = new dojoSimple.Dialog(p.elementId+"_POPUP");
          picker._internal.dlg.setOnHide(prepareHiderFunc(picker));
          picker._obj.updateValueList = function() { pick(picker); }
          prepareRefiller(picker, p);
        }
       console.log("Refilling pickers ");
       DataFetcherRegistry.runAll(function() { 
          console.log("Pickers have been refilled.");
          if (Inline == true)
            {
              FloriaFactories.PickerRegistry.show(pickerDefs[0].elementId, true);
            }
        });
    });
 };

  
PickerRegistry.show = function(elementId, Inline)
 {
   var picker = pickers[elementId];
   if (picker._internal.dlg != null && Inline != true)
    {
      var dim = picker._obj.getDimensionPercents();
      picker._internal.dlg.show(picker._obj.getName(), null, dim.w, dim.h);
      var Str = '<DIV id="'+picker._internal.elementId+'_PICKER" style="width:100% !important;">&nbsp;</DIV>';
      picker._internal.dlg.setContent(Str);
    }
   if (picker._obj.getValues == null) // managed picker 
    {
      SuperDOM.addEvent(picker._internal.elementId+'_PICKER', "click", function(originalElement, event, targetElement) {
          var e = targetElement;
          while (e != null && e.id != picker._internal.elementId)
           {
             if (e.id != null)
              {
                var parts = e.id.split('``');
                if (parts.length == 3)
                 {
                    var v = { value: parts[1], label: parts[2] };
                    if (SuperDOM.toggleCSS(e, "selected") == true)
                     {
                       if (picker._internal.multi == false)
                        {
                          var lastPick = picker._internal.values.pop();
                          if (lastPick != null)
                           {
                             var lastPickedElement = SuperDOM.getElement(picker._internal.elementId+'_PICKER``'+lastPick.value+'``'+lastPick.label);
                             if (lastPickedElement != null)
                              {
                                SuperDOM.removeCSS(lastPickedElement, "selected");
                              }
                           }
                        }
                       picker._internal.values.push(v);
                     }
                    else
                     picker._internal.values.removeValue(v.value, "value");
                    setValues(picker);
                    return;
                 }
              }
             e = e.parentNode;
           }
        });
    }
   
   DataFetcherRegistry.addAndRunFetchers(picker._dataDef, function() {
        var args = [picker._internal.elementId+'_PICKER', picker._internal.values];
        if (picker._obj.getValues != null)
         args.push(picker._internal.multi);
        for (var i = 0; i < arguments.length; ++i)
         args.push(arguments[i]);
        setTimeout(function() { picker._obj.render.apply(picker._obj, args); setValues(picker); }, 200);
     }, "Picker "+picker._internal.elementId);
 };

function setValues(picker)
 {
//   console.log("setValues() -> Values: ", picker._internal.values, ";");
   var Str = "";
   if (picker._internal.values != null && picker._internal.values.length > 0)
    {
      for (var i = 0; i < picker._internal.values.length; ++i)
       Str+=picker._internal.values[i].label+'&nbsp;<A href="javascript:FloriaFactories.PickerRegistry.remove(\''+picker._internal.elementId+'\', \''+picker._internal.values[i].value+'\')"><img src="/static/img/delete.gif" height="10px" valign="absmiddle"></A>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    }
   else
    {
      Str = '<IMG src="/static/img/warning.gif" height="20px" align="absmiddle">No value selected.';
    }
   SuperDOM.setInnerHTML(picker._internal.elementId+"_VALUES", Str);
   SuperDOM.setInnerHTML(picker._internal.elementId+"_PICKER_VALUES(2)", Str);
   //console.log(picker._internal.elementId+"_VALUES -> "+Str);
   var v = "";
   for (var i = 0; i < picker._internal.values.length; ++i)
    {
      if (v.length != 0)
       v+="``";
      v+=picker._internal.values[i].value;
    }
   var elementName= picker._internal.elementId+'_'+picker._internal.name;
   var e = SuperDOM.getElement(elementName);
   if (e != null)
     e.value=v;
   else
     console.error("Cannot find element "+elementName+" to set the picker value");
 }

function pick(picker)
 {
   //console.log("PickerRegistry.pick: start");
   if (picker._obj.getValues != null)
    {
      var vals = picker._obj.getValues(picker._internal.elementId+'_PICKER');
      picker._internal.values = vals == null ? [] : vals;
    }
   //console.log("PickerRegistry.pick: calling setValues()");
   setValues(picker);
   //console.log("PickerRegistry.pick: end");
 };

PickerRegistry.pick = function(elementId)
 {
   var picker = pickers[elementId];
   if (picker == null)
    SuperDOM.alertThrow("Unknown picker "+elementId);
   pick(picker);
 }

PickerRegistry.remove = function(elementId, value)
 {
   var picker = pickers[elementId];
   if (picker._internal.values != null && picker._internal.values.length > 0)
    {
      picker._internal.values.removeValue(value, "value");
      setValues(picker);
      if (picker._obj.getValues == null) // managed picker
       {
//         if (elementId.endsWith("_VALUES") == true)
//           elementId = elementId.substring(0, elementId.length-"_VALUES".length);
         elementId+='_PICKER``'+value+'``';
         var e = document.querySelectorAll('*[id^="'+elementId+'"]');
         if (e != null && e.length == 1)
          e = e[0];
         //document.getElementById(elementId);
         if (e != null)
          SuperDOM.toggleCSS(e, "selected");
       }
      else if (picker._obj.removeValue != null)
        picker._obj.removeValue(value);
    }
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



if (window.FloriaFactories == null)
 window.FloriaFactories = { };
window.FloriaFactories.TileRegistry = TileRegistry;
window.FloriaFactories.PickerRegistry = PickerRegistry;




return { FactoryRegistry: FactoryRegistry, DataFetcherRegistry: DataFetcherRegistry, RowPainterRegistry: RowPainterRegistry, TileRegistry: TileRegistry, PickerRegistry: PickerRegistry };

});

