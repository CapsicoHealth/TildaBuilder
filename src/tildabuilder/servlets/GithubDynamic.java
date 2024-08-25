package tildabuilder.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
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

@WebServlet("/svc/repo/github/explore")
public class GithubDynamic extends SimpleServletNonTransactional {
    private static final long serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG = LogManager.getLogger(GitExplore.class.getName());

    public GithubDynamic() {
        super(false);
    }


    @Override
    protected void justDo(RequestUtil req, ResponseUtil res) throws Exception {
        // Retrieve the GitHub personal access token from the request parameters
    	
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

        // Fetch user repositories
       
        List<String> organizations;
        try {
            organizations = gitHubUtils.listOrganizations();
        } catch (IOException e) {
            LOG.error("Failed to list user organizations", e);
            ((Logger) res).error("Failed to list user organizations: " + e.getMessage());
            return;
        }

        // Convert the list to a JSON array format
        StringBuilder repoBuilder = new StringBuilder("[");
        boolean firstRepo = true;
//        for (String org : organizations) {
        String org="CapsicoHealth";
            List<String> repositories;
            try {
                repositories = gitHubUtils.listOrganizationRepositories(org);
            } catch (IOException e) {
                LOG.error("Failed to list user repositories", e);
                ((Logger) res).error("Failed to list user repositories: " + e.getMessage());
                return;
            }

            for (String repo : repositories) {
                // Get the branches for each repository
                List<String> repoBranches;
                try {
                    repoBranches = gitHubUtils.listBranches(repo);
                } catch (IOException e) {
                    LOG.error("Failed to list branches for repository: " + repo, e);
                    ((Logger) res).error("Failed to list branches for repository: " + repo + ": " + e.getMessage());
                    return;
                }

                // Example logic for deletable (this can be customized as needed)
                boolean deletable = false; 

                if (!firstRepo) {
                    repoBuilder.append(",\r\n");
                }
                firstRepo = false;

                repoBuilder.append("{\r\n")
                            .append("\"org\": \"").append(org).append("\",\r\n")
                            .append("\"name\": \"").append(repo).append("\",\r\n")
                            .append("\"branches\": [");

                for (int k = 0; k < repoBranches.size(); k++) {
                    repoBuilder.append("\"").append(repoBranches.get(k)).append("\"");
                    if (k < repoBranches.size() - 1) {
                        repoBuilder.append(", ");
                    }
                }

                repoBuilder.append("],\r\n")
                            .append("\"deletable\": ").append(deletable).append("\r\n")
                            .append("}");
//            }
        }
        repoBuilder.append("]");

        // Build the JSON response
        JSONPrinter out = new JSONPrinter(false);
        out.addElementRaw("repositories", repoBuilder.toString());

        res.successJson(out);
    }
}
