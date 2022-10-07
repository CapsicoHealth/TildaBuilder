//'use strict';


define([ "floria/dojoSimple"], function(DJSimple)
{
	var ajaxRequest = {};

ajaxRequest.fetch = function(url, method, callbackFunc,data){
	var request;
	
	 
	if(window.XMLHttpRequest){    
	    request=new XMLHttpRequest();//for Chrome, mozilla etc  
	 }    
	else if(window.ActiveXObject){    
	    request=new ActiveXObject("Microsoft.XMLHTTP");//for IE only  
	 }  
	try{          
  		 request.onreadystatechange  = function(){  
          if (request.readyState == 4  ){  
        	  
        	  var showDialog = new DJSimple.Dialog("Error screen",true);

      		if (request.status == null){
      			showDialog.show("An error occurred: no JSON data for", null , 0.9, 1);
      			showDialog.setContent(request.responseText);
      		}
      			
               // throw ("An error occurred: invalid JSON data for " + this.url);
              if (request.status == undefined){
            	  showDialog.show("An error occurred: no JSON data for", null , 0.9, 1);
      			showDialog.setContent(request.responseText);
              }
            	
                //throw ("An error occurred: invalid JSON data for " + this.url);
              if (request.status == 401)
                {
            	  	var lthis = this;
//                  throw alert("please login again");
                  showDialog.show("please login again", null , 0.9, 1);
            	  console.log("the type of request response : " +( typeof request.responseText));
                  dojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
                }
              else if (request.status != 200){
            		 var jsonObj = JSON.parse(request.responseText);//JSON.parse() returns JSON object 

            	  console.log("the type of request response : " +( typeof request.responseText));
                  error({ message : jsonObj.msg, errors: jsonObj.errors });

            	//  showDialog.show("An error occurred: no JSON data for", null , 0.9, 1);
        			//showDialog.setContent(request.responseText);
                    //throw alert("login fails");
              }
             //document.getElementById("ticket_id").innerHTML =  jsonObj;  
              
              else if(request.status == 200){
           		 var jsonObj = JSON.parse(request.responseText);//JSON.parse() returns JSON object 
           		 callbackFunc(jsonObj.data);

              }
   		  }  
	     }  
	     request.open(method,url,true);  
	     if(method == "GET"){
	    	 request.send();   
	     }else if(method == "POST"){ 	 
	    	 request.send(data);
	     }
	}  
   catch(e){
	   callbackFunc(e);
	}
}
var error = function(error)
{
  try
    {
      if (error != null && error.status == 401)
       {
         var lthis = this;
         dojoSimple.PopupLogin.show(true, function() { dojo.xhr(lthis.method, lthis); });
       }
      else
        {
          var Str = this.errorMsg;
          var msg = error == null ? null : error.message != null ? error.message : error.msg;
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
      SuperDOM.alertException(e, "Caught exception in dojoSimple.ajaxUrl.error(): ");
    }
}
return ajaxRequest;
});
