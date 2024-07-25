package tildabuilder.servlets;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.json.JSONPrinter;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/repo/oauth")
public class Oauth extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(Oauth.class.getName());

    public Oauth()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
      throws Exception
      {
    	//should give out token that the user then parses. Need to get the auth code for the access token
    	 String requestURL = req.getRequestURL().toString();
         System.out.println(requestURL);
         
         // Log the request URL for debugging purposes
         //LOG.info("Request URL: " + requestURL);

         // Example response
         JSONPrinter out = new JSONPrinter(false);
//         res.setContentType("application/json");
         
         
         out.addElementRaw("url", requestURL);
         res.successJson(out);
      }
  }
