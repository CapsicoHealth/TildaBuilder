package tildabuilder.servlets;

import java.util.List;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.CollectionUtil;
import tilda.utils.json.JSONPrinter;
import tildabuilder.config.Config;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/user/list")
public class UserList extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(UserList.class.getName());

    public UserList()
      {
        super(false);
      }

    @Override
    protected void justDo(RequestUtil Req, ResponseUtil Res)
      throws Exception
      {
        List<String> L = Config.getInstance().getUserNames();
        JSONPrinter out = new JSONPrinter(true);
        out.addElement("users", CollectionUtil.toStringArray(L));
        Res.successJson(out);
      }
  }
