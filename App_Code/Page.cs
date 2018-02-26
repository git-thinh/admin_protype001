using System;
using System.IO;
using System.Web;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.Text;
using System.Collections.Generic;

public class page : IHttpHandler
{
    static string pathDir = "";
    public void ProcessRequest(HttpContext context)
    {
        if (pathDir == "")
            pathDir = context.Server.MapPath("~/");

        string htm = "", key = context.Request.Path.Substring(1); 
        switch (key)
        {
            case "index.html":
                htm = cache.get_Temp("home.htm");
                break;
            default: 
                htm = cache.get_Temp(key);
                break;
        } 
        context.Response.Clear();
        context.Response.ContentType = "text/html";
        context.Response.Write(htm);
        context.Response.Flush();
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}
