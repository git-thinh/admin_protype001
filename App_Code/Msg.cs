
public enum MsgType
{
    NONE = 0,
    OPEN = 1,
    LINK = 2,
    CHAT = 3,
    CLOSE = 99
}

public class Msg
{
    public long recid { set; get; }
    public long SID { set; get; }
    public MsgType Type { set; get; }
    public string Data { set; get; }
    public string Link { set; get; }
    public long TimeBegin { set; get; }
}