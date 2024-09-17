import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import AppendPlugin from './main';
import Helper,{ AppendPluginSettings } from "./helper";
import Lang from './lang';
import Message from './message';

interface RespMsg {
    title: string
	content: string
	id: number
    createdAt: number
}

export default class Note {
	lang: Lang;
	app: App;
	plugin: AppendPlugin;
	helper: Helper;

	constructor(app: App, plugin:  AppendPlugin) {
		this.lang   = new Lang;
		this.app    = app;
		this.plugin = plugin;
		this.helper = new Helper
	}

	// get message and save to vault
	async getAndSaveMessage(isVerify: boolean) {
		try {
            if (this.plugin.settings == null || this.plugin.settings.apikey == null || this.plugin.settings.apikey == "") {
                throw Error(this.lang.PH_APIKEY);
            }
			let note = new Note(this.app, this.plugin);
			let messages = await (new Message).getMessage(this.plugin.settings.apikey, isVerify);
			for (let k in messages) {
				let msg = messages[k] as RespMsg;

				if (typeof msg !== "undefined" && msg.content.length > 0) {
                    // process prefix/suffix if setting exists
                    let content = this.dealPrefixOrSuffix(msg["content"], msg["createdAt"])
                    let title = msg["title"]
                    if (title.length > 1) {
                        title = this.filterTitle(title) + ".md"
                    }
					await note.addNote(this.plugin.settings, content, title, msg["createdAt"]);
				}
			}
		} catch (err) {
            console.error("getAndSaveMessage err:", err);
			throw err
		}
	}

	// add note to vault
	async addNote(setting: AppendPluginSettings, note: string, title: string, created: number) {
        let savedFolder = setting.savedFolder ?? "/"
        if (title.length < 1) {
		    title = this.getTitle(setting, note, created);
        }
        let fullpath    = ""
        if (savedFolder[savedFolder.length - 1] == "/") {
            if (savedFolder == "/") {
		        fullpath = title;
            } else {
		        fullpath = savedFolder + title;
            }
        } else if (savedFolder.length < 1) {
		    fullpath = title;
        } else {
		    fullpath = savedFolder + "/" + title;
        }
		try {
			// append mode default
			if (setting.conflictFileRule == null ||
                setting.conflictFileRule == "append" || 
                setting.conflictFileRule.length < 1) {
				if (this.fileExists(fullpath) ) {
					let originFile = this.app.vault.getAbstractFileByPath(fullpath)
					if (originFile instanceof TFile) {
						let originData = await this.app.vault.read(originFile);
                        var newData = ""
                        if (setting.insertPosition != null && setting.insertPosition == "beginning") {
						    newData = note + "\n" + originData;
                        } else {
                            // default insert at the end.
						    newData = originData + "\n" + note;
                        }
						await this.app.vault.modify(originFile, newData);
                        return
					} else {
						// error, should'n be here
						new Notice(this.lang.ERROR + "file:" + fullpath + " not exist with append mode.");
                        return
					}
				} else {
					// file not exist, just add it 
					await this.app.vault.create(fullpath, note);
                    return
				}
			} else {
			    // new file mode
				await this.app.vault.create(fullpath, note);
			}
        
			this.helper.addStatus("new message to note:"+fullpath, this.plugin);
		} catch (err) {
			console.error("MessageToObsidian addNote exception:", err);
			new Notice(this.lang.ERROR + "file:" + fullpath + " addNote exception:" + err);
		}
	}

	// generate title 
	getTitle(setting: AppendPluginSettings, note: string, created: number): string {
		let title = "";
		let date  = new Date();
        const year  = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day   = date.getDate().toString().padStart(2, '0');
		if (setting.filenameRule == "yyyy-mm-dd") {
			title = `${year}-${month}-${day}`;
		}

		if (setting.filenameRule == "mm-dd") {
			title = `${month}-${day}`;
		}

		if (setting.filenameRule == this.lang.FILENAME_RULE_CONTENT) {
			title = note.substr(0, 20);
			let split = note.split("\n");
			if (typeof split[0] != "undefined" && split[0] != null && split[0].length > 0) {
				title = split[0].substr(0, 20)	
			}
		}

        if (setting.filenameRule == "fixed" && setting.fixedTitle.length > 0) {
            title = this.helper.formatDateInStr(setting.fixedTitle, created)
        }

        // if title is empty, give it a default name
        if (title == "") {
			title = `${year}-${month}-${day}`;
        }
        // filter special char 
        title = this.filterTitle(title)
        
		// append to exist file, so no need to detect if file exists
		if (setting.conflictFileRule != "new") {
			return title + ".md";
		}

		// 'new mode', need to check if file exist or not
		let f = setting.savedFolder + "/" + title + ".md";
		if (!this.fileExists(f)) {
			return title + ".md";
		}

		// just need a new name to resolve conflict
		for (let i = 0; i <= 1000; i++){
			let newFile = setting.savedFolder + "/" + title + "(" + i + ")" + ".md";
			if (!this.fileExists(newFile)) {
				return 	title + "(" + i + ")" + ".md";
			}
		}

		// shouldn't be here.
		new Notice(this.lang.ERROR + "generate filename err...");
		return Math.random() + ".md";
	}

	// detect if file exists 
    // file MUST NOT start with /, eg: Inbox/22-22.md  22-11.md
	fileExists(file: string): boolean {
        let f = this.app.vault.getAbstractFileByPath(file)
		if (f == null) {
			return false;
		}
		return f instanceof TFile;
	}

    // deal with prefix/suffix of content 
    dealPrefixOrSuffix(note: string, created: number): string {
        let settings = this.plugin.settings
        if (settings.contentPrefix != null) {
            if (settings.contentPrefix.length > 0) {
                let prefix = this.helper.formatDateInStr(settings.contentPrefix, created)
                prefix = prefix.replace(/\\n/g, '\n')
                note = prefix + note
            }
        }
        if (settings.contentSuffix != null) {
            if (settings.contentSuffix.length > 0) {
                let suffix = this.helper.formatDateInStr(settings.contentSuffix, created)
                suffix = suffix.replace(/\\n/g, '\n')
                note = note + suffix
            }
        }

        return note
    }

    // filter title special char 
    filterTitle(title: string): string {
        if (title.length < 1) { return "" }
        const validChars = title.match(/[a-zA-Z0-9\u4e00-\u9fa5+-_.@]+/g);
        if (!validChars) {
            return 'undefined';
        }
        let newTitle = validChars.join('');
        return newTitle.replace(/[/\\^:]/g, "")
    }
}
