using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;

/// <summary>
/// Summary description for Class1
/// </summary>
public class Article
{
    public Article() { }
    public static Article Get(string fileName, string text, int index)
    {
        if (text[0] == '{')
        {
            var it = JsonConvert.DeserializeObject<Article>(text);
            it.file = fileName;
            return it;
        }
        else
        {
            Article it = new Article();

            string[] a = text.Trim().Split(new string[] { Environment.NewLine, "\n", "\r", "∆" }, System.StringSplitOptions.None);
            it.title = a[0];
            it.url = ToAscii(a[0]);
            it.content = text;
            it.file = fileName;
            it.recid = long.Parse(DateTime.Now.ToString("yyMMddHHmmssfff")) + new Random().Next(0, 99999);
            it.active = false;
            it.tag = "";
            it.image = "";
            it.image_position = 0;
            it.keyword = "";
            it.topic = "";
            it.order = 999;

            //string json = JsonConvert.SerializeObject(it);
            //string pathFile = HttpContext.Current.Server.MapPath("~/file/"); 
            //string file = Path.Combine(pathFile, fileName);
            //File.WriteAllText(file, json);

            return it;
        }
    }

    public long recid { set; get; }
    public string url { set; get; }
    public string title { set; get; }
    public bool active { set; get; }

    public string topic { set; get; }
    public string tag { set; get; }
    public string image { set; get; }
    public int image_position { set; get; }
    public string keyword { set; get; }
    public string file { set; get; }

    //[JsonIgnore]
    public string content { set; get; }
    public int order { set; get; }

    public override string ToString()
    {
        return JsonConvert.SerializeObject(this);
    }

    public static String ToAscii(string unicode)
    {
        if (string.IsNullOrEmpty(unicode)) return "";
        unicode = unicode.ToLower();

        unicode = Regex.Replace(unicode.Trim(), "[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        unicode = Regex.Replace(unicode.Trim(), "[óòỏõọôồốổỗộơớờởỡợ]", "o");
        unicode = Regex.Replace(unicode.Trim(), "[éèẻẽẹêếềểễệ]", "e");
        unicode = Regex.Replace(unicode.Trim(), "[íìỉĩị]", "i");
        unicode = Regex.Replace(unicode.Trim(), "[úùủũụưứừửữự]", "u");
        unicode = Regex.Replace(unicode.Trim(), "[ýỳỷỹỵ]", "y");
        unicode = unicode.Trim().Replace("đ", "d").Replace("đ", "d");
        unicode = Regex.Replace(unicode.Trim(), "[-\\s+/]+", "-");
        unicode = Regex.Replace(unicode.Trim(), "\\W+", "-"); //Nếu bạn muốn thay dấu khoảng trắng thành dấu "_" hoặc dấu cách " " thì thay kí tự bạn muốn vào đấu "-"
        return unicode.ToLower().Trim();
    }
}



public class apiArticle : IHttpHandler
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
        string pathFile = HttpContext.Current.Server.MapPath("~/file/");
        string id = ret.QueryString["id"];
        string data = "";

        switch (ret.HttpMethod)
        {
            case "DELETE":
                if (!string.IsNullOrEmpty(id))
                {
                    string rs = cache.remove_Article(id);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(rs);
                }
                break;
            case "POST":
                /* add new | update */
                using (StreamReader stream = new StreamReader(context.Request.InputStream))
                {
                    data = stream.ReadToEnd();
                    data = HttpUtility.UrlDecode(data).Trim();
                }
                data = data.Replace('Γ', '+');

                Type _type = typeof(Article);
                var it = JsonConvert.DeserializeObject<Article>(data);
                if (it.recid == 0)
                {
                    // Add new
                    it.recid = long.Parse(DateTime.Now.ToString("yyMMddHHmmssff")) + new Random().Next(0, 99999);
                    it.url = Article.ToAscii(it.title) + "_" + it.recid.ToString() + ".html";
                    string result = cache.update_Article(it);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                }
                else
                {
                    // Update
                    it.url = Article.ToAscii(it.title) + "_" + it.recid.ToString() + ".html";
                    string result = cache.update_Article(it);
                    context.Response.ContentType = "text/plain";
                    context.Response.Write(result);
                }
                break;
        }
    }
}