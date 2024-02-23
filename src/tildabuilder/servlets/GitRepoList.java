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

@WebServlet("/svc/repo/list")
public class GitRepoList extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(GitRepoList.class.getName());

    public GitRepoList()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
      throws Exception
      {
        String userName = req.getParamString("userName", true);
        
        Config cfg = Config.getInstance();
        ConfigUser CU = cfg.getUser(userName);
        if (CU == null)
         throw new NotFoundException("user", userName);

        GitHubUtils ghu = new GitHubUtils(CU._token);
        List<String> L = ghu.listUserRepositories();
        JSONPrinter out = new JSONPrinter(true);
        out.addElement("repositories", CollectionUtil.toStringArray(L));
        res.successJson(out);
      }
  }
