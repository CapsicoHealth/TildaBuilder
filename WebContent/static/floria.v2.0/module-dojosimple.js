"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DojoSimple
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import { FloriaDOM    } from "./module-dom.js";
//import { FloriaLogin  } from "./module-login.js";

export var DojoSimple = { };

//DojoSimple.PopupLogin    = FloriaLogin.PopupLogin;
//DojoSimple.PopupSignup   = FloriaLogin.PopupSignup;
//DojoSimple.ForgotPswd    = FloriaLogin.ForgotPswd;
//DojoSimple.SetPassword   = FloriaLogin.SetPassword;
//DojoSimple.Account       = FloriaLogin.Account;
//DojoSimple.Verifications = FloriaLogin.Verifications;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  DojoSimple ajaxUrl
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ajaxUrl = function(Url, Method, ErrorMsg, SuccessFunc, ErrorFunc, PostContents, Timeout, handleAs)
  {
    if (PostContents != null && Method != 'POST')
     FloriaDOM.alertThrow("Error: you cannot post data in a non POST ajax request");
    dojo.xhr(Method, {
      url : Url,
      content: PostContents,
      method : Method,
      errorMsg : ErrorMsg,
      successFunc : SuccessFunc,
      errorFunc : ErrorFunc,
      load : function(data, ioArgs)
        {
          try
            {
              if (ioArgs.xhr.getResponseHeader("x-wanda-canceler") == "1")
                alert("FYI THAT YOU CANCELED ANOTHER REQUEST!\n\nYou (or another user on the same account) was running a request you interrupted.");

              if (data == null)
                throw ("An error occurred: no JSON data for " + this.url);
              if (data.code == undefined)
                throw ("An error occurred: invalid JSON data for " + this.url);
              
              if (data.code == 401 && FloriaLogin.PopupLogin.isAuthPassthrough(Url) == false)
                {
                  var lthis = this;
                  FloriaLogin.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
                }
              else if (data.code != 200)
                this.error({ code: data.code, message : data.msg, errors: data.errors, type: data.type }, ioArgs);
              else
               {
                 if (data.perfMessage != null)
                  setTimeout(function(){ alert(data.perfMessage); }, 10);
                 if (this.successFunc != null)
                  this.successFunc(data.data);   
               }
            }
          catch (e)
            {
              FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxUrl.load()\nFrom: "+this.successFunc+"\nError: ", true);
            }
        },
      error : function(error, ioArgs)
        {
          console.error("DojoSimple.ajaxUrl error: ", error);
          try
            {
              if (error != null && error.status == 401 && FloriaLogin.PopupLogin.isAuthPassthrough(Url) == false)
               {
                 var lthis = this;
                 FloriaLogin.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
               }
              else
                {
                  if (error.type == 'CANCELED')
                    alert("YOUR REQUEST WAS CANCELED!\n\nYou (or another person using the same account) have just invoked the same data from another browser window.");
                  else if (error.type == 'DEADLOCKED')
                    alert("YOUR REQUEST DEADLOCKED!\nA database issue has occurred that caused your request to deadlock with another request.");

                  var msg = error == null ? null : error.message != null ? error.message : error.msg;
                  if (this.errorMsg != null)
                    {
                      var Str = this.errorMsg;
                      if (msg != null)
                       Str+="\n"+msg;
                      if (error.errors != null && error.errors.length != 0)
                       for (var i = 0; i < error.errors.length; ++i)
                        Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                      alert(Str);
                    }
                  if (this.errorFunc != null)
                   this.errorFunc(error.code, msg, error.errors, error.type);
                }
            }
          catch (e)
            {
              FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxUrl.error()\nFrom: "+this.errorFunc+"\nError: ", true);
            }
        },
      timeout : Timeout==null?90000:Timeout,
      handleAs : handleAs==null?'json':handleAs
    });
  };
  

DojoSimple.ajaxUrlMulti = function(AjaxInfos, Func)
  {
    var results=[];
    var createNestedFunc = function(ajaxInfo, previousF)
     {
       return function(data) { if (data != null) results.push(data); DojoSimple.ajaxUrl(ajaxInfo.url, "GET", ajaxInfo.error, previousF, previousF); };
     }
    var f = function(data) { if (data != null) results.push(data); Func(results); };
    for (var i = AjaxInfos.length-1; i >= 0; --i)
     f = createNestedFunc(AjaxInfos[i], f);
    setTimeout(f, 1);
  }


