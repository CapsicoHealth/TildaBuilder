package tildabuilder.servlets;

import java.io.File;
import java.io.FileWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.FileUtil;
import tildabuilder.config.Config;
import tildabuilder.config.Project;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/schema/state/save")
public class SchemaStateSave extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectOpen.class.getName());

    public SchemaStateSave()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
    throws Exception
      {
        String projectName = req.getParamString("projectName", true);
        String schemaName = req.getParamString("schemaName", true);
        String fullSchemaPath = req.getParamString("fullSchemaPath", true);
        String state = req.getParamString("state", true);

        File F = null;
        Config conf = Config.getInstance();
        Project p = conf.getProject(projectName);
        if (p == null)
          req.addError("projectName", "Cannot find project.");
        else if (p.hasSchema(fullSchemaPath) == false)
          req.addError("schemaFullPath", "Cannot find schema in project.");

        req.throwIfErrors();

        F = new File(p._rootPath + p._srcPath + fullSchemaPath.replace(".json", ".state.json"));
        try (FileWriter FW = new FileWriter(F, false))
          {
            FW.append(state);
          }

        res.success();
      }
  }
