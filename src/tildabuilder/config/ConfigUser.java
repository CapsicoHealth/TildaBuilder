package tildabuilder.config;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.annotations.SerializedName;

import tilda.utils.TextUtil;

public class ConfigUser
  {
    protected static final Logger LOG          = LogManager.getLogger(ConfigUser.class.getName());

    /*@formatter:off*/
    @SerializedName("name"        ) public String   _name      = null;
    @SerializedName("token"       ) public String   _token     = null;
    @SerializedName("repositories") public List<ConfigRepository>   _repositories     = null;
    /*@formatter:on*/

    public boolean validate()
      {
        if (TextUtil.isNullOrEmpty(_name) == true)
          {
            LOG.error("A user was defined with no 'name'.");
            return false;
          }
        if (TextUtil.isNullOrEmpty(_token) == true)
          {
            LOG.error("A project was defined with no 'token'.");
            return false;
          }

        return true;
      }
  }
