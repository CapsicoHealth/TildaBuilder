"use strict";

import { FloriaDOM     } from "./module-dom.js";
import { FloriaDialog  } from "./module-dialog.js";
import { FloriaAjax    } from "./module-ajax.js";


export var FloriaLogin = { };

window.FloriaLogin = FloriaLogin;

var cacheBuster = new Date().getTime();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin PopupLogin
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.PopupLogin = {
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
      FloriaLogin.PopupLogin.basePath = basePath;
      FloriaLogin.PopupLogin.loginUrl = login;
      FloriaLogin.PopupLogin.logoutUrl = "/"+basePath+"/"+logout;
      FloriaLogin.PopupLogin.helpUrl = help;
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
      var c = FloriaDOM.getCookie("REMEMBERME");
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
      if (FloriaLogin.PopupLogin.dlgHandle == null)
       FloriaLogin.PopupLogin.dlgHandle = new FloriaDialog("DLG_POPUPLOGIN");
      if (onSuccessFunc != null)
       FloriaLogin.PopupLogin.dlgHandle.setOnHide(onSuccessFunc);
      // There seems to be an issue sometimes with caching of HTML pages... So we are doing these shenanigans.
      if (url != null)
       {
         if (url.indexOf("?") == -1)
          url += "?";
         url+="&ts="+cacheBuster;
       }
      FloriaLogin.PopupLogin.dlgHandle.show(title, url, width, height, Contents);
    },
  hide : function()
   {
     FloriaLogin.PopupLogin.dlgHandle.hide();
   },
  show : function(Timeout, onSuccessFunc, titleMsg)
    {
      titleMsg = titleMsg || (Timeout == true ? "Your session has timed out: please login again" : "Please login")
      this.createPopup(onSuccessFunc, "The default url for the popup Login panel has not been set"
                ,titleMsg
                ,FloriaLogin.PopupLogin.loginUrl);
    },
  signIn : function(elementIdBase)
    {
      var Email = FloriaDOM.getElement(elementIdBase+"Email", "Please enter a username and password").value;
      var Pswd = FloriaDOM.getElement(elementIdBase+"Password", "Please enter a password").value;

      var e = document.getElementById(elementIdBase+"RememberMe");
      var v = e == null ? false : e.checked;
      if (v == true)
       FloriaDOM.setCookie("REMEMBERME", Email, 30);
      else
       FloriaDOM.removeCookie("REMEMBERME")
       
      FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupLogin.basePath+"/svc/Login?email=" + encodeURIComponent(Email) + "&pswd=" + encodeURIComponent(Pswd), "POST", null, FloriaLogin.PopupLogin.signInOK, FloriaLogin.PopupLogin.signInErr);
      return false;
    },
  signInOK : function(data)
    {
      var tenants = data.tenants
      if(tenants != null)
        {
//          alert("Tenant");
          FloriaLogin.PopupLogin.tenantsSelect(data.tenants);
          return;
        }
      var eulaUrl = data.eulaUrl;
      if (eulaUrl != null)
        {
//          alert("Eula");
//          alert("FloriaLogin.PopupLogin.dlgHandle: "+FloriaLogin.PopupLogin.dlgHandle);
          FloriaLogin.PopupLogin.eula(data);
          return;
        }

//      alert("OK TO LOG IN");
//      FloriaDOM.setInnerHTML("HEADER_ACCOUNT", '<A href="javascript:FloriaLogin.PopupLogin.logout();"><IMG height="50px" src="/static/img/logout.big.png"></A>');
      FloriaLogin.PopupLogin.loggedIn = true;
      if (FloriaLogin.PopupLogin.dlgHandle != null)
       FloriaLogin.PopupLogin.dlgHandle.hide();
    },
  signInErr : function(code, msg, errors)
    {
      if (code == 403)
        {
          var loginCallBack = function(){ window.location.reload(); };
          var titleMessage = "Your password has expired please reset your password.";
          var popUpInfoMessage = "You should be receiving an email shortly with instructions to reset your password."
          FloriaLogin.SetPassword.show(window.successLogin || loginCallBack, titleMessage, popUpInfoMessage);
        }
      else
        {
          FloriaLogin.PopupLogin.showError(code, msg, errors);
        }
    },
  logout : function()
    {
      FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupLogin.basePath+"/svc/Logout", "GET", "Cannot logout", FloriaLogin.PopupLogin.logoutOK, FloriaLogin.PopupLogin.logoutErr);
    },
  logoutOK: function(data)
   {
      FloriaLogin.PopupLogin.loggedIn = false;
      document.location.href=FloriaLogin.PopupLogin.logoutUrl;
   },
  logoutErr: function(data)
   {
      alert("Error logging out!");
   },
  help : function()
    {
      FloriaLogin.PopupLogin.createPopup(null, "No help available", "Quick Help", FloriaLogin.PopupLogin.helpUrl, .6, .85);
    },
  PickTenant: function(TenantId)
    {
      FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupLogin.basePath+"/svc/Login?tenantUserRefnum=" + TenantId, "POST", "Cannot login", FloriaLogin.PopupLogin.signInOK, FloriaLogin.PopupLogin.signInErr);
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
            "<A style=\"text-align: center; padding: 35px; display: block;\" href=\"#\" onclick=\"FloriaLogin.PopupLogin.PickTenant("+tenant.tenantUserRefnum+");\">"+tenant.name+"</A>" +
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

    FloriaLogin.PopupLogin.dlgHandle.setTitle("Select A System");
    FloriaLogin.PopupLogin.dlgHandle.setContent(html);
    },
    
   eula: function(data)
    {
      FloriaAjax.ajaxUrl(data.eulaUrl, "GET", "Cannot get EULA HTML"
         , function(eulaHtml) {
             eulaHtml+='<HR/><CENTER><FORM id="EULA_FORM" onSubmit="return FloriaLogin.PopupLogin.acceptEula(\'EULA_FORM\');">'
                      +'<input type="hidden" name="tenantUserRefnum" value="'+data.tenantUserRefnum+'">'
                      +'<input type="hidden" name="eulaToken" value="'+encodeURIComponent(data.eulaToken)+'">'
    //                  +'Sign your name: <input type="text" name="name"><BR>'
                      +'I accept this EULA: <input type="checkbox" name="accept" value="1" width="50%"><BR><BR>'
                      +'<BUTTON id="login-Eula" type="submit" title="Submit">Submit</BUTTON><BR><BR>'
                      ;
             FloriaLogin.PopupLogin.dlgHandle.setTitle("End User License Agreement");
             FloriaLogin.PopupLogin.dlgHandle.setContent(eulaHtml);
           }
         ,null, null, null, 'text'
      );
    },
   acceptEula: function(formId)
    {
      var f = document.getElementById(formId);
      var tenantUserRefnum = f.tenantUserRefnum.value;
      var eulaToken = f.eulaToken.value;
      var accept = f.accept.checked == true ? 1 : 0;
      FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupLogin.basePath+"/svc/Login?tenantUserRefnum=" + tenantUserRefnum + "&eulaToken=" + eulaToken + "&accept=" + accept, "POST", null, FloriaLogin.PopupLogin.signInOK, FloriaLogin.PopupLogin.eulaFail);
      return false;
    },
   eulaFail: function(data)
    {
      alert("You must accept the EULA before continuing.");
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin.PopupSignup PopupSignup
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.PopupSignup = {
  Token : null,
  Url: null,
  ElementIdBase: null,
  setUrls : function(basePath, Url, Token)
   {
     FloriaLogin.PopupSignup.basePath = basePath;
     FloriaLogin.PopupSignup.Url = Url;
     FloriaLogin.PopupSignup.Token = Token;
   },
  init: function(elementIdBase, guest)
   {
     FloriaLogin.PopupSignup.guest = guest;
     FloriaLogin.PopupSignup.ElementIdBase = elementIdBase;
     this.passwordUI = new PasswordUI(elementIdBase+"password");
     if (guest != true)
      FloriaLogin.PopupSignup.getTokenDetails();
   },
  show: function(onSuccessFunc) 
   {
     FloriaLogin.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Signup has not been set"
         ,"Sign Up"
         ,FloriaLogin.PopupSignup.Url, 0.7, 0.8);
   },
  getTokenDetails: function() 
   {
     FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupSignup.basePath+"/svc/user/token?token="+FloriaLogin.PopupSignup.Token, "GET", null, FloriaLogin.PopupSignup.TokenDetailsOK, FloriaLogin.PopupSignup.TokenDetailsErr);
   },
  signUp : function(elementIdBase)
   {
     if (FloriaLogin.PopupSignup.guest == true)
      {
        var email = FloriaDOM.getElement(elementIdBase+"email", "Your email is a mandatory field").value;
        var fName = FloriaDOM.getElement(elementIdBase+"fName", "Your first name is a mandatory field").value;
        var lName = FloriaDOM.getElement(elementIdBase+"lName", "Your last name is a mandatory field").value;
        var phone = FloriaDOM.getElement(elementIdBase+"phone").value;
        var params = "email=" + encodeURIComponent(email)+"&fName=" + encodeURIComponent(fName)+"&lName=" + encodeURIComponent(lName)+"&phone=" + encodeURIComponent(phone);
        FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupSignup.basePath+"/svc/user/guest/registration?"+params, "POST", null, FloriaLogin.PopupSignup.signUpGuestOK, FloriaLogin.PopupSignup.signUpErr);
        return false;
      }
      
     var email = FloriaDOM.getElement(elementIdBase+"email", "Email").value;
     var token = FloriaLogin.PopupSignup.Token;
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
         FloriaAjax.ajaxUrl("/"+FloriaLogin.PopupSignup.basePath+"/svc/user/onboarding?"+params, "POST", null, FloriaLogin.PopupSignup.signUpOK, FloriaLogin.PopupSignup.signUpErr);
       }
     else
       {
         FloriaLogin.PopupLogin.showError(400, "Password and confirmation password do not match", null);
       }
     return false;
   },
  TokenDetailsOK: function(user)
   {
     var e = document.getElementById(elementIdBase+"email");
     if (e == null)
      setTimeout(function() { FloriaLogin.PopupSignup.TokenDetailsOK(user); }, 25);

     var elementIdBase = FloriaLogin.PopupSignup.ElementIdBase;
//     document.getElementById(elementIdBase+"email").value = user.email;
     document.getElementById(elementIdBase+"fName").value = user.nameFirst;
     document.getElementById(elementIdBase+"lName").value = user.nameLast;
   },
  TokenDetailsErr: function(code, msg, errors)
   {
     FloriaLogin.PopupLogin.createPopup(null, null, "Registration Confirmation Failure", null, .5, .5, "<BR><CENTER><H2>The link to complete your registration has either expired,<BR> or been replaced with a newer request in your inbox.<BR>Please try registering again.</H2></CENTER></BR>");
   },
  signUpOK : function(data)
   {
     alert("Signed up successfully, please login");
     window.location.href = FloriaDOM.getUrlPath();
   },
  signUpGuestOK : function(data)
   {
     FloriaLogin.PopupLogin.createPopup(null, null, "Registration Request Confirmed", null, .5, .5, "<BR><CENTER><H2>An email from notifications@capsicohealth.com<BR>is on its way to you to complete your<BR>registration process.<BR><BR>You can close this browser tab/window.</H2></CENTER></BR>");
   },
  signUpErr : function(code, msg, errors)
   {
     FloriaLogin.PopupLogin.showError(code, msg, errors);
   }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin Forgot password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.ForgotPswd = {
  Url  : null,
  Email: null,
  setUrls : function(basePath, url)
  { 
    FloriaLogin.ForgotPswd.basePath = basePath;
    FloriaLogin.ForgotPswd.Url = url;
  },
  init: function(elementIdBase)
  {
  },
  show : function(onSuccessFunc, popUpTitle)
  {
    var popUpTitle = popUpTitle || "Reset your password";
    FloriaLogin.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Forgot password panel has not been set"
                ,popUpTitle
                ,FloriaLogin.ForgotPswd.Url);
  },
  forgot : function(elementIdBase)
  {
    var Email = FloriaDOM.getElement(elementIdBase+"Email", "Please enter your registered email id").value;
    if(Email.length > 0)
      {
        FloriaLogin.ForgotPswd.Email = Email;
        FloriaAjax.ajaxUrl("/"+FloriaLogin.ForgotPswd.basePath+"/svc/user/forgotPswd?email=" + encodeURIComponent(Email), "POST", null, FloriaLogin.ForgotPswd.OK, FloriaLogin.ForgotPswd.Err);
      }
    else
      {
        alert("Please enter an email address");
      }
    return false;
  },
  OK : function(data)
  {
     FloriaLogin.PopupLogin.createPopup(null, null, "Password Reset Request Confirmed", null, .5, .5, "<BR><CENTER><H2>An email from notifications@capsicohealth.com<BR>is on its way to you to reset your password.<BR><BR>You can close this browser tab/window.</H2></CENTER></BR>");
  },
  Err : function(code, msg, errors)
  {
    FloriaLogin.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin Set password
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.SetPassword = {
  Url  : null,
  Token: null,
  passwordUI: null,
  setUrls : function(basePath, Url, token)
  { 
    FloriaLogin.SetPassword.basePath = basePath;
    FloriaLogin.SetPassword.Url = Url;
    if(token != null)
      {
        FloriaLogin.SetPassword.Token = token;
      }
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new PasswordUI(elementIdBase+"password");
    var tokenDOM = FloriaDOM.getElement(elementIdBase+"token", "Password reset code");
    tokenDOM.value = FloriaLogin.SetPassword.Token || "";
    var Email = FloriaDOM.getElement(elementIdBase+"email", "Please enter your registered email id");
    Email.value = FloriaLogin.ForgotPswd.Email;
  },
  show : function(onSuccessFunc, popUpTitle)
  {
    popUpTitle = popUpTitle || "Reset your password";
    FloriaLogin.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Set password panel has not been set"
            ,popUpTitle
            ,FloriaLogin.SetPassword.Url);

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
        alert("Your password doesn't match the rules'");
        return false;
      }
    if(password == confirmPswd)
      {
        FloriaAjax.ajaxUrl("/"+FloriaLogin.SetPassword.basePath+"/svc/user/setPswd?email=" + encodeURIComponent(email)+"&token="+encodeURIComponent(token)+"&password="+encodeURIComponent(password)
                , "POST", null, FloriaLogin.SetPassword.OK, FloriaLogin.SetPassword.Err);
      }
    else
      {
        alert("Your password doesn't match the rules'");
        return false;
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
    FloriaLogin.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin Account
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.Account = {
  Url  : null,
  passwordUI: null,
  setUrls : function(basePath, accountUrl, token)
  { 
    FloriaLogin.Account.basePath = basePath;
    FloriaLogin.Account.Url = accountUrl;
  },
  init: function(elementIdBase)
  {
    this.passwordUI = new PasswordUI(elementIdBase+"password");
    FloriaLogin.Account.fillDetails(elementIdBase);
  },
  show : function(email, title, firstName, lastName, onSuccessFunc)
  {
    FloriaLogin.PopupLogin.createPopup(onSuccessFunc, "The default url for the popup Account panel has not been set"
            ,"Account Settings"
            ,FloriaLogin.Account.Url, 0.9, 0.9);  
  },
  info : function()
  {
    FloriaLogin.PopupLogin.createPopup(null, "The default url for the popup Account panel has not been set"
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
       FloriaAjax.ajaxUrl("/"+FloriaLogin.Account.basePath+"/svc/user/account?"+params , "POST", null, FloriaLogin.Account.OK, FloriaLogin.Account.Err);
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
    FloriaLogin.PopupLogin.showError(code, msg, errors);
  }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FloriaLogin Verifications
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
FloriaLogin.Verifications = {
  token: null,
  reloadPage: function()
   {
     window.location.href = window.homePagePath;
   }
 ,EmailVerification: function(basePath, token)
   {
     FloriaAjax.ajaxUrl("/"+basePath+"/svc/Verifications?action=emailVerification&token="+encodeURIComponent(token), "POST", null, FloriaLogin.Verifications.OK, FloriaLogin.Verifications.Err);
   }
 ,OK: function(data)
   {
     alert("Successfully Verified")
     FloriaLogin.Verifications.reloadPage();
   }
 ,Err: function(code, msg, errors)
   {
     FloriaLogin.PopupLogin.showError(code, msg, errors);
   }
};





//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//
// UTILITIES
//
//////////////////////////////////////////////////////////////////////////////////////////////////////



 
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Password UI
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function PasswordUI(elementId){
  var element = document.getElementById(elementId);
  if (element == null)
   {
     console.error("Unable to find element with ID = "+elementId+".");
     return;
   }
  var passwordRules = window.passwordRules || [];
  this.passwordRules = passwordRules;
  var str = "<TABLE>";
  for (var i = 0; i < this.passwordRules.length; ++i)
   {
     var pr = this.passwordRules[i];
     str+="<TR class=\"passwordRules\"><TD colspan=\"1\" data-index=\""+i+"\" class=\"error\">"+pr.description+"</TD></TR>";
   }
  str+="</TABLE>";
  FloriaDOM.appendInnerHTML(element.parentNode, str);
  // Gotta re-get the element since it was overwritten by the previous statement, creating a new DOM.
  this.element = document.getElementById(elementId);
  this.element.addEventListener("keyup", function(){
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
    for(var i=0;i<this.passwordRules.length;i++){
      var item = this.passwordRules[i];
      var regexp = new RegExp(item.rule);
      flag = regexp.test(password)
      if(!flag){
        break;
      }
    }
    return flag
  }
}
