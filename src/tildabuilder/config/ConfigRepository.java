package tildabuilder.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.annotations.SerializedName;

import tilda.utils.TextUtil;

public class ConfigRepository
  {
    protected static final Logger LOG          = LogManager.getLogger(ConfigRepository.class.getName());

    /*@formatter:off*/
    @SerializedName("name"        ) public String   _name       = null;
    @SerializedName("rootFolder"  ) public String   _rootFolder = null;
    /*@formatter:on*/

    public boolean validate()
      {
        if (TextUtil.isNullOrEmpty(_name) == true)
          {
            LOG.error("A repository was defined with no 'name'.");
            return false;
          }
        if (TextUtil.isNullOrEmpty(_rootFolder) == true)
          {
            LOG.error("A project was defined with no 'rootFolder'.");
            return false;
          }

        return true;
      }
  }
