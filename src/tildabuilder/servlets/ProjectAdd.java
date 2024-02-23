package tildabuilder.servlets;

import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import tilda.utils.json.JSONUtil;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigProject;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/add")
public class ProjectAdd extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 101811234563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectAdd.class.getName());

    public ProjectAdd()
      {
        super(true);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
    throws Exception
      {
        String name = req.getParamString("name", true);
        String description = req.getParamString("description", false);
        String rootPath = req.getParamString("rootPath", true);
        String srcPath = req.getParamString("srcPath", true);
        boolean update = req.getParamBoolean("update", false);

        Config conf = Config.getInstance();
        ConfigProject p = conf.getProject(name);
        if (p != null && update == false)
          req.addError("name", "Project '" + name + "' already exists. Use parameter update=1 to update.");

        req.throwIfErrors();

        if (p == null)
         p = new ConfigProject();

        p._name = name;
        p._description = description;
        p._rootPath = rootPath;
        p._srcPath = srcPath;

        if (p.validate() == false)
          {
            req.addError(name, "The project information couldn't be validated");
            req.throwIfErrors();
          }

        String msg = p.initialize();
        if (msg != null)
         {
           req.addError(name, msg);
           req.throwIfErrors();
           return;
         }

        conf.addProject(p, true);
        conf.save();

        PrintWriter Out = res.setContentType(ResponseUtil.ContentType.JSON);
        JSONUtil.startOK(Out, ' ');
        Gson gson = new GsonBuilder().create();
        gson.toJson(conf._projects, Out);
        JSONUtil.end(Out, ' ');
      }
  }
