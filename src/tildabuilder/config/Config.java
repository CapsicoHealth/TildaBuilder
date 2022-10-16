package tildabuilder.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.SystemUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.SerializedName;

import tilda.utils.AsciiArt;
import tilda.utils.FileUtil;

public class Config
  {
    protected static final Logger LOG       = LogManager.getLogger(Config.class.getName());

    /*@formatter:off*/
    @SerializedName("projects"    ) public List<Project> _projects   = new ArrayList<Project>();
    /*@formatter:on*/


    protected static Config       _CONF;

    public static synchronized Config getInstance()
    throws IOException
      {
        if (_CONF != null)
          return _CONF;

        File F = new File(SystemUtils.getUserHome().getAbsolutePath() + File.separator + ".tildaWorkbench.json");
        if (F.exists() == false)
          {
            try (PrintWriter out = FileUtil.getBufferedPrintWriter(F.getAbsolutePath(), true))
              {
                out.println("{");
                out.println("  \"projects\":[");
                out.println("    ]");
                out.println("}");
              }
          }
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        Reader R = new BufferedReader(new FileReader(F));
        Config conf = gson.fromJson(R, Config.class);
        if (conf.validate() == false)
          exitWithError(F, "is invalid");

        return _CONF = conf;
      }


    protected static void exitWithError(File F, String action)
    throws IOException
      {
        LOG.error("\n"
        + "***************************************************************************************************************\n"
        + AsciiArt.Error("***   ")
        + "***\n"
        + "***   The file " + F.getAbsolutePath() + " " + action + ".\n"
        + "***\n"
        + "***************************************************************************************************************\n");
        System.exit(-1);
      }


    private boolean validate()
      {
        for (Project p : _projects)
          {
            if (p != null && p.validate() == false)
              {
                LOG.error("The project '" + p._name + "' is configured incorrectly in the configuration file .tildaWorkbench.json.");
                return false;
              }
          }
        return true;
      }

    /**
     * get a project by name (case insensitive)
     * 
     * @param name
     * @return
     */
    public Project getProject(String name)
      {
        for (Project p : _projects)
          if (p._name.equalsIgnoreCase(name) == true)
            return p;
        return null;
      }

    /**
     * Add a project. If the project already exists (by case insensitive name), return null.
     * 
     * @param p
     * @return the project added, or null if the project already exists by case-insensitive name
     */
    public Project addProject(Project p)
      {
        return addProject(p, false);
      }

    /**
     * Add a project. If the project already exists (by case insensitive name), either replaces it (if replace is true), or
     * fails and returns null.
     * 
     * @param p
     * @return The project added, or null if the project already exists by case-insensitive name and replace was false.
     */
    public Project addProject(Project p, boolean replace)
      {
        if (getProject(p._name) != null)
          {
            if (replace == false)
              return null;
            removeProject(p._name);
          }
        _projects.add(p);
        return p;
      }

    /**
     * Removes a project by case-insensitive name. If found, returns the removed project, otherwise, returns null.
     * 
     * @param name
     * @return The removed project, or null if not found.
     */
    public Project removeProject(String name)
      {
        for (Project p : _projects)
          if (p._name.equalsIgnoreCase(name) == true)
            {
              _projects.remove(p);
              return p;
            }
        return null;
      }


    public void save()
    throws FileNotFoundException
      {
        File F = new File(SystemUtils.getUserHome().getAbsolutePath() + File.separator + ".tildaWorkbench.json");
        try (PrintWriter out = new PrintWriter(F))
          {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            out.write(gson.toJson(this));
          }


      }

  }
