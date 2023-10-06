<%@page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@page import="tilda.utils.HttpStatus"%>
<%@page import="tilda.utils.TextUtil"%>
<%@page import="java.util.Enumeration"%>

<%
HttpStatus Status = HttpStatus.parse((Integer) request.getAttribute("javax.servlet.error.status_code"));
String StatusMessage = (String) request.getAttribute("javax.servlet.error.message");
String  PageTitle=Status._Code == HttpStatus.Unauthorized._Code ? "CapsicoHealth Login" : "CapsicoHealth error: "+Status._Code;
%>
    <link rel="stylesheet" href="/static/css/dojoSimple.css"/>
    <link rel="stylesheet" href="/static/css/tilda.css"/>

<STYLE>
.elegantShadow {
  color: #131313;
  letter-spacing: .1em;
  font-family: "Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif;
  font-size: 50px;
  padding: 5px 10px 10px 20px;
  margin: 10px 20px 10px 20px;
  text-align: center;
  text-transform: uppercase;
  text-rendering: optimizeLegibility;
  text-shadow: -1px -1px 0 #666,  -2px 2px 1px #aaa,   -3px 3px 1px #eee; 
  }

#ERR_MSG {
  font-weight: normal;
  text-transform: none;
  letter-spacing: -1px;
  font-size: 40%;
  text-shadow: none; 
}
</STYLE>

<DIV id="LogginBackground" class="fullCenter" style="width: 100%; height: 100%;                  overflow: hidden; z-index: 5;"></DIV>
<DIV id="LogginButton" class="fullCenter" style="width: 100%; height: 100%; font-size: 150%; overflow: hidden; z-index: 10;" >
  <DIV class="fullCenter capsicoLogo">
    <DIV class="elegantShadow">
<%
Throwable T = (Throwable) request.getAttribute("javax.servlet.error.exception");
if (T != null && TextUtil.isNullOrEmpty(T.getMessage()) == false)
 out.println("<!-- "+T.getMessage()+" -->");

if (Status._Code == HttpStatus.Unauthorized._Code) { %>
	        Session Timeout
            <DIV id="ERR_MSG">You were inactive for more than 20 minutes</DIV>
	     </DIV>
         <CENTER><BUTTON class="buttonLogin" onClick="FloriaLogin.PopupLogin.show(false, function() { document.location.reload();})" style="font-size: 75%; font-weight: bold;">Login again</BUTTON></CENTER>
	   </DIV>
<% } else if (Status._Code == HttpStatus.ResourceNotFound._Code) { %>
	        Page not found
            <DIV id="ERR_MSG">You have reached this page in error or do not have access<BR>Use your browser's Back button</DIV>
	     </DIV>
	   </DIV>
<% } else { %>
              <%=Status._Message%>
              <DIV id="ERR_MSG"><%=StatusMessage%></DIV>
           </DIV>
           <CENTER style="position: relative; top: -15px;">&#x26a0; <%=Status._Code%></CENTER>
	   </DIV>
<% } %>
</DIV>
