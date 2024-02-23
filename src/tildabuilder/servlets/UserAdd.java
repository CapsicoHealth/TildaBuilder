package tildabuilder.servlets;

import java.util.List;

import javax.servlet.annotation.WebServlet;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.CollectionUtil;
import tilda.utils.json.JSONPrinter;
import tildabuilder.config.Config;
import tildabuilder.config.ConfigUser;
import wanda.web.RequestUtil;
import wanda.web.ResponseUtil;
import wanda.web.SimpleServletNonTransactional;

@WebServlet("/svc/user/add")
public class UserAdd extends SimpleServletNonTransactional
  {
    private static final long     serialVersionUID = 1018123535563202342L;
    protected static final Logger LOG              = LogManager.getLogger(UserAdd.class.getName());

    public UserAdd()
      {
        super(true);
      }

    @Override
    protected void justDo(RequestUtil req, ResponseUtil res)
    throws Exception
      {
        String userName = req.getParamString("userName", true);
        String userToken = req.getParamString("userToken", true);

        req.throwIfErrors();
        
        Config cfg = Config.getInstance();
        ConfigUser CU = cfg.getUser(userName);
        if (CU != null)
          {
            CU._token = userToken;
          }
        else
          {
            CU = new ConfigUser();
            CU._name = userName;
            CU._token = userToken;
            cfg._users.add(CU);
          }
        cfg.save();

        List<String> L = Config.getInstance().getUserNames();
        JSONPrinter out = new JSONPrinter(true);
        out.addElement("users", CollectionUtil.toStringArray(L));
        res.successJson(out);
      }
  }
