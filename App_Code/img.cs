using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;

public class img : IHttpHandler
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

        string pathImg = HttpContext.Current.Server.MapPath("~/images/");
        string folder = ret.QueryString["folder"];
        string fileName = ret.QueryString["file"];

        switch (ret.HttpMethod)
        {
            case "GET":
                if (string.IsNullOrEmpty(folder))
                {
                    string result = JsonConvert.SerializeObject(Directory.GetDirectories(pathImg).Select((x, k) => new { recid = k + 1, name = Path.GetFileName(x) }).ToArray());
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                }
                else
                {
                    string path = Path.Combine(pathImg, folder);
                    if (Directory.Exists(path))
                    {
                        string result = JsonConvert.SerializeObject(Directory.GetFiles(path).Select((x, k) => new { recid = ((k + 1) * 1000), pid = folder, name = "images/" + folder + "/" + Path.GetFileName(x) }).ToArray());
                        context.Response.ContentType = "text/plain";
                        context.Response.Write(result);
                    }
                }
                break;
            case "DELETE": 
                string pathDir = HttpContext.Current.Server.MapPath("~/");
                string fileDel = Path.Combine(pathDir, fileName);
                if (File.Exists(fileDel))
                    File.Delete(fileDel);

                context.Response.ContentType = "text/plain";
                context.Response.Write("[]");
                break;
            case "POST": 
                if (ret.Files.Count > 0)
                {
                    string pathFolder = Path.Combine(pathImg, folder);
                    string pathFile = Path.Combine(pathFolder, fileName);

                    HttpPostedFile file = ret.Files[0];
                    file.SaveAs(pathFile);

                    string result = JsonConvert.SerializeObject(Directory.GetFiles(pathFolder).Select((x, k) => new { recid = ((k + 1) * 1000), pid = folder, name = "images/" + folder + "/" + Path.GetFileName(x) }).ToArray());
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                }
                break;
        }
    }
}