package tildabuilder.servlets;

import java.util.List;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.CollectionUtil;
import tilda.utils.json.JSONPrinter;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigUser;
import tildabuilder.utils.GitHubUtils;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;
import wanda.web.exceptions.NotFoundException;

@WebServlet("/svc/repo/explore")
public class GitExplore extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(GitExplore.class.getName());

    public GitExplore()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
      throws Exception
      {
//        String userName = req.getParamString("userName", true);
//        
//        Config cfg = Config.getInstance();
//        ConfigUser CU = cfg.getUser(userName);
//        if (CU == null)
//         throw new NotFoundException("user", userName);
//
//        GitHubUtils ghu = new GitHubUtils(CU._token);
        String str = "[\r\n"
        		+ "        {\r\n"
        		+ "          org: \"Org1\",\r\n"
        		+ "          name: \"Repo1\",\r\n"
        		+ "          branches: [\"Branch A\", \"Branch B\"],\r\n"
        		+ "          deletable: true,\r\n"
        		+ "        },\r\n"
        		+ "        { org: \"Org1\", name: \"Repo2\", branches: [], deletable: false },\r\n"
        		+ "        { org: \"Org1\", name: \"Repo3\", branches: [], deletable: false },\r\n"
        		+ "        { org: \"Org 2\", name: \"Repo4\", branches: [\"master\"], deletable: true },\r\n"
        		+ "        { org: \"Org 2\", name: \"Repo5\", branches: [], deletable: false },\r\n"
        		+ "      ]";
        //List<String> L = ghu.listUserRepositories();
        JSONPrinter out = new JSONPrinter(false);
        out.addElementRaw("repositories", str);
        res.successJson(out);
      }
  }
