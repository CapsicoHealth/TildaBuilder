package tildabuilder.servlets;

import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import tilda.utils.json.JSONUtil;
import tildabuilder.config.Config;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/list")
public class ProjectList extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectList.class.getName());

    public ProjectList()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil Req, ResponseUtil Res)
      throws Exception
      {
        PrintWriter Out = Res.setContentType(ResponseUtil.ContentType.JSON);
        JSONUtil.startOK(Out, ' ');
        Gson gson = new GsonBuilder().create();
        gson.toJson(Config.getInstance()._projects, Out);
        JSONUtil.end(Out, ' ');
      }
  }
