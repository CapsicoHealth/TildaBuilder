package tildabuilder.servlets;

import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.capsico.people.data.User_Data;
import com.capsico.people.web.RequestUtil;
import com.capsico.people.web.ResponseUtil;
import com.capsico.people.web.SimpleServlet;

import tilda.db.Connection;
import tilda.utils.JSONUtil;

@WebServlet("/svc/test")
public class Test extends SimpleServlet
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(Test.class.getName());

    public Test()
      {
        super(false, false);
      }

    @Override
    protected void justDo(RequestUtil Req, ResponseUtil Res, Connection C, User_Data U)
      throws Exception
      {
        String str   = Req.getParamString("str"  , true);

        Req.throwIfErrors();
        
        PrintWriter Out = Res.setContentType(ResponseUtil.ContentType.JSON);
        JSONUtil.startOK(Out, '{');
        JSONUtil.Print(Out, "str", true, str);
        JSONUtil.end(Out, '}');
      }
  }
