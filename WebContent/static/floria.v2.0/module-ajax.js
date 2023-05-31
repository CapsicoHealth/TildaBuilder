'use strict';

import { FloriaDOM } from "./module-dom.js";
import { FloriaLogin } from "./module-login.js";

export var FloriaAjax = {

ajaxUrl: function(url, method, errorMsg, successFunc, errorFunc, postContents, timeout, handleAs)
  {
    if (postContents != null)
     {
        if (method != 'POST')
         return FloriaDOM.alertThrow("Error: you cannot post data in a non POST ajax request");
        url = url + "?" + (FloriaDOM.isObject(postContents) == true ? FloriaDOM.makeUrlParams(postContents) : postContents);
     }
         
    // Is this used at all anymore?????
    if (handleAs != null && handleAs != 'json' && handleAs != 'jsonX')
     {
       alert("FloriaAjax.ajaxUrl called with handleAs: '"+handleAs+"'. Check consle logs for stack trace.\n\nThis was deprecated!");
       console.trace();
       return;
     }

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = timeout
    xhr.setRequestHeader("Content-type", "application/"+(handleAs||'json')+"; charset=utf-8");
    if (handleAs==null || handleAs=='json')
     xhr.responseType = 'json';
    else if (handleAs=='jsonX')
     xhr.responseType = 'text';
    
    xhr.onload = function() {
      try
        {
          if (xhr.getResponseHeader("x-wanda-canceler") == "1")
            alert("FYI THAT YOU CANCELED ANOTHER REQUEST!\n\nYou (or another user on the same account) was running a request you interrupted.");

          let data = handleAs=='jsonX' ? FloriaDOM.jsonParseWithComments(xhr.response) : xhr.response;
          if (data?.code != 200 || xhr.status != 200)
           return xhr.onerror({code: data?.code||xhr.status, message : data?.msg||xhr.statusText, errors: data?.errors, type: data?.type });
          if (data == null)
            throw ("An error occurred: no data for " + FloriaDOM.truncateUrl(url));
          if (data.code == undefined)
            throw ("An error occurred: invalid JSON data for " + FloriaDOM.truncateUrl(url));

          if (data.perfMessage != null)
           setTimeout(function(){ alert(data.perfMessage); }, 10);
          if (successFunc != null)
           successFunc(data.data);   
        }
      catch (e)
        {
          FloriaDOM.alertException(e, "Caught exception in AjaxRequest.ajaxUrl.onload()\nUrl:"+url+"\nFrom: "+successFunc+"\nError: ", true);
        }
    };
    xhr.onerror = function(error) { // only triggers if the request couldn't be made at all
      console.error("ajaxUrl error: ", error);
      try
        {
          if (error != null && error.status||error.code == 401 && FloriaLogin.PopupLogin.isAuthPassthrough(url) == false)
           {
//             return alert("NO ACL!");
             return FloriaLogin.PopupLogin.show(true, function() { FloriaAjax.ajaxUrl(url, method, errorMsg, successFunc, errorFunc, postContents, timeout, handleAs) });
           }
          else
            {
              if (error.type == 'CANCELED')
                alert("YOUR REQUEST WAS CANCELED!\n\nYou (or another person using the same account) have just invoked the same data from another browser window.");
              else if (error.type == 'DEADLOCKED')
                alert("YOUR REQUEST DEADLOCKED!\nA database issue has occurred that caused your request to deadlock with another request.");

              var msg = error == null ? null : error.message != null ? error.message : error.msg;
              if (errorMsg != null)
                {
                  var Str = errorMsg;
                  if (msg != null)
                   Str+="\n"+msg;
                  if (error.errors != null && error.errors.length != 0)
                   for (var i = 0; i < error.errors.length; ++i)
                    Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                  alert(Str);
                }
              if (errorFunc != null)
               errorFunc(error.code||error.status, msg, error.errors, error.type);
            }
        }
      catch (e)
        {
          FloriaDOM.alertException(e, "Caught exception in ajaxUrl.error()\nUrl:"+url+"\nFrom: "+errorFunc+"\nError: ", true);
        }
    };
    xhr.ontimeout = function() {
      alert("TIMEOUT!");
    };
    xhr.send();
  },
  
ajaxUrlMulti: function(AjaxInfos, Func)
  {
    var results=[];
    var createNestedFunc = function(ajaxInfo, previousF)
     {
       return function(data) { if (data != null) results.push(data); FloriaAjax.ajaxUrl(ajaxInfo.url, "GET", ajaxInfo.error, previousF, previousF); };
     }
    var f = function(data) { if (data != null) results.push(data); Func(results); };
    for (var i = AjaxInfos.length-1; i >= 0; --i)
     f = createNestedFunc(AjaxInfos[i], f);
    setTimeout(f, 1);
  },
  
// Launches a Url using the regular AjaxUrl facility but expects it to take some time before it returns (long running Job).
// While the job is running, launches a secondary Polling URL, with a handler and an interval check in seconds. The PollHandler
// function takes the result from the PollUrl and is expected to return the next PollUrl. If PollUrl is given NULL, an error
// occurred.
ajaxUrlLongRunningJob: function(Url, ErrorMsg, SuccessFunc, ErrorFunc, PostContents, TimeoutSecs, PollUrl, PollHandler, PollIntervalSecs, canTimeout)
  {
    var done = false;
    var loop = function() {
      FloriaAjax.ajaxUrl(PollUrl, "GET", null
                        ,function(data) {
                            if (data != null)
                             {
                               PollUrl = PollHandler(data);
                               if (done == false && PollUrl != null)
                                setTimeout(loop, PollIntervalSecs*1000);
                             }
                            else if (done == false)
                             {
                               PollHandler(null);
                             }
                          }
                        ,function(data) {
                            PollHandler(null);
                          }
                        );
     };
    FloriaAjax.ajaxUrl(Url, "GET", ErrorMsg, function(data) {
         done = true;
//         alert("done!!!!");
         SuccessFunc(data);
      }, ErrorFunc, PostContents, TimeoutSecs*1000);
    setTimeout(loop, 1000);
  },
  
jsonSyncFetch: async function(url, strict, raw)
  {
    const response = await fetch(url);
    if (response.ok == false)
     return FloriaDOM.consoleThrow("The json URL '"+url+"' could not be fetched: "+response.status+" "+response.statusText);
    const json = strict == true ? await response.json()
                                : FloriaDOM.jsonParseWithComments(await response.text())
                                ;
    return raw == true ? json : json.data;
  }
  
};
