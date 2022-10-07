package tildabuilder.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.annotations.SerializedName;

public class Project
  {
    protected static final Logger LOG      = LogManager.getLogger(Project.class.getName());

    /*@formatter:off*/
    @SerializedName("name"    ) public String   _name     = null;
    @SerializedName("schemas" ) public String[] _schemas  = null;
    /*@formatter:on*/
  }
