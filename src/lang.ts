import { App, Plugin, TFolder, TAbstractFile } from 'obsidian';

export default class Lang {
	NAME_APIKEY: string = "Api key";
	DESC_APIKEY: string = "Get Api key from wxob.pipebox.pro";
	PH_APIKEY: string   = "Enter your Api key";
    MORE_DESC:string    = "For more usage methods, to register a new account, or to provide feedback, please visit:";

	NAME_SAVEDIR: string = "Select folder to save";
	DESC_SAVEDIR: string = "Select which folder to save new messages";

	NAME_FILENAME: string         = "File name rule";
	DESC_FILENAME: string         = "Rule of added filename when received messages";
	FILENAME_RULE_CONTENT: string = "First line of message";

	NAME_CONFLICTFILE: string   = "Conflict filename rule";
	DESC_CONFLICTFILE: string   = "How to deal when filename already existed";
	CONFLICTFILE_NEW: string    = "Create new file";
	CONFLICTFILE_APPEND: string = "Append to existed file";

	NAME_REFRESHINTERVAL: string = "Refresh new message interval";
	DESC_REFRESHINTERVAL: string = "Refresh new message interval in seconds";

	APIKEY_VERIFYOK: string  = "Api key verify ok.";
    APIKEY_VERIFYERR: string = "Api key verify err:";

	NAME_VERIFYBTN: string = "Verify Api key";
	DESC_VERIFYBTN: string = "Check whether Api key is valid";

	ERROR: string       = "Message Plugin error:";
	API_ERROR: string   = "Message Plugin server response error:";
	API_USERERR: string = "Api key not found, user not exist.";

	constructor() {
        let lang = window.localStorage.getItem('language');
        if (lang == "zh" || lang == "zh-cn" || lang == "zh-TW") {
		    this.loadChineseLang();	
        } 
	}
	
	// load chinese lang 
	loadChineseLang() {
		this.NAME_APIKEY = "Api key";
		this.DESC_APIKEY = "前往wxob.pipebox.pro获取Api key";
		this.PH_APIKEY   = "请输入Api key";
        this.MORE_DESC   = "更多使用方法，注册新账户，意见反馈等 请访问:";

		this.NAME_SAVEDIR = "选择目录";
		this.DESC_SAVEDIR = "选择新消息要保存到的目录";

		this.NAME_FILENAME         = "文件名规则";
		this.DESC_FILENAME         = "收到新消息时保存文件的名字规则";
		this.FILENAME_RULE_CONTENT = "消息首行内容";

		this.NAME_CONFLICTFILE   = "文件名已存在时处理规则";
		this.DESC_CONFLICTFILE   = "当文件名已经存在时如何处理";
		this.CONFLICTFILE_NEW    = "创建新文件";
		this.CONFLICTFILE_APPEND = "在已存在的文件后添加";
	
		this.NAME_REFRESHINTERVAL = "新消息刷新间隔";
		this.DESC_REFRESHINTERVAL = "单位为秒";

		this.APIKEY_VERIFYOK  = "Api key 验证成功！";
		this.APIKEY_VERIFYERR = "Api key 验证失败:";

		this.NAME_VERIFYBTN = "检查Api key";
		this.DESC_VERIFYBTN = "测试Api key是否正确";
		
		this.ERROR       = "Message插件错误:";
		this.API_ERROR   = "Message插件服务器错误:";
		this.API_USERERR = "用户不存在。";
	}
}