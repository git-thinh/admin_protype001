using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;

public class json : IHttpHandler
{
    public bool IsReusable
    {
        get { return true; }
    }

    public void ProcessRequest(HttpContext context)
    {
        HttpRequest ret = context.Request;
        HttpResponse res = context.Response;
        //res.AddHeader("Cache-Control", "no-cache");
        //res.AddHeader("Access-Control-Allow-Origin", "*");
        //res.KeepAlive = true;
        
        string fileName = ret.QueryString["file"];

        switch (ret.HttpMethod)
        { 
            case "POST": 
                if(!string.IsNullOrEmpty(fileName))
                { 
                    string data = "";
                    using (StreamReader stream = new StreamReader(context.Request.InputStream))
                    {
                        data = stream.ReadToEnd();
                        data = HttpUtility.UrlDecode(data).Trim();
                    }
                    data = data.Replace('Γ', '+');

                    cache.update_Json(fileName, data);
                    
                    context.Response.ContentType = "text/plain";
                    context.Response.Write("OK");
                }
                break;
        }
    }
}