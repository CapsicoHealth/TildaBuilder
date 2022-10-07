package tildabuilder.config;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.util.List;

import org.apache.commons.lang3.SystemUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.SerializedName;

import tilda.utils.AsciiArt;
import tilda.utils.FileUtil;
import tilda.utils.TextUtil;

public class Config
  {
    protected static final Logger           LOG          = LogManager.getLogger(Config.class.getName());

    /*@formatter:off*/
    @SerializedName("allowedPaths") public String[]      _allowedPaths = null;
    @SerializedName("projects"    ) public List<Project> _projects   = null;

    protected transient static final String _MSG = 
          "***   Please add valid paths for the tool to have access to your local file system.\n"
        + "***   Add folders for which you give the application access. Please make sure that the\n"
        + "***   folder is as restrictive as possible and not something silly like 'c:\\'.\n"
        + "***      - First, the Tilda Builder will explore the entire folder hierarchy to find\n"
        + "***       Tilda JSON files so exploring your whole file system will take a very long\n"
        + "***       time.\n"
        + "***      - Second, this also opens up security issues by giving access to more content\n"
        + "***       on your computer than needed. Always reduce what you expose to the strict minimum."
        ;
    /*@formatter:on*/


    public static Config getInstance()
    throws IOException
      {
        File F = new File(SystemUtils.getUserHome().getAbsolutePath() + File.separator + ".tildaWorkbench.json");
        if (F.exists() == false)
          {
            try (PrintWriter out = FileUtil.getBufferedPrintWriter(F.getAbsolutePath(), true))
              {
                out.println("{");
                out.println(_MSG.replace("***   ", "  // "));
                out.println("  \"allowedPaths\":[");
                out.println("      \"ADD_FULL_PATHS_TO_PROJECT_ROOT_FOLDERS\"");
                out.println("    ]");
                out.println("}");
              }
            exitWithError(F, "was created");
          }
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        Reader R = new BufferedReader(new FileReader(F));
        Config conf = gson.fromJson(R, Config.class);
        if (conf.validate() == false)
          exitWithError(F, "is invalid");

        return conf;
      }


    protected static void exitWithError(File F, String action)
    throws IOException
      {
        LOG.error("\n"
        + "\n"
        + "\n"
        + "***************************************************************************************************************\n"
        + AsciiArt.Error("***   ")
        + "***\n"
        + "***   The file " + F.getAbsolutePath() + " " + action + ".\n"
        + "***\n"
        + _MSG
        + "***\n"
        + "***************************************************************************************************************\n");
        if (Desktop.isDesktopSupported() == true && Desktop.getDesktop().isSupported(Desktop.Action.OPEN) == true)
          {
            LOG.info("");
            LOG.info("Press 'y' to open the file editor...");
            String answer = FileUtil.readlnFromStdIn(false);
            Desktop.getDesktop().open(F);
          }
        System.exit(-1);
      }


    private boolean validate()
      {
        if (TextUtil.isNullOrEmpty(_allowedPaths) == true)
         return false;
        
        for (String p : _allowedPaths)
          {
            File F = new File(p);
            if (F.exists() == false)
              {
                LOG.error("The allowed path '"+p+"' doesn't exist. Please change it to a real path.");
                return false;
              }
          }
        
        return true;
      }

  }
