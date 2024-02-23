package tildabuilder.servlets;

import java.io.File;
import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import tilda.utils.FileUtil;
import tilda.utils.json.JSONUtil;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigProject;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/schema/details")
public class SchemaDetails extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(ProjectOpen.class.getName());

    public SchemaDetails()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
    throws Exception
      {
        String projectName = req.getParamString("projectName", true);
        String fullSchemaPath = req.getParamString("fullSchemaPath", true);

        File F = null;
        Config conf = Config.getInstance();
        ConfigProject p = conf.getProject(projectName);
        if (p == null)
          req.addError("projectName", "Cannot find project.");
        else if (p.hasSchema(fullSchemaPath) == false)
          req.addError("schemaFullPath", "Cannot find schema in project.");
        else
          {
            F = new File(p._rootPath + p._srcPath + fullSchemaPath);
            if (F.exists() == false)
              req.addError("schemaFullPath", "Cannot find schema definition file on disk.");
          }
        req.throwIfErrors();

        String tildaSchemaStr = FileUtil.getFileOfResourceContents(F);

        PrintWriter Out = res.setContentType(ResponseUtil.ContentType.JSON);
        JSONUtil.startOK(Out, ' ');
        Gson gson = new GsonBuilder().create();
        gson.toJson(tildaSchemaStr, Out);
        JSONUtil.end(Out, ' ');
      }
  }
