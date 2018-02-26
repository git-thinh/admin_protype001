using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;

public class InfoReply
{
    public long recid { set; get; }
    public string phone { set; get; }
    public string fullname { set; get; }
    public string note { set; get; }
    public long time { set; get; }
}

public class contact : IHttpHandler
{
    static string fileReply = HttpContext.Current.Server.MapPath("~/api/reply.json");
    static List<InfoReply> listData = new List<InfoReply>() { };

    public bool IsReusable
    {
        get { return true; }
    }

    public void ProcessRequest(HttpContext context)
    {
        if (listData.Count == 0 && File.Exists(fileReply))
        {
            try
            {
                string json = File.ReadAllText(fileReply);
                listData = JsonConvert.DeserializeObject<List<InfoReply>>(json);
            }
            catch { }
        }

        HttpRequest ret = context.Request;
        HttpResponse res = context.Response;

        string data = "";
        using (StreamReader stream = new StreamReader(context.Request.InputStream))
        {
            data = stream.ReadToEnd();
            data = HttpUtility.UrlDecode(data).Trim();
        }
        try
        {
            InfoReply item = new InfoReply();
            item.fullname = ret.Form["fullname"];
            item.phone = ret.Form["phone"];
            item.note = ret.Form["note"];

            item.time = long.Parse(DateTime.Now.ToString("yyMMddHHmmssff"));
            item.recid = item.time + new Random().Next(0, 99);
            listData.Insert(0, item);

            string text = JsonConvert.SerializeObject(listData);
            File.WriteAllText(fileReply, text);
        }
        catch { }

        ////res.ContentType = "text/plain";
        //////res.AddHeader("Content-Type", "text/event-stream");
        //////res.AddHeader("Cache-Control", "no-cache");
        //////res.AddHeader("Access-Control-Allow-Origin", "*");
        //////res.KeepAlive = true;  
        //////string text = "data: " + msg + "\n\n";
        ////res.Write("OK");
        ////res.Flush();
        res.Redirect("/");
    }
}