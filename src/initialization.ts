import * as open from "open";
import { commands, ConfigurationChangeEvent, ExtensionContext, TextDocument, TextEditor, Uri, window, workspace } from "vscode";
import { Container } from "./container";
import { ADisposable } from './core/definition/a_disposable';
import { Project } from "./core/project";

export class Initialization extends ADisposable  {
    private static singleton: Initialization;

    static async init(context: ExtensionContext) {
        if (this.singleton) return this.singleton;

        const container = await Container.init();
        return this.singleton = new Initialization(container);
    }
    
    private constructor(public container: Container) {
        super();   
    }

    async registerAll() {
        await this.registerCommand();
        await this.registerEvent();
        await this.registerWatcher();
        await this.registerView();
    }

    async registerCommand() {
        // - 注册命令
        this.disposable.push(commands.registerCommand('rubygems.explorer.refresh', () => this.container.specview.refresh()));
        this.disposable.push(commands.registerCommand('rubygems.explorer.openFile', resource => this.openResource(resource)));
        // this.disposable.push(commands.registerCommand('rubygems.explorer.openWebsite', url => this.openWebsite(url)));
        // this.disposable.push(commands.registerCommand('rubygems.explorer.selectLockfileFolder', () => this.pickLockfileFolder()));
    }

    async registerWatcher(){
        // - 监控所有 lockfile
        // const watcher = workspace.createFileSystemWatcher('**/Gemfile.lock');
        // watcher.onDidCreate((uri: Uri) => this.onLockfilesAdded([uri]));
        // watcher.onDidDelete((uri: Uri) => this.onLockfilesDeleted([uri]));
        // watcher.onDidChange((uri: Uri) => this.onLockfileChanged([uri]));
        // this.disposable.push(watcher);
    }

    async registerEvent() {
        // - 监听 workspace change event
        // this.disposable.push(workspace.onDidChangeWorkspaceFolders(e => this.onWorkspaceFolderChanged(e)));
        this.disposable.push(workspace.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        this.disposable.push(window.onDidChangeActiveTextEditor((e) => this.onTextEditorActiveChanged(e)));
        this.disposable.push(workspace.onDidOpenTextDocument((e) => this.onTextDocumentActivated(e)));
    }

    async registerView() {
        this.disposable.push(window.registerTreeDataProvider('rubygems.explorer', this.container.specview));
    }

    private async openWebsite(url: string): Promise<void> {
        console.debug('open website', url);
        await open(url);
    }

    private async openResource(resource: Uri): Promise<void> {
        console.debug('open resource', resource);
        await window.showTextDocument(resource);
    }


    private async onConfigurationChanged(e: ConfigurationChangeEvent) {
        if (e.affectsConfiguration('rubygems.context.ruby')) {
          this.container.refresh();
        }
    }

    private async onTextEditorActiveChanged(editor: TextEditor | undefined) {
        console.debug('in text editor changed');
        if (!editor) { return; }
        this.onTextDocumentActivated(editor.document);
    }

    private async onTextDocumentActivated(document: TextDocument | undefined) {
        if (!document) return; 
        const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) return; 

        const uris = await Project.findProjectUris([workspaceFolder]);
        this.container.setCurrentFolder(uris[0]);
    }
}