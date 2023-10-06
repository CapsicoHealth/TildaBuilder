package tildabuilder.servlets;

import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import tilda.utils.json.JSONUtil;
import tildabuilder.config.Config;
import tildabuilder.config.Project;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/schemas")
public class ProjectSchemas extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectOpen.class.getName());

    public ProjectSchemas()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
    throws Exception
      {
        String projectName = req.getParamString("projectName", true);

        Config conf = Config.getInstance();
        Project p = conf.getProject(projectName);
        if (p == null)
          req.addError("projectName", "Cannot find project.");

        req.throwIfErrors();

        PrintWriter Out = res.setContentType(ResponseUtil.ContentType.JSON);
        JSONUtil.startOK(Out, ' ');
        Gson gson = new GsonBuilder().create();
        gson.toJson(p._schemas, Out);
        JSONUtil.end(Out, ' ');
      }
  }
