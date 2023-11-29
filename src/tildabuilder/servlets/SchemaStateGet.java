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
import tildabuilder.config.Project;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/project/schema/state/get")
public class SchemaStateGet extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(SchemaStateGet.class.getName());

    public SchemaStateGet()
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
        Project p = conf.getProject(projectName);
        if (p == null)
          req.addError("projectName", "Cannot find project.");
        else if (p.hasSchema(fullSchemaPath) == false)
          req.addError("schemaFullPath", "Cannot find schema in project.");
        else
          F = new File(p._rootPath + p._srcPath + fullSchemaPath.replace(".json", ".state.json"));
        req.throwIfErrors();

        if (F.exists() == true)
          {
            String state = FileUtil.getFileOfResourceContents(F);

            PrintWriter Out = res.setContentType(ResponseUtil.ContentType.JSON);
            JSONUtil.startOK(Out, ' ');
            Gson gson = new GsonBuilder().create();
            gson.toJson(state, Out);
            JSONUtil.end(Out, ' ');
          }
        else
          res.success();
      }
  }
