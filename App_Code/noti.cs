using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;


public class noti : IHttpHandler
{
    public bool IsReusable
    {
        get { return true; }
    }

    const string empty = "data: \n\n";
    public void ProcessRequest(HttpContext context)
    {
        HttpResponse res = context.Response;
        res.ContentType = "text/event-stream";
        res.AddHeader("Content-Type", "text/event-stream");
        //res.AddHeader("Cache-Control", "no-cache");
        //res.AddHeader("Access-Control-Allow-Origin", "*");
        //res.KeepAlive = true; 
        List<long> lsID = new List<long>() { };

        int k = 0, timeOut = 1000, max = 3;
        while (true)
        {
            if (!context.Response.IsClientConnected)
                break;
            long time = long.Parse(DateTime.Now.ToString("yyMMddHHmmssfff"));
            long id = 0;
            MsgType type = MsgType.NONE;
            string data = "", link = "";
            if (k < max)
            {
                id = time + new Random().Next(0, 999);
                lsID.Add(id);
                type = MsgType.OPEN;
                data = id.ToString().Substring(6, 6);
            }
            else {
                id = lsID[new Random().Next(0, max)];
                type = MsgType.LINK;
                data = time.ToString();
                link = time.ToString() + ".html";
            }
            
            string msg = JsonConvert.SerializeObject(new Msg()
            {
                recid = time,
                SID = id,
                Link = link,
                Data = data,
                TimeBegin = time,
                Type = type
            });
            string text = "data: " + msg + "\n\n";
            res.Write(text);
            res.Flush();

            k++;
            if (k == int.MaxValue) k = 0;
            System.Threading.Thread.Sleep(timeOut);
        }
    }
}