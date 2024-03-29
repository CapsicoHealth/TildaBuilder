package tildabuilder;

import java.awt.Desktop;
import java.io.File;
import java.net.URI;

import org.apache.catalina.Context;
import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.WebResourceSet;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.EmptyResourceSet;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import tilda.utils.EncryptionUtil;
import tilda.utils.TextUtil;


public class Starter
  {
    protected static final Logger LOG = LogManager.getLogger(Starter.class.getName());

    public static Connector getSecureConnector(String webPort, String keystoreFile, String keystorePass)
    throws Exception
      {
        Connector secureConnector = new Connector();
        LOG.info("Listening on port " + webPort);
        boolean Error = false;
        if (TextUtil.isNullOrEmpty(keystoreFile) == true)
          {
            LOG.error("Environment variable keystoreFile is required");
            Error = true;
          }
        if (TextUtil.isNullOrEmpty(keystorePass) == true)
          {
            LOG.error("Environment variable keystorePass is required");
            Error = true;
          }
        if (Error == true)
          throw new Exception("Missing required Environmental variables");

        secureConnector.setPort(Integer.valueOf(webPort));
        secureConnector.setSecure(true);
        secureConnector.setScheme("https");
        secureConnector.setProperty("SSLEnabled", "true");
        secureConnector.setProperty("keystoreFile", keystoreFile);
        secureConnector.setProperty("keystorePass", keystorePass);
        secureConnector.setProperty("clientAuth", "false");
        secureConnector.setProperty("sslProtocol", "TLS");
        return secureConnector;

      }

    public static final String _RUNTIME_CODE = EncryptionUtil.getToken(32, true);;

    //
    // SEE ALSO: /CapsicoWebMLCatalog/src/main/java/com/capsico/ServerMain.java
    //

    public static void main(String[] args)
    throws Exception
      {
        Tomcat tomcat = new Tomcat();

        String webPort = System.getenv("PORT");
        if (TextUtil.isNullOrEmpty(webPort) == true)
          webPort = "8843";

        String keystoreFile = "..//tilda.bin"; // System.getenv("keystoreFile");
        String keystorePass = "tildaxyz123"; // System.getenv("keystorePass");

        tomcat.setConnector(getSecureConnector(webPort, keystoreFile, keystorePass));
        String WebappPath = new File("WebContent").getAbsolutePath();
        Context context = tomcat.addWebapp("/", WebappPath);
        // Path to Servlet classes
        File additionWebInfClassesFolder = new File("bin");
        WebResourceRoot resources = new StandardRoot(context);
        WebResourceSet resourceSet;
        if (additionWebInfClassesFolder.exists())
          {
            resourceSet = new DirResourceSet(resources, "/WEB-INF/classes", additionWebInfClassesFolder.getAbsolutePath(), "/");
            LOG.debug("loading WEB-INF resources from '" + additionWebInfClassesFolder.getAbsolutePath() + "'");
          }
        else
          {
            resourceSet = new EmptyResourceSet(resources);
          }
        resources.addPreResources(resourceSet);
        context.setResources(resources);
        tomcat.start();

        String url = "https://localhost:" + webPort + "?code=" + _RUNTIME_CODE;
        LOG.info("\n\n\n"
        +"\n********************************************************************************************************"
        +"\n****"
        +"\n****  Server started on "+url
        +"\n****"
        +"\n********************************************************************************************************"
        +"\n\n"
        );
        if (Desktop.isDesktopSupported() == true && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE) == true)
         Desktop.getDesktop().browse(new URI(url));
        else
         LOG.info("\n\n\n"
                 +"\n###############################################################################################################"
                 +"\n####"
                 +"\n####"
                 +"\n####  Your system doesn't seem to support launching a browser directly. Please use the following URL:"
                 +"\n####     "+url
                 +"\n####"
                 +"\n####"
                 +"\n###############################################################################################################"
                 +"\n\n"
                 );

        tomcat.getServer().await();
      }
  }
