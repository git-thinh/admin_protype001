using System;
using System.Collections.Generic;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;

public class cache : IHttpHandler
{
    #region [ Store ]

    static string pathAPI = HttpContext.Current.Server.MapPath("~/api/");
    static string pathFile = HttpContext.Current.Server.MapPath("~/file/");
    static string categoryJson = "";

    static string[] tempKeys = new string[] { };
    static ConcurrentDictionary<string, string> tempCache = new ConcurrentDictionary<string, string>() { };
    static ConcurrentDictionary<string, string> fileCache = new ConcurrentDictionary<string, string>() { };
    static ConcurrentDictionary<string, long> fileUpdate = new ConcurrentDictionary<string, long>() { };
    static List<Article> listArticle = new List<Article>() { };

    static void load_listArticle()
    {
        int x = 0;
        lock (listArticle)
            x = listArticle.Count;
        if (x == 0)
        {
            long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));
            var aFile = Directory.GetFiles(pathFile, "*.txt");
            int k = 0;
            foreach (var fi in aFile)
            {
                string file = fi.ToLower();
                string text = formatText(File.ReadAllText(file).Trim());
                string fileName = Path.GetFileName(file);
                var it = Article.Get(fileName, text, k);
                it.content = "";
                lock (listArticle)
                    listArticle.Add(it);
                if (!fileCache.ContainsKey(it.recid.ToString()))
                {
                    fileUpdate.TryAdd(it.recid.ToString(), date);
                    fileCache.TryAdd(it.recid.ToString(), text);
                }
                k++;
            }
        }
    }

    static void load_Temp()
    {
        int k = 0;
        lock (tempKeys)
            k = tempKeys.Length;

        if (k == 0)
        {
            string pathTemp = HttpContext.Current.Server.MapPath("~/temp/");
            var aTemp = Directory.GetFiles(pathTemp);
            foreach (var fi in aTemp)
            {
                string view = "[" + Path.GetFileName(fi).ToLower() + "]";
                string text = File.ReadAllText(fi);
                tempCache.TryAdd(view, text);
            }
            lock (tempKeys)
                tempKeys = tempCache.Keys.ToArray();
        }
    }

    static string formatContent(Article item)
    { 
        List<string> lsHeadingASCII = new List<string>() { "a.", "b.", "c.", "d.", "e.", "f.", "g.", "h.", "i.", "j.", "k.", "l.", "m.", "n.", "o.", "p.", "q.", "r.", "s.", "t.", "u.", "v.", "w.", "x.", "y.", "z." };

        List<string> lsHeading = new List<string>() { "II", "IV", "VI", "IX" };
        string con = item.content;
        //List<string> listImg = new List<string>();
        //var ms = Regex.Matches(con, "{img(.+?)img}", RegexOptions.IgnoreCase);
        //foreach (Match mi in ms)
        //{
        //    string img = mi.ToString();
        //    listImg.Add(img);
        //}
        string[] a = con.Split(new string[] { "\n", "\r" }, StringSplitOptions.None).Select(x => x.Trim()).Where(x => x != "").ToArray();

        StringBuilder bi = new StringBuilder("<div class=article-cndata>");
        bi.Append(string.Format("{0}<h1>{1}</h1>{0}", Environment.NewLine, item.title));

        if (!string.IsNullOrEmpty(item.image))
        {
            foreach (string src in item.image.Split(';'))
                bi.Append(string.Format("{0}<p class=img><img src=\"{1}\"></p>{0}", Environment.NewLine, src));
        }

        foreach (string si in a)
        {
            if (string.IsNullOrEmpty(si)) continue;

            string tag = "";
            if (si.StartsWith("{img") && si.EndsWith("img}"))
            {
                string src = si.Substring(4);
                src = src.Substring(0, src.Length - 4).Trim();
                tag = string.Format("{0}<p class=img><img src=\"{1}\"></p>{0}", Environment.NewLine, src);
            }
            else
            {
                int len = si.Split(' ').Length;
                if (len < 20 && (
                    char.IsDigit(si[0]) ||
                    si[0] == '*' ||
                    si[0] == 'I' ||
                    si[0] == 'V' ||
                    si[0] == 'X' ||
                    lsHeading.IndexOf(si.Substring(0, 2)) != -1)
                    )
                    tag = string.Format("{0}<h3>{1}</h3>{0}", Environment.NewLine, si);
                else if (len < 20 && lsHeadingASCII.IndexOf(si.Substring(0, 2).ToLower()) != -1)
                    tag = string.Format("{0}<h6>{1}</h6>{0}", Environment.NewLine, si);
                else
                    tag = string.Format("{0}<p>{1}</p>{0}", Environment.NewLine, si);
            }
            bi.Append(tag);
        }
        bi.Append(Environment.NewLine);


        bi.Append("</div>");

        string CONTENT = bi.ToString();
        return CONTENT;
    }

    public static string get_Temp(string fileName)
    {
        load_listArticle();
        load_Temp();

        if (categoryJson == "")
            categoryJson = File.ReadAllText(Path.Combine(pathAPI, "category.json"));

        bool blog = false;
        Article item = null;
        lock (listArticle)
            item = listArticle.Where(x => x.url == fileName).Take(1).SingleOrDefault();
        blog = item != null;

        string content = "";
        if (blog)
        {
            fileCache.TryGetValue(item.recid.ToString(), out content);
            item = JsonConvert.DeserializeObject<Article>(content);
            content = formatContent(item);
            fileName = "blog.htm";
        }

        string htm = "", key = string.Format("[{0}]", fileName);
        if (tempCache.TryGetValue(key, out htm) && htm.IndexOf(".htm]") != -1)
            foreach (string ki in tempKeys)
                htm = htm.Replace(ki, tempCache[ki]);

        if (blog)
            htm = htm.Replace("[CONTENT]", content);
        htm = htm.Replace("category.json", categoryJson);

        return htm;
    }

    public static bool update_Temp(string fileName, string temp)
    {
        if (temp == null) temp = "";
        temp = temp.Trim();
        long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));
        string pathAPI = HttpContext.Current.Server.MapPath("~/temp/");
        string file = Path.Combine(pathAPI, fileName);
        File.WriteAllText(file, temp);

        string key = "[" + fileName + "]";
        if (tempCache.ContainsKey(key))
            tempCache[key] = temp;
        else
            tempCache.TryAdd(key, temp);

        lock (tempKeys)
            tempKeys = tempCache.Keys.ToArray();

        return true;
    }

    public static bool update_Json(string fileName, string json)
    {
        if (json == null) json = "";
        json = json.Trim();
        long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));
        string file = Path.Combine(pathAPI, fileName);
        File.WriteAllText(file, json);

        if (fileName == "category.json") categoryJson = json;

        /* remove new line */
        if (json.Length > 0 && (json[0] == '{' || json[0] == '['))
        {
            var obj = JsonConvert.DeserializeObject(json);
            json = JsonConvert.SerializeObject(obj);
        }

        string text = formatText(json);
        if (fileUpdate.ContainsKey(fileName))
            fileUpdate[fileName] = date;
        else
            fileUpdate.TryAdd(fileName, date);

        if (fileCache.ContainsKey(fileName))
            fileCache[fileName] = text;
        else
            fileCache.TryAdd(fileName, text);

        return true;
    }

    public static string update_Article(Article it)
    {
        string json = it.ToString();
        string file = Path.Combine(pathFile, it.recid.ToString() + ".txt");
        File.WriteAllText(file, json);

        long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));

        string text = formatText(json);
        string con = it.content;
        it.content = "";
        lock (listArticle)
        {
            int index = listArticle.FindIndex(x => x.recid == it.recid);
            if (index == -1)
                listArticle.Add(it);
            else
                listArticle[index] = it;
        }

        if (!fileCache.ContainsKey(it.recid.ToString()))
        {
            fileUpdate.TryAdd(it.recid.ToString(), date);
            fileCache.TryAdd(it.recid.ToString(), text);
        }
        else {
            fileUpdate[it.recid.ToString()] = date;
            fileCache[it.recid.ToString()] = text;
        }

        string article = "";
        lock (listArticle)
            article = JsonConvert.SerializeObject(listArticle);
        fileUpdate.TryAdd("article.json", date);
        fileCache.TryAdd("article.json", article);

        it.content = con;
        return JsonConvert.SerializeObject(new { item = it, list = listArticle });
    }

    public static string remove_Article(string _id)
    {
        string article = "";
        long id = 0;
        if (long.TryParse(_id, out id) && id > 0)
        {
            long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));

            string fileDel = Path.Combine(pathFile, _id + ".txt");
            if (File.Exists(fileDel))
                File.Delete(fileDel);

            long rs = 0;
            fileUpdate.TryRemove(_id, out rs);
            string rss;
            fileCache.TryRemove(_id, out rss);

            lock (listArticle)
            {
                int index = listArticle.FindIndex(x => x.recid == id);
                if (index != -1)
                    listArticle.RemoveAt(index);
                article = JsonConvert.SerializeObject(listArticle);
            }

            fileUpdate.TryAdd("article.json", date);
            fileCache.TryAdd("article.json", article);
        }
        else
            lock (listArticle)
                article = JsonConvert.SerializeObject(listArticle);

        return article;
    }

    static string formatText(string text)
    {
        return text.Replace(Environment.NewLine, "∆").Replace("\n", "∆").Replace("\r", "∆");
    }

    static void bindFile()
    {
        lock (listArticle)
            listArticle.Clear();

        fileCache.Clear();
        fileUpdate.Clear();

        long date = long.Parse(DateTime.Now.ToString("yyMMddHHmmss"));

        /*************************/

        /*************************/

        string pathAPI = HttpContext.Current.Server.MapPath("~/api/");
        var aAPI = Directory.GetFiles(pathAPI);
        foreach (var fi in aAPI)
        {
            string file = fi.ToLower();
            string json = File.ReadAllText(file).Trim();
            /* remove new line */
            if (json.Length > 0 && (json[0] == '{' || json[0] == '['))
            {
                var obj = JsonConvert.DeserializeObject(json);
                json = JsonConvert.SerializeObject(obj);
            }
            string text = formatText(json);
            string fileName = Path.GetFileName(file);
            fileUpdate.TryAdd(fileName, date);
            fileCache.TryAdd(fileName, text);
        }

        /*************************/

        load_listArticle();

        /*************************/

        string article = "";
        lock (listArticle)
            article = JsonConvert.SerializeObject(listArticle);
        fileUpdate.TryAdd("article.json", date);
        fileCache.TryAdd("article.json", article);

        /*************************/

        string pathView = HttpContext.Current.Server.MapPath("~/view/");
        var aView = Directory.GetFiles(pathView);
        foreach (var fi in aView)
        {
            string view = Path.GetFileName(fi).ToLower();
            string text = File.ReadAllText(fi);
            text = text.Replace(Environment.NewLine, "♣");
            fileUpdate.TryAdd(view, date);
            fileCache.TryAdd(view, text);
        }

        /*************************/

        load_Temp();

        /*************************/



        /*************************/
    }

    #endregion

    public bool IsReusable
    {
        get { return true; }
    }

    const string empty = "data: \n\n";
    public void ProcessRequest(HttpContext context)
    {
        bindFile();

        HttpResponse res = context.Response;
        res.ContentType = "text/event-stream";
        res.AddHeader("Content-Type", "text/event-stream");
        //res.AddHeader("Cache-Control", "no-cache");
        //res.AddHeader("Access-Control-Allow-Origin", "*");
        //res.KeepAlive = true;
        string[] keys = fileCache.Keys.ToArray();
        int k = 0, timeOut = 10;
        string data = "";

        data = "data: " + keys.Length.ToString() + "\n\n";
        res.Write(data);
        res.Flush();

        while (true)
        {
            if (!context.Response.IsClientConnected)
                break;
            if (k < keys.Length)
            {
                System.Threading.Thread.Sleep(1000);
                data = "data: " + keys[k] + "|" + fileCache[keys[k]] + "\n\n";
                res.Write(data);
                res.Flush();
            }
            else if (k == keys.Length)
            {
                //System.Threading.Thread.Sleep(3000);
                res.Write("data: COMPLETE\n\n");
                res.Flush();
            }
            else
            {
                timeOut = 9000;
                context.Response.Write(empty);
                res.Flush();
            }

            if (k == int.MaxValue) k = keys.Length + 1;
            k++;
            System.Threading.Thread.Sleep(timeOut);
        }
    }
}