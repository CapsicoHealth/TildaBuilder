package tildabuilder.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.HttpStatus;
import tilda.utils.json.JSONPrinter;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigUser;
import tildabuilder.utils.GitHubUtils;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;
import wanda.web.exceptions.SimpleServletException;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;


@WebServlet("/svc/repo/localtest")
public class LocalTest extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(LocalTest.class.getName());

    public LocalTest()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
      throws Exception
      {
    	String user = req.getSessionString(Login._USER);
        Config conf = Config.getInstance();
        ConfigUser u = conf.getUser(user);
        if(u == null)
        {
        	throw new Exception("Exception: User not found");
        	//add more information in the log
        }
        
        // Initialize GitHubUtils with the provided token
        GitHubUtils gitHubUtils;
        try {
            gitHubUtils = new GitHubUtils(u._token);
        } catch (IOException e) {
            LOG.error("Failed to initialize GitHubUtils", e);
            ((Logger) res).error("Failed to connect to GitHub: " + e.getMessage());
            return;
        }
        String repoUrl = req.getParamString("repoUrl", true);
        String directoryPath = req.getParamString("directoryPath", true);
    	File folder = new File(directoryPath);
        List<String> folderContents = new ArrayList<>();

        if (folder.exists() && folder.isDirectory()) {
            for (File file : folder.listFiles()) {
                folderContents.add(file.getName());
            }
        } else {
            LOG.warn("Folder does not exist or is not a directory: " + folder.getAbsolutePath());
            new File(directoryPath).mkdirs();
        }
        String result = String.join(",", folderContents);
//        if(result.indexOf(".git") > -1) {
//        	
//        }
        gitHubUtils.cloneOrPullRepository(repoUrl, directoryPath);
        res.success();
//        
//
//        JSONPrinter out = new JSONPrinter(false);
//        out.addElementRaw("repositories", result);
//        res.successJson(out);
  }
  }
