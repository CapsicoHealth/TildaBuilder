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
public class LocalTest extends SimpleServletNonTransactional {
    private static final long serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG = LogManager.getLogger(LocalTest.class.getName());

    public LocalTest() {
        super(false);
    }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res) throws Exception {
        String user = req.getSessionString(Login._USER);
        Config conf = Config.getInstance();
        ConfigUser u = conf.getUser(user);
        if (u == null) {
            throw new Exception("Exception: User not found");
            //add more information in the log
        }

        GitHubUtils gitHubUtils;
        try {
            gitHubUtils = new GitHubUtils(u._token);
        } catch (IOException e) {
            LOG.error("Failed to initialize GitHubUtils", e);
            return;
        }

        String repoUrl = req.getParamString("repoUrl", true);
        String directoryPath = req.getParamString("directoryPath", true);
        File folder = new File(directoryPath);

        // Check if the directory exists and contains a .git folder
        if (folder.exists() && folder.isDirectory()) {
            File gitFolder = new File(folder, ".git");
            if (gitFolder.exists() && gitFolder.isDirectory()) {//if the same project is being cloned, it will instead pull the latest version. 
                // Pull latest changes instead of cloning
                LOG.info("Repository already exists. Pulling latest changes...");
                gitHubUtils.pullRepository(directoryPath);
                LOG.info("Pulled latest changes if existed, all up to date!");
            } else if (folder.listFiles().length > 0) {//case 1 is where there is a .git folder existing in the directory, signaling a git project already existing in that directory
                String errorMsg = "The directory is not empty and doesn't contain a Git repository.";
                LOG.error(errorMsg);
                throw new Exception(errorMsg);
            } else {
                //everything is good, proceed to clone
                gitHubUtils.cloneOrPullRepository(repoUrl, directoryPath);
            }
        } else {
            // Directory does not exist, will create it then clone
            LOG.info("Directory does not exist. Creating directory and cloning...");
            folder.mkdirs();
            gitHubUtils.cloneOrPullRepository(repoUrl, directoryPath);
        }

        res.success();
    }
}
