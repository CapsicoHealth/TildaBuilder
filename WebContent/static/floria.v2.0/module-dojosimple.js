"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DojoSimple
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import { FloriaDOM } from "./module-dom.js";
import { FloriaText } from "./module-text.js";
import { FloriaDate } from "./module-date.js";

import { createPopper } from "/static/jslibs/popperjs/popper.js";

export var DojoSimple = {};

var cacheBuster = new Date().getTime();


require(["dijit/dijit", "dojo/dom", "dojo/dom-construct"], function(dojoDijit, dojoDom, domConstruct) {

DojoSimple.HeaderBodyFooterLayout = function(MainId, initFunc)
 {
   require(["dijit/layout/BorderContainer", "dijit/layout/ContentPane"], function (BorderContainer, ContentPane) {
       try
        {
          var MainContainer   = new BorderContainer({ gutters : false  }, dojoDom.byId(MainId));
          var HeaderContainer = new ContentPane    ({ region : 'top'   }, dojoDom.byId(MainId+"_HEADER"));
          var FooterContainer = new ContentPane    ({ region : 'bottom'}, dojoDom.byId(MainId+"_FOOTER"));
          var ClientContainer = new ContentPane    ({ region : 'center'}, dojoDom.byId(MainId+"_BODY"  ));
          MainContainer.startup();
          if (initFunc != null)
           initFunc();
        }
       catch (e)
        {
          FloriaDOM.alertException(e);
        }
    });
//   require(["dojox/widget/Dialog","dojo/fx/easing"], function(Dialog, Easing) {});
  }


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __DIALOGS = [];
var __hiding = false; // global flag to manage overlapping dialog functionality, e.g., hiding one while showing another

function printDialogStack()
 {
//   for (var i = 0; i < __DIALOGS.length; ++i)
//    console.log(""+i+__DIALOGS[i]._md.id+" ("+__DIALOGS[i]._md.style.display+")");
 }

DojoSimple.Dialog = function(elementId)
 {
   this._e = document.getElementById("MASTER_MODEL_BACKGROUND");
   if (this._e == null)
    {
      this._e = document.createElement('div');
      this._e.id = "MASTER_MODEL_BACKGROUND";
      this._e.classList.add("modalBackground");
      document.body.appendChild(this._e);
    }
   this._md = document.getElementById(elementId);
   if (this._md == null)
    {
      this._md = document.createElement('div');
      this._md.id = elementId;
      this._md.classList.add("modalDialog");
      this._md.innerHTML = '<DIV class="modalTitle"><SPAN id="'+elementId+'_MD_TITLE"></SPAN><SPAN id="'+elementId+'_MD_CLOSE"></SPAN></DIV>'
                          +'<DIV class="modalContent" id="'+elementId+'_MD_CNT"></DIV>'
                         ;
      this._e.appendChild(this._md);
    }

   var that = this;
   FloriaDOM.addEvent(elementId+"_MD_CLOSE", "click", function() {
     that.hide();
   })
       
   this.setOnHide = function(func)
    {
      this._onHideHandler = func;
    };
   this.setOnLoad = function(func)
    {
      this._onLoadHandler = func;
    };
   this.show = function(title, url, w, h, contents, recall)
    {
      var that = this;
      console.log("dialog.show() - "+this._md.id)
      if (__hiding == true && recall == null)
       return setTimeout(function() { that.show(title, url, w, h, contents, true); }, 300); // 500 is the hiding delay, so we undershoot a little
      else
       __hiding = false;
       
      var repaint = false;
      if (__DIALOGS.length > 0)
       {
         // push down and slide down previous dialog
         var lastDialog = __DIALOGS[__DIALOGS.length-1];
         // If we are repainting the current popup, then we can't tuck it away. 
         if (lastDialog._md.id == this._md.id)
          repaint = true;
         else
          {
            lastDialog._md.style.top = "110%";
            lastDialog._md.style.opacity="";
            lastDialog._md.style.zIndex=0;
          }
       }

      // Paint title
      var t = this._md.childNodes[0].childNodes[0]; // first child element -> modalTitle, then first element is first SPAN
      t.innerHTML = title;

      if (repaint == false)
       {
         __DIALOGS.push(this);
         // Set the dialog's size
         this._w = w > 0.98 ? 98 : w < 0.2 ? 2 : 100*w;
         this._h = h > 0.98 ? 98 : h < 0.2 ? 2 : 100*h;
         this._md.style.width=this._w+"%";
         this._md.style.height=this._h+"%";
         this._md.style.left=((100-this._w)/2)+"%";
         this._md.style.top = "-25%"; //((100-this._h)/2)+"%"; // new comes from the top
         this._md.style.zIndex=1000+__DIALOGS.length;
           
         // Unhide everything as a setTimeout to trigger animations if any
         setTimeout(function() { 
           that._e.style.opacity=1;
           that._e.style.left=0;
           that._md.style.opacity=1;
           that._md.style.top = ((100-that._h)/2)+"%";
         }, 10);
       }
          
      // Paint the dialog's content
      if (url != null)
       {
         // We can load HTML dynamically, and in doing so, we need to execute the script blocks if any
         fetch(url).then(response => response.text()) 
                   .then(function(html) { 
                       that._md.childNodes[1].innerHTML = html;
                       Array.from(that._md.childNodes[1].querySelectorAll("script"))
                            .forEach( oldScript => {
                               const newScript = document.createElement("script");
                               Array.from(oldScript.attributes)
                                    .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
                               newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                               oldScript.parentNode.replaceChild(newScript, oldScript);
                       });
                      if (that._onLoadHandler != null)
                       that._onLoadHandler();
                   });
          return;
       }
      
      if (typeof contents == "string")
       this._md.childNodes[1].innerHTML = contents;
      else if (contents != null)
       contents(this._md.id+"_MD_CNT"); // second element, i.e., the modalContent
      if (that._onLoadHandler != null)
       that._onLoadHandler();
    }
   this.setContent = function(contents)
    {
      this._md.childNodes[1].innerHTML = contents;
    }
   this.hide = function()
    {
      console.log("dialog.hide() - "+this._md.id);
//      console.trace();
      var that = this;

      var topDlg = __DIALOGS.pop();
      if (topDlg != null && topDlg._md.id != this._md.id) // hide is being called twice on the same object
       {
         __DIALOGS.push(topDlg);
         return;
       }
      
      __hiding = true;

      if (that._onHideHandler != null)
       that._onHideHandler();

      // It's possible for someone to close a dialog and re-open a new one right away.
      // Because of the timeouts below for animation effects, we hve to "capture" this._md
      // before it gets overwritten by the following show().
      var that_md = that._md;       
      // Reset items to default (from css)
      setTimeout(function(){
        that_md.style.top="-25%";
        that_md.style.opacity="0";
        that_md.style.zIndex=0;
        __hiding = false;
      }, 10);

      // sliding back in the previous dialog
      if (__DIALOGS.length > 0)
       {
          var lastDialog = __DIALOGS[__DIALOGS.length-1];
          lastDialog._md.style.opacity="1";
          lastDialog._md.style.top = ((100-lastDialog._h)/2)+"%";
          lastDialog._md.style.zIndex=1000+__DIALOGS.length;
       }
      else
       setTimeout(function(){
         that._e.style.opacity="0";
         setTimeout(function(){
           if (__DIALOGS.length == 0) // Only move out the background div and clear the node if we cleared the whole stack
            {
              that._e.style.left="";
              that_md.childNodes[1].innerHTML = '';
            }
         }, 500);
       }, 10);
    }
 };


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ContentPane
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ContentPane = function(Id)
  {
    var that = this;
    require(["dijit/layout/BorderContainer", "dijit/layout/ContentPane"],
      function(BorderContainer, ContentPane)
        {
          that.url = null;
          that.pane = new ContentPane({}, Id);
// that.pane = new dojox.layout.ContentPane({}, Id);
        });
  };
DojoSimple.ContentPane.prototype.Load = function(Url, onLoadFunc)
  {
    this.url = Url;
    this.pane.attr("href", Url);
    if (onLoadFunc != null)
     this.pane.olFunc = this.pane.connect(this.pane, "onDownloadEnd", function()
          {
            this.disconnect(this.olFunc);
            OnLoadFunc();
          });
    var lthis = this;
    this.dlg.oeFunc = this.dlg.connect(this.dlg, "onDownloadError", function(error)
      { this.disconnect(this.oeFunc);
        if (error.status==401)
         DojoSimple.PopupLogin.show(true, function() { lthis.show(Title, Url, WidthPercent, HeightPercent); });
        else
         alert("Error fetching the page:\n   "+Url+"\n   "+error.status);
      });
  };
DojoSimple.ContentPane.prototype.setContents = function(Contents)
  {
    this.pane.attr("content", Contents);
  };

  

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Calendar
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Calendar = function(containerId, elementId, onValueSelectedFunc, min, datePattern, v, fieldName)
  {
    this.elementId = elementId;
    var that = this;

    var newItem = document.createElement("INPUT");
    newItem.setAttribute("type","hidden");
    newItem.setAttribute("id",elementId);
    newItem.setAttribute("name",fieldName);
    newItem.setAttribute("value",v==null?"":v);
    var e = document.getElementById(containerId);
    e.parentNode.insertBefore(newItem, e);
    
    require(["dojo/parser", "dijit/form/DateTextBox"
        ], function(Parser, Calendar){
           that.cal = dojoDijit.byId(containerId);
           if (that.cal != null)
             that.cal.destroy();
           that.cal = new Calendar({
                 value: FloriaDate.parseDateTime(v),
                 constraints: {min:min, datePattern : datePattern==null?'yyyy-MMM-dd':datePattern},
                 onChange : function(d) {
//                   alert("d: "+d+"; typeof d: "+typeof d+";");
                   document.getElementById(elementId).value= d==null?'':d.toISOString();
                 if (onValueSelectedFunc)
                    onValueSelectedFunc(d);
                 }
             }, containerId);
           that.cal.startup();
       });
     this.destroy = function()
      {
        this.cal.destroy();
      }
     this.setValue = function(val)
      {
        if (val == null)
         val = FloriaDOM.getElement(elementId, "Cannot find calendar element '"+elementId+"'.").value;
        this.cal.set('value', FloriaDate.parseDateTime(val));
      }
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple PopupLogin
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.PopupLogin = {
  loginUrl  : null,
  logoutUrl : null,
  isAuthPassthrough: function(path)
    {
      var authPassthroughs = window.authPassthroughs || [];
      var bool = false;
      authPassthroughs.some(function(authPassthrough)
          {
            bool = path.indexOf(authPassthrough) != -1;
            return bool;
          })
      return bool;
    },
  setUrls : function(basePath, login, logout, help)
    {
      DojoSimple.PopupLogin.basePath = basePath;
      DojoSimple.PopupLogin.loginUrl = login;
      DojoSimple.PopupLogin.logoutUrl = "/"+basePath+"/"+logout;
      DojoSimple.PopupLogin.helpUrl = help;
      require(["dojo/cookie"], function(Cookie){
          DojoSimple.PopupLogin.dojoCookie = Cookie;
        });
    },
  loggedIn : false,
  dlgHandle: null,
  showError: function(code, msg, errors)
  {
    var element = FloriaDOM.getElement("MESSAGES", null);
    msg = msg.replaceAll("\n", "<BR>");
    if(element == null)
      {
        alert(msg+"\n\n"+errors.join("\n"));
      }
    else
      {
        var HTML = '<span style="color: red !important;">'+msg+"</span>";
        if(errors != null && errors.length != 0 && errors instanceof Array)
          {
            HTML += '<ul style="color: red !important;">';
            errors.forEach(function(error)
                {
                  HTML += "<li>"+error.p+': '+error.m+"</li>";
                })
           HTML += "</ul>";
          }
        FloriaDOM.setInnerHTML("MESSAGES", HTML);
      }
  },
  init: function(elementIdBase)
    {
      var c = this.dojoCookie("REMEMBERME");
      if (c == null)
       return;
      var e = document.getElementById(elementIdBase+"RememberMe");
      if (e != null)
        e.checked = true;
      e = document.getElementById(elementIdBase+"Email");
      if (e != null)
        e.value=c;
      e = document.getElementById(elementIdBase+"Password");
      if (e != null)
       e.focus();
    },
   createPopup : function(onSuccessFunc, errorMessage, title, url, width, height, Contents)
    {
      width = width || 0.8;
      height = height || 0.66;
      
      if (Contents == null && url == null)
        FloriaDOM.alertThrow(errorMessage);
      if (DojoSimple.PopupLogin.dlgHandle == null)
       DojoSimple.PopupLogin.dlgHandle = new DojoSimple.Dialog("DLG_POPUPLOGIN");
      if (onSuccessFunc != null)
       DojoSimple.PopupLogin.dlgHandle.setOnHide(onSuccessFunc);
      // There seems to be an issue sometimes with caching of HTML pages... So we are doing these shenanigans.
      if (url.indexOf("?") == -1)
       url += "?";
      url+="&ts="+cacheBuster;
      DojoSimple.PopupLogin.dlgHandle.show(title, url, width, height, Contents);
    },
  hide : function()
   {
     DojoSimple.PopupLogin.dlgHandle.hide();
   },
  show : function(Timeout, onSuccessFunc, titleMsg)
    {
      titleMsg = titleMsg || (Timeout == true ? "Your session has timed out: please login again" : "Please login")
      this.createPopup(onSuccessFunc, "The default url for the popup Login panel has not been set"
                ,titleMsg
                ,DojoSimple.PopupLogin.loginUrl);
    },
  signIn : function(elementIdBase)
    {
      var Email = FloriaDOM.getElement(elementIdBase+"Email", "Please enter a username and password").value;
      var Pswd = FloriaDOM.getElement(elementIdBase+"Password", "Please enter a password").value;

      var e = document.getElementById(elementIdBase+"RememberMe");
      var v = e == null ? false : e.checked;
      this.dojoCookie("REMEMBERME", v==true ? Email:"", { expires : v==true ? 30:-1, path : "/" });
      
      DojoSimple.ajaxUrl("/"+DojoSimple.PopupLogin.basePath+"/svc/Login?email=" + encodeURIComponent(Email) + "&pswd=" + encodeURIComponent(Pswd), "POST", null, DojoSimple.PopupLogin.signInOK, DojoSimple.PopupLogin.signInErr);
      return false;
    },
  signInOK : function(data)
    {
      var tenants = data.tenants
      if(tenants != null)
        {
//          alert("Tenant");
          DojoSimple.PopupLogin.tenantsSelect(data.tenants);
          return;
        }
      var eulaUrl = data.eulaUrl;
      if (eulaUrl != null)
        {
//          alert("Eula");
//          alert("DojoSimple.PopupLogin.dlgHandle: "+DojoSimple.PopupLogin.dlgHandle);
          DojoSimple.PopupLogin.eula(data);
          return;
        }

//      alert("OK TO LOG IN");
//      FloriaDOM.setInnerHTML("HEADER_ACCOUNT", '<A href="javascript:DojoSimple.PopupLogin.logout();"><IMG height="50px" src="/static/img/logout.big.png"></A>');
      DojoSimple.PopupLogin.loggedIn = true;
      if (DojoSimple.PopupLogin.dlgHandle != null)
       DojoSimple.PopupLogin.dlgHandle.hide();
    },
  signInErr : function(code, msg, errors)
    {
      if (code == 403)
        {
          var loginCallBack = function(){ window.location.reload(); };
          var titleMessage = "Your password has expired please reset your password.";
          var popUpInfoMessage = "You should be receiving an email shortly with instructions to reset your password."
          DojoSimple.SetPassword.show(window.successLogin || loginCallBack, titleMessage, popUpInfoMessage);
        }
      else
        {
          DojoSimple.PopupLogin.showError(code, msg, errors);
        }
    },
  logout : function()
    {
      DojoSimple.ajaxUrl("/"+DojoSimple.PopupLogin.basePath+"/svc/Logout", "GET", "Cannot logout", DojoSimple.PopupLogin.logoutOK, DojoSimple.PopupLogin.logoutErr);
    },
  logoutOK: function(data)
   {
      DojoSimple.PopupLogin.loggedIn = false;
      document.location.href=DojoSimple.PopupLogin.logoutUrl;
   },
  logoutErr: function(data)
   {
      alert("Error logging out!");
   },
  help : function()
    {
      DojoSimple.PopupLogin.createPopup(null, "No help available", "Quick Help", DojoSimple.PopupLogin.helpUrl, .6, .85);
    },
  PickTenant: function(TenantId)
    {
      DojoSimple.ajaxUrl("/"+DojoSimple.PopupLogin.basePath+"/svc/Login?tenantUserRefnum=" + TenantId, "POST", "Cannot login", DojoSimple.PopupLogin.signInOK, DojoSimple.PopupLogin.signInErr);
      return false;
    },
  tenantsSelect : function(tenants)
    {
    var html = "<DIV class=\"fullCenter capsicoLogo\" style=\"max-height: 80%;overflow: auto;margin-top: 3%\">"
              +"<TABLE cellspacing=\"10px\" border=\"0px\" style=\"font-size:125%; color:black; margin: 0px;padding-bottom:8px\">"
              +"<TR><TD colspan=\"3\">You have successfully logged in and you have access to the following systems.</TD></TR>"
              +"<TR><TD colspan=\"3\">Please select one..</TD></TR>"
              ;
    var tds = []
    var i,j,temparray,chunk = 3;
    for(i=0; i<tenants.length;i++)
      {
        var tenant = tenants[i];
        var element  = "<td style=\"border-radius: 5px; border: 1px solid grey;\">" +
            "<A style=\"text-align: center; padding: 35px; display: block;\" href=\"#\" onclick=\"DojoSimple.PopupLogin.PickTenant("+tenant.tenantUserRefnum+");\">"+tenant.name+"</A>" +
            "</td>";
        tds.push(element);
        if((i+1) % 3 == 0)
          {
            html += "<tr>"+tds.join("")+"</tr>";
            tds = [];
          }
      }
    if(tds.length > 0)
      html += "<tr>"+tds.join("")+"</tr>";

    html += "</TABLE></DIV>";

    DojoSimple.PopupLogin.dlgHandle.setTitle("Select A System");
    DojoSimple.PopupLogin.dlgHandle.setContent(html);
    },
    
   eula: function(data)
    {
      require(["dojo/text!"+data.eulaUrl], function(eulaHtml) {
         eulaHtml+='<HR/><CENTER><FORM id="EULA_FORM" onSubmit="return DojoSimple.PopupLogin.acceptEula(\'EULA_FORM\');">'
                  +'<input type="hidden" name="tenantUserRefnum" value="'+data.tenantUserRefnum+'">'
                  +'<input type="hidden" name="eulaToken" value="'+encodeURIComponent(data.eulaToken)+'">'
//                  +'Sign your name: <input type="text" name="name"><BR>'
                  +'I accept this EULA: <input type="checkbox" name="accept" value="1" width="50%"><BR><BR>'
                  +'<BUTTON id="login-Eula" type="submit" title="Submit">Submit</BUTTON><BR><BR>'
                  ;
         DojoSimple.PopupLogin.dlgHandle.setTitle("End User License Agreement");
         DojoSimple.PopupLogin.dlgHandle.setContent(eulaHtml);
      });
    },
   acceptEula: function(formId)
    {
      var f = document.getElementById(formId);
      var tenantUserRefnum = f.tenantUserRefnum.value;
      var eulaToken = f.eulaToken.value;
      var accept = f.accept.checked == true ? 1 : 0;
      DojoSimple.ajaxUrl("/"+DojoSimple.PopupLogin.basePath+"/svc/Login?tenantUserRefnum=" + tenantUserRefnum + "&eulaToken=" + eulaToken + "&accept=" + accept, "POST", null, DojoSimple.PopupLogin.signInOK, DojoSimple.PopupLogin.eulaFail);
      return false;
    },
   eulaFail: function(data)
    {
      alert("You must accept the EULA before continuing.");
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple PopupSignup
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.PopupSignup = {
  Token : null,
  Url: null,
  ElementIdBase: null,
  setUrls : function(basePath, Url, Token)
   {
     DojoSimple.PopupSignup.basePath = basePath;
     DojoSimple.PopupSignup.Url = Url;
     DojoSimple.PopupSignup.Token = Token;
   },
  init: function(elementIdBase, guest)
   {
     DojoSimple.PopupSignup.guest = guest;
     DojoSimple.PopupSignup.ElementIdBase = elementIdBase;
     this.passwordUI = new DojoSimple.PasswordUI(elementIdBase+"password");
     if (guest != true)
      DojoSimple.PopupSignup.getTokenDetails();
   },
  show: function(onSuccessFunc) 
   {
     DojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Signup has not been set"
         ,"Sign Up"
         ,DojoSimple.PopupSignup.Url, 0.7, 0.8);
   },
  getTokenDetails: function() 
   {
     DojoSimple.ajaxUrl("/"+DojoSimple.PopupSignup.basePath+"/svc/user/token?token="+DojoSimple.PopupSignup.Token, "GET", null, DojoSimple.PopupSignup.TokenDetailsOK, DojoSimple.PopupSignup.TokenDetailsErr);
   },
  signUp : function(elementIdBase)
   {
     if (DojoSimple.PopupSignup.guest == true)
      {
        var email = FloriaDOM.getElement(elementIdBase+"email", "Your email is a mandatory field").value;
        var fName = FloriaDOM.getElement(elementIdBase+"fName", "Your first name is a mandatory field").value;
        var lName = FloriaDOM.getElement(elementIdBase+"lName", "Your last name is a mandatory field").value;
        var phone = FloriaDOM.getElement(elementIdBase+"phone").value;
        var params = "email=" + encodeURIComponent(email)+"&fName=" + encodeURIComponent(fName)+"&lName=" + encodeURIComponent(lName)+"&phone=" + encodeURIComponent(phone);
        DojoSimple.ajaxUrl("/"+DojoSimple.PopupSignup.basePath+"/svc/user/guest/registration?"+params, "POST", null, DojoSimple.PopupSignup.signUpGuestOK, DojoSimple.PopupSignup.signUpErr);
        return false;
      }
      
     var email = FloriaDOM.getElement(elementIdBase+"email", "Email").value;
     var token = DojoSimple.PopupSignup.Token;
     var Pswd = FloriaDOM.getElement(elementIdBase+"password", "Please enter a password").value;
     var confirmPswd = FloriaDOM.getElement(elementIdBase+"confirmPassword", "Confirm password").value;
     var phone = FloriaDOM.getElement(elementIdBase+"phone", "phone number (Optional)").value;
     if(!this.passwordUI.isValid())
       {
         return false;
       }
     var params = "email="+encodeURIComponent(email)+"&password="+encodeURIComponent(Pswd)+"&token="+encodeURIComponent(token);
     if(phone != null && phone.length > 0)
       {
         params += "&phone="+encodeURIComponent(phone);
       }
     if(Pswd == confirmPswd)
       {
         DojoSimple.ajaxUrl("/"+DojoSimple.PopupSignup.basePath+"/svc/user/onboarding?"+params, "POST", null, DojoSimple.PopupSignup.signUpOK, DojoSimple.PopupSignup.signUpErr);
       }
     else
       {
         DojoSimple.PopupLogin.showError(400, "Password and confirmation password do not match", null);
       }
     return false;
   },
  TokenDetailsOK: function(user)
   {
     var e = document.getElementById(elementIdBase+"email");
     if (e == null)
      setTimeout(function() { DojoSimple.PopupSignup.TokenDetailsOK(user); }, 25);

     var elementIdBase = DojoSimple.PopupSignup.ElementIdBase;
//     document.getElementById(elementIdBase+"email").value = user.email;
     document.getElementById(elementIdBase+"fName").value = user.nameFirst;
     document.getElementById(elementIdBase+"lName").value = user.nameLast;
   },
  TokenDetailsErr: function(code, msg, errors)
   {
     DojoSimple.PopupLogin.createPopup(null, null, "Registration Confirmation Failure", null, .5, .5, "<BR><CENTER><H2>The link to complete your registration has either expired,<BR> or been replaced with a newer request in your inbox.<BR>Please try registering again.</H2></CENTER></BR>");
   },
  signUpOK : function(data)
   {
     alert("Signed up successfully, please login");
     window.location.href = FloriaDOM.getUrlPath();
   },
  signUpGuestOK : function(data)
   {
     DojoSimple.PopupLogin.createPopup(null, null, "Registration Request Confirmed", null, .5, .5, "<BR><CENTER><H2>An email from notifications@capsicohealth.com<BR>is on its way to you to complete your<BR>registration process.<BR><BR>You can close this browser tab/window.</H2></CENTER></BR>");
   },
  signUpErr : function(code, msg, errors)
   {
     DojoSimple.PopupLogin.showError(code, msg, errors);
   }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Forgot password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.ForgotPswd = {
  Url  : null,
  Email: null,
  setUrls : function(basePath, url)
  { 
    DojoSimple.ForgotPswd.basePath = basePath;
    DojoSimple.ForgotPswd.Url = url;
  },
  init: function(elementIdBase)
  {
  },
  show : function(onSuccessFunc, popUpTitle)
  {
    var popUpTitle = popUpTitle || "Reset your password";
    DojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Forgot password panel has not been set"
                ,popUpTitle
                ,DojoSimple.ForgotPswd.Url);
  },
  forgot : function(elementIdBase)
  {
    var Email = FloriaDOM.getElement(elementIdBase+"Email", "Please enter your registered email id").value;
    if(Email.length > 0)
      {
        DojoSimple.ForgotPswd.Email = Email;
        DojoSimple.ajaxUrl("/"+DojoSimple.ForgotPswd.basePath+"/svc/user/forgotPswd?email=" + encodeURIComponent(Email), "POST", null, DojoSimple.ForgotPswd.OK, DojoSimple.ForgotPswd.Err);
      }
    else
      {
        alert("Please enter an email address");
      }
    return false;
  },
  OK : function(data)
  {
     DojoSimple.PopupLogin.createPopup(null, null, "Password Reset Request Confirmed", null, .5, .5, "<BR><CENTER><H2>An email from notifications@capsicohealth.com<BR>is on its way to you to reset your password.<BR><BR>You can close this browser tab/window.</H2></CENTER></BR>");
  },
  Err : function(code, msg, errors)
  {
    DojoSimple.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Set password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.SetPassword = {
  Url  : null,
  Token: null,
  passwordUI: null,
  setUrls : function(basePath, Url, token)
  { 
    DojoSimple.SetPassword.basePath = basePath;
    DojoSimple.SetPassword.Url = Url;
    if(token != null)
      {
        DojoSimple.SetPassword.Token = token;
      }
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new DojoSimple.PasswordUI(elementIdBase+"password");
    var tokenDOM = FloriaDOM.getElement(elementIdBase+"token", "Password reset code");
    tokenDOM.value = DojoSimple.SetPassword.Token || "";
    var Email = FloriaDOM.getElement(elementIdBase+"email", "Please enter your registered email id");
    Email.value = DojoSimple.ForgotPswd.Email;
  },
  show : function(onSuccessFunc, popUpTitle)
  {
    popUpTitle = popUpTitle || "Reset your password";
    DojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Set password panel has not been set"
            ,popUpTitle
            ,DojoSimple.SetPassword.Url);

  },
  setPassword : function(elementIdBase)
  {
    var email = FloriaDOM.getElement(elementIdBase+"email", "Please enter your registered email id").value;
    var password = FloriaDOM.getElement(elementIdBase+"password", "password").value;
    var confirmPswd = FloriaDOM.getElement(elementIdBase+"confirmPassword", "confirm password").value;
    var token = FloriaDOM.getElement(elementIdBase+"token", "Password reset code").value;
    if(token.length == 0 )
      {
        alert("Please enter the password reset code");
        return false;
      }
    if(email.length == 0 )
      {
        alert("Please enter an email address");
        return false;
      }

    if(!this.passwordUI.isValid())
      {
        return false;
      }
    if(password == confirmPswd)
      {
        DojoSimple.ajaxUrl("/"+DojoSimple.SetPassword.basePath+"/svc/user/setPswd?email=" + encodeURIComponent(email)+"&token="+encodeURIComponent(token)+"&password="+encodeURIComponent(password)
                , "POST", null, DojoSimple.SetPassword.OK, DojoSimple.SetPassword.Err);
      }
    else
      {
        DojoSimple.PopupLogin.showError(400, "Password and confirm password do not match", null);
      }
    return false;
  },
  OK : function(data)
  {
    alert("Your password was reset. Now please login.");
    window.location.href = FloriaDOM.getUrlPath();
  },
  Err : function(code, msg, errors)
  {
    DojoSimple.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Account
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Account = {
  Url  : null,
  passwordUI: null,
  setUrls : function(basePath, accountUrl, token)
  { 
    DojoSimple.Account.basePath = basePath;
    DojoSimple.Account.Url = accountUrl;
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new DojoSimple.PasswordUI(elementIdBase+"password");
    DojoSimple.Account.fillDetails(elementIdBase);
  },
  show : function(email, title, firstName, lastName, onSuccessFunc)
  {
    DojoSimple.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Account panel has not been set"
            ,"Account Settings"
            ,DojoSimple.Account.Url, 0.9, 0.9);  
  },
  info : function()
  {
    DojoSimple.PopupLogin.createPopup(null, "The default url for the popup Account panel has not been set"
            ,"Account Information"
            ,"/static/html/account-info.html", 0.5, 0.9);  
  },
  account : function(elementIdBase)
  {
    if (elementIdBase == null)
     return;
    
    var email = FloriaDOM.getElement(elementIdBase+"email", "ERROR: The email field cannot be found!").value;
    var nameFirst =  FloriaDOM.getElement(elementIdBase+"nameFirst", "ERROR: The first-name field cannot be found!").value;
    var nameLast =  FloriaDOM.getElement(elementIdBase+"nameLast", "ERROR: The last-name field cannot be found!").value;
    
    var password = FloriaDOM.getElement(elementIdBase+"password", "ERROR: The new-password field cannot be found!").value;
    var confirmPswd = FloriaDOM.getElement(elementIdBase+"confirmPassword", "ERROR: The new-password-confirm field cannot be found!").value;
    var currentPassword = FloriaDOM.getElement(elementIdBase+"currentPassword", "ERROR: The current-password field cannot be found!").value;
    if(password.length > 0 && confirmPswd.length > 0 && !this.passwordUI.isValid())
     {
       alert("Your password doesn't meet the system's requirements.");
       return false;
     }
    if(password == confirmPswd)
     {
       var params  = "nameLast="+nameLast+"&nameFirst="+nameFirst+"&email="+encodeURIComponent(email)
                    +"&password="+encodeURIComponent(password)+"&currentPassword="+encodeURIComponent(currentPassword);
       DojoSimple.ajaxUrl("/"+DojoSimple.Account.basePath+"/svc/user/account?"+params , "POST", null, DojoSimple.Account.OK, DojoSimple.Account.Err);
     }
    else{
      alert("Your password and confirm-password do not match");
    }
    return false;
  },
  fillDetails: function(elementIdBase)
  {
    if (currentUser != null) {
      if (currentUser.person != null && currentUser.person.nameTitle != null)
        document.getElementById(elementIdBase+"title").value = currentUser.person.nameTitle;
      if (currentUser.person != null && currentUser.person.nameFirst != null)
        document.getElementById(elementIdBase+"nameFirst").value = currentUser.person.nameFirst;
      if (currentUser.person != null && currentUser.person.nameLast != null)
        document.getElementById(elementIdBase+"nameLast").value = currentUser.person.nameLast;
      if (currentUser.user != null && currentUser.user.email != null)
        document.getElementById(elementIdBase+"email").value = currentUser.user.email;
    }
  },
  OK : function(data)
  {
    window.location.reload();
  },
  Err : function(code, msg, errors)
  {
    DojoSimple.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Verifications
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Verifications = {
  token: null,
  reloadPage: function()
  {
    window.location.href = window.homePagePath;
  },
  EmailVerification: function(basePath, token)
  {
    DojoSimple.ajaxUrl("/"+basePath+"/svc/Verifications?action=emailVerification&token="+encodeURIComponent(token), "POST", null, DojoSimple.Verifications.OK, DojoSimple.Verifications.Err);
  },
  OK: function(data)
  {
    alert("Successfully Verified")
    DojoSimple.Verifications.reloadPage();
  },
  Err: function(code, msg, errors)
  {
    DojoSimple.PopupLogin.showError(code, msg, errors);
  }
}


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple ajaxUrl
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
              
              if (data.code == 401 && DojoSimple.PopupLogin.isAuthPassthrough(Url) == false)
                {
                  var lthis = this;
                  DojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
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
              if (error != null && error.status == 401 && DojoSimple.PopupLogin.isAuthPassthrough(Url) == false)
               {
                 var lthis = this;
                 DojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
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

/**
 * Launched a Url using the regular AjaxUrl facility but expects it to take some time before it returns (long running Job).
 * While the job is running, launches a secondary Polling URL, with a handler and an interval check in seconds. The PollHandler
 * function takes the result from the PollUrl and is expected to return the next PollUrl. If PollUrl is given NULL, an error
 * occurred.
 */
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
                if (data.code == 401 && DojoSimple.PopupLogin.isAuthPassthrough(f.action) == false)
                  {
                    var lthis = this;
                    DojoSimple.PopupLogin.show(true, function()
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
                if (error != null && error.status == 401 && DojoSimple.PopupLogin.isAuthPassthrough(f.action) == false)
                 {
                    var lthis = this;
                    DojoSimple.PopupLogin.show(true, function()
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



// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple URIParameters
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.URIParameters = function()
  {
    var i = window.location.href.indexOf("?");
    this.params = i == -1 ? { } : dojo.queryToObject(p.substring(i + 1, p.length));
  };
DojoSimple.URIParameters.prototype.get = function(name)
  {
    return this.params[name];
  };

  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Editor
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.Editor = function(elementId, h, formId, formElementName)
  {
    this.rte = dojoDijit.byId(elementId);
    if (this.rte != null)
     this.rte.destroy();
    var that = this;
    require(["dijit/Editor", "dijit/_editor/plugins/AlwaysShowToolbar", "dijit/_editor/plugins/LinkDialog", "dojo/domReady!"],
        function(Editor, AlwaysShowToolbar, LinkDialog){
                that.rte = new Editor({
                    height: h,
                    extraPlugins: [AlwaysShowToolbar],
                    plugins : [ 'undo', 'redo', 'cut', 'copy', 'paste', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', '|', 'insertHorizontalRule', 'createLink', 'insertImage' ]
                }, dojoDom.byId(elementId));
                dojo.connect(rte, 'onChange', function()
                      {
                        var e = dojoDom.byId(formId)[formElementName];
                        var v = rte.attr("value");
                        e.value = FloriaText.isNullOrEmpty(v) == true || v.match(/^\s*\<\s*br[^\/]*\/\>\s*$/) != null ? "" : v;
                        if (e.onchange)
                          e.onchange();
                        return true;
                      });
                that.rte.startup();
        });
  };
  
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DojoSimple Misc
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.FadeOut = function(elementId, millis, func)
 {
   require(["dojo/_base/fx", "dojo/on"], function(fx, on)
    { 
      var a = fx.fadeOut({node: document.getElementById(elementId), duration: millis==null ? 200 : millis});
      if (func != null)
       on(a, "End", func);
      a.play();
    });
 };

DojoSimple.getViewport = function(elementId, millis, func)
 {
      return dojoDijit.getViewport();
 };

 
 
 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Password UI
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
DojoSimple.PasswordUI = function(elementId){
  var that = this;
  var domParser = new DOMParser();
  var element = document.getElementById(elementId);
  this.element = element;
  if(element == null){
    console.error("Unable to find element with ID = "+elementId+".");
    return;
  }
  var passwordRules = window.passwordRules || [];
  this.passwordRules = passwordRules;
  var p = dojo.byId(elementId);

  passwordRules.forEach(function(item, index){
    var doc = domConstruct.toDom("<TR class=\"passwordRules\"><TD colspan=\"1\" data-index=\""+index+"\" class=\"error\">"+item.description+"</TD></TR>");
      domConstruct.place(doc, p.closest('tr'), 'after');
  })
  element.addEventListener("keyup", function(){
    var password = this.value;
    var domRules = document.getElementsByClassName("passwordRules");
    for(var i=0;i<domRules.length;i++){
      var item = domRules[i];
      var childEle = item.querySelector('td');
      var index = parseInt(childEle.getAttribute('data-index'));
      if (index == null || isNaN(index) == true)
        continue;
      var passwordRule = passwordRules[index];
      var regexp = new RegExp(passwordRule.rule);
      childEle.classList.remove("success", "error");
      if(regexp.test(password))
        {
          childEle.classList.add("success");
        }
      else
        {
          childEle.classList.add("error");
        }
    }
  });
  this.isValid = function(){
    var password = this.element.value;
    var flag = true;
    for(var i=0;i<passwordRules.length;i++){
      var item = passwordRules[i];
      var regexp = new RegExp(item.rule);
      flag = regexp.test(password)
      if(!flag){
        break;
      }
    }
    return flag
  }
}
 
 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tooltip dialog
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

DojoSimple.TooltipDialog = function(elementId, content)
 {
   var that = this;
   
      that._e = document.getElementById(elementId);
      that._tt = document.getElementById(elementId+"_TD");
      if (that._tt == null)
       {
         that._tt = document.createElement('div');
         that._tt.setAttribute("id", elementId+"_TD");
         that._tt.setAttribute("fade-in-popper", "");
         that._tt.classList.add("popperTooltip");
         document.body.appendChild(that._tt);
       }
      that._tt.innerHTML=content;
      that._popper = createPopper(that._e, that._tt);
      var onclick=function(evt) { that._clickHandler(evt); };
      that._e.addEventListener("click", onclick);
      var onmouseleave=function(evt) { that.hide(evt); };
      var onmouseleave2=function(evt) { setTimeout(function(){that.hide();},100); };
      that._tt.addEventListener("mouseleave", onmouseleave);
      that._tt.addEventListener("click", onmouseleave2);
      
      that._clickHandler = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         if (this._tt.hasAttribute("show-popper"))
          this._tt.removeAttribute("show-popper");
         else
          this._tt.setAttribute("show-popper", "");
         this._popper.update();
       }
      that.destroy = function()
       {
         if (this._popper)
          {
            this._popper.destroy();
            this._e.removeEventListener("click", onclick);
            this._tt.removeEventListener("mouseleave", onmouseleave);
            this._tt.removeEventListener("click", onmouseleave2);
            this._popper = null;
          }
       }
      that.hide = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         this._tt.removeAttribute("show-popper");
         this._popper.update();
       }
      that.show = function (evt)
       {
         if (evt != null)
          evt.preventDefault();
         this._tt.setAttribute("show-popper", "");
         this._popper.update();
       }
 };
 

 window.DojoSimple = DojoSimple;

});


