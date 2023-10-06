package tildabuilder.config;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.annotations.SerializedName;

import tilda.utils.CollectionUtil;
import tilda.utils.FileUtil;
import tilda.utils.LogUtil;
import tilda.utils.TextUtil;

public class Project
  {
    protected static final Logger LOG          = LogManager.getLogger(Project.class.getName());

    /*@formatter:off*/
    @SerializedName("name"       ) public String   _name        = null;
    @SerializedName("description") public String   _description = null;
    @SerializedName("rootPath"   ) public String   _rootPath    = null;
    @SerializedName("srcPath"    ) public String   _srcPath     = null;
    @SerializedName("schemas"    ) public String[] _schemas     = null;
    /*@formatter:on*/

    public boolean validate()
      {
        if (TextUtil.isNullOrEmpty(_name) == true)
          {
            LOG.error("A project was defined with no 'name'.");
            return false;
          }
        if (TextUtil.isNullOrEmpty(_rootPath) == true)
          {
            LOG.error("A project was defined with no 'rootPath'.");
            return false;
          }

        return true;
      }

    public String getFullSrcPath()
      {
        return _rootPath + File.separator + _srcPath;
      }

    protected static class TildaFileProcessor implements FileUtil.FileProcessor
      {
        public TildaFileProcessor(File root)
          {
            _root = root;
          }

        public List<String>  _tildaFiles = new ArrayList<String>();
        protected final File _root;

        @Override
        public void startFolder(File D)
        throws Exception
          {
          }

        @Override
        public void processFile(File F)
        throws Exception
          {
            if (F.getName().matches("_tilda\\.[^\\.]+\\.json") == true)
              _tildaFiles.add(F.getAbsolutePath().substring(_root.getAbsolutePath().length()));
          }

        @Override
        public void endFolder(File D)
        throws Exception
          {
          }
      }

    public String initialize()
    throws Exception
      {
        File root = new File(_rootPath + File.separator);
        if (root.exists() == false)
          root.mkdirs();
        else
          {
            File mark = new File(root.getAbsolutePath() + File.separator + ".tildaWorkbench");
            if (mark.exists() == false || mark.length() > 0)
              return LogUtil.logError(LOG, "The root path '" + _rootPath + "' cannot be used as it doesn't have the empty .tildaWorkbench marker file");
          }

        File src = new File(root.getAbsolutePath() + _srcPath);
        if (src.exists() == false)
          src.mkdirs();

        TildaFileProcessor FP = new TildaFileProcessor(src);
        FileUtil.iterate(src, FP, new String[] { "_Tilda", ".git", "*.java", "bin", "lib"
        });
        _schemas = CollectionUtil.toStringArray(FP._tildaFiles);

        return null;
      }

    public boolean hasSchema(String fullSchemaPath)
      {
        return _schemas != null && CollectionUtil.indexOf(_schemas, fullSchemaPath) != -1;
      }
  }
