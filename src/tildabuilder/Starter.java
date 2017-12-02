package tildabuilder;

import java.io.File;

import javax.servlet.ServletException;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class Starter
  {

    public static void main(String[] args)
    throws ServletException, LifecycleException
      {
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(1789);
        String WebappPath = new File("WebContent").getAbsolutePath();
        Context context = tomcat.addWebapp("/TildaBuilder", WebappPath);
        tomcat.start();
        tomcat.getServer().await();
      }
  }