// Launched a Url using the regular AjaxUrl facility but expects it to take some time before it returns (long running Job).
// While the job is running, launches a secondary Polling URL, with a handler and an interval check in seconds. The PollHandler
// function takes the result from the PollUrl and is expected to return the next PollUrl. If PollUrl is given NULL, an error
// occurred.
DojoSimple.ajaxUrlLongRunningJob = function(Url, ErrorMsg, SuccessFunc, ErrorFunc, PostContents, TimeoutSecs, PollUrl, PollHandler, PollIntervalSecs, canTimeout)
  {
    var done = false;
    var loop = function() {
      DojoSimple.ajaxUrl(PollUrl, "GET", null
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
    DojoSimple.ajaxUrl(Url, "GET", ErrorMsg, function(data) {
         done = true;
//         alert("done!!!!");
         SuccessFunc(data);
      }, ErrorFunc, PostContents, TimeoutSecs*1000);
    setTimeout(loop, 1000);
  }

  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxForm
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ajaxForm = function(FormId, ErrorMsg, SuccessFunc, ErrorFunc)
  {
    require(["dojo/io/iframe"], function(dojoIFrame) {
      var f = document.getElementById(FormId);
      var toto = {
        method : "POST",
        form : f,
        url : f.action,
        errorMsg : ErrorMsg,
        successFunc : SuccessFunc,
        errorFunc : ErrorFunc,
        load : function(data, ioArgs)
          {
            try
              {
                if (data == null)
                  throw ("An error occurred: no JSON data from the form" + FormId);
                if (data.code == undefined)
                  throw ("An error occurred: invalid JSON data from the form " + FormId);
                if (data.code == 401 && FloriaLogin.PopupLogin.isAuthPassthrough(f.action) == false)
                  {
                    var lthis = this;
                    FloriaLogin.PopupLogin.show(true, function()
                      { 
                        if (f.enctype == "multipart/form-data")
                         dojoIFrame.send(lthis);                            
                        else
                         dojo.xhr(lthis.method, lthis);
                      });
                  }
                else if (data.code != 200)
                  this.error(data, ioArgs);
                else if (this.successFunc != null)
                  this.successFunc(data.data);
              }
            catch (e)
              {
                FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxForm.load()\nFrom: "+this.successFunc+"\nError: ", true);
              }
          },
        error : function(error, ioArgs)
          {
            try
              {
                console.error("DojoSimple.ajaxForm error: ", error);
                if (error != null && error.status == 401 && FloriaLogin.PopupLogin.isAuthPassthrough(f.action) == false)
                 {
                    var lthis = this;
                    FloriaLogin.PopupLogin.show(true, function()
                        { 
                          if (f.encoding == "multipart/form-data")
                            dojoIFrame.send(lthis);
                          else
                            dojo.xhr(lthis.method, lthis);
                        });
                 }
               else
                 {
                    var Str = this.errorMsg;
                    var msg = error == null ? null : error.message != null ? error.message : error.msg;
                    if (f.encoding == "multipart/form-data" && msg == "doc.getElementsByTagName(...)[0] is undefined")
                     console.error("if you are using a framework like Dojo, the result JSON data must be returned inside a TEXTAREA element in an HTML response.")
                    if (msg != null)
                     Str+="\n"+msg;
                    if (error.errors != null && error.errors.length != 0)
                     for (var i = 0; i < error.errors.length; ++i)
                      Str+="\n  - "+error.errors[i].p+': '+error.errors[i].m;
                    if (this.errorMsg != null)
                     alert(Str);
                    if (this.errorFunc != null)
                     this.errorFunc(error.code, msg, error.errors);
                 }
              }
            catch (e)
              {
                FloriaDOM.alertException(e, "Caught exception in DojoSimple.ajaxForm.error()\nFrom: "+this.errorFunc+"\nError: ", true);
              }
          },
        timeout : 90000,
        handleAs : 'json'
        };
      if (f.encoding == "multipart/form-data")
        dojoIFrame.send(toto);
      else
        dojo.xhr("POST", toto);
    });
  };




 

window.DojoSimple = DojoSimple;


