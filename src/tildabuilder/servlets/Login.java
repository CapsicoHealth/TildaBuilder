package tildabuilder.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.HttpStatus;
import tilda.utils.json.JSONPrinter;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigUser;
import tildabuilder.utils.GitHubUtils;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;
import wanda.web.exceptions.SimpleServletException;
import javax.servlet.http.Cookie;

@WebServlet("/svc/repo/github/login")
public class Login extends SimpleServletNonTransactional {
    private static final long serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG = LogManager.getLogger(GitExplore.class.getName());

    public Login() {
        super(false);
    }
    
    public static final String _USER = "_USER";
    @Override
    
    protected void justDo(RequestUtil req, ResponseUtil res) throws Exception {
       String user = req.getParamString("user", true);
       String token = req.getParamString("token", true);
       req.throwIfErrors();
       
       req.setSessionString(Login._USER, user);
       
       Config conf = Config.getInstance();
       ConfigUser u = conf.getUser(user);
       if(u == null)
       {
    	   u = new ConfigUser();
    	   u._name = user;
    	   if(conf.addUser(u) == null)
    	   {
    		   throw new Error ("Bug: Adding user failed which should not happen");
    	   }
       }
       u._token = token;
     //check if token is valid, return error if not
       conf.save();
       
       res.success();


    }
}
