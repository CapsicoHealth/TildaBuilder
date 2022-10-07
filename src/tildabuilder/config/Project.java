package tildabuilder.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.annotations.SerializedName;

import tilda.utils.TextUtil;

public class Project
  {
    protected static final Logger LOG      = LogManager.getLogger(Project.class.getName());

    /*@formatter:off*/
    @SerializedName("name"       ) public String   _name        = null;
    @SerializedName("description") public String   _description = null;
    @SerializedName("rootPath"   ) public String   _rootPath    = null;
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
  }
