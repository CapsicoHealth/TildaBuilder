package tildabuilder.servlets;

import java.io.File;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tildabuilder.config.Config;
import tildabuilder.config.ConfigProject;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/open")
public class ProjectOpen extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectOpen.class.getName());

    public ProjectOpen()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
      throws Exception
      {
        String projectName = req.getParamString("projectName", true);

        Config conf = Config.getInstance();
        ConfigProject p = conf.getProject(projectName);
        if (p == null)
          req.addError("projectName", "Cannot find project.");
        else
          {
            File folder = new File(p.getFullSrcPath());
            if (folder.exists() == false)
              req.addError("projectName", "The project's home folder doesn't exist.");
            else 
              Runtime.getRuntime().exec("explorer.exe /select," + folder.getAbsolutePath());
          }

        req.throwIfErrors();

        res.success();
      }
  }
