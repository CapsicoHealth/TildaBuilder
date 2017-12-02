package tildabuilder;

import java.io.File;
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


public class Starter
  {
    protected static final Logger LOG        = LogManager.getLogger(Starter.class.getName());
    public static Connector getSecureConnector()
    throws Exception
    {
      Connector secureConnector = new Connector();
      String webPort = System.getenv("PORT");
      if(webPort == null || webPort.isEmpty()) {
          webPort = "8443";
          LOG.info("DEFAULT: Listening on port "+webPort);
      }
      String keystoreFile = System.getenv("keystoreFile");
      String keystorePass = System.getenv("keystorePass");
      if(keystoreFile == null || keystoreFile.isEmpty() || keystorePass == null || keystorePass.isEmpty())
        {
          if(keystoreFile == null || keystoreFile.isEmpty())
            {
              LOG.error("Environment variable keystoreFile is required");
            }
          if(keystorePass == null || keystorePass.isEmpty())
            {
              LOG.error("Environment variable keystoreFile is required");
            }
          throw new Exception("Missing required Environmental variables");
        }

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
    public static void main(String[] args)
    throws Exception
      {
        String WebappPath = new File("WebContent").getAbsolutePath();
        Tomcat tomcat = new Tomcat();
        tomcat.setConnector(getSecureConnector());
        Context context = tomcat.addWebapp("/TildaBuilder", WebappPath);
        // Path to Servlet classes
        File additionWebInfClassesFolder = new File("bin");
        WebResourceRoot resources = new StandardRoot(context);
        WebResourceSet resourceSet;
        if (additionWebInfClassesFolder.exists()) 
          {
            resourceSet = new DirResourceSet(resources, "/WEB-INF/classes", additionWebInfClassesFolder.getAbsolutePath(), "/");
            LOG.debug("loading WEB-INF resources from as '" + additionWebInfClassesFolder.getAbsolutePath() + "'");
          }
        else
          {
            resourceSet = new EmptyResourceSet(resources);
          }
        resources.addPreResources(resourceSet);
        context.setResources(resources);
        tomcat.start();
        tomcat.getServer().await();
      }
  }
