import { commands, window, workspace, Disposable, ExtensionContext, Uri, RelativePattern, WorkspaceFolder, WorkspaceFoldersChangeEvent } from "vscode";
import { LockfileFolders } from "./lib/lockfile_folder";
import { GemFolders } from "./lib/gem_folder";
import { RubygemsProvider } from "./provider/rubygems_provider";
import { ADisposable } from './a_disposable';
import { Utils } from "./util";
import { Container } from "./container";


export class Initialization extends ADisposable  {
    container: Container;

    static async check(context: ExtensionContext): Promise<boolean> {
        let executable = true;
        let rubyPath: string = workspace.getConfiguration('rubygems.context').get('ruby', Utils.getGemBin());
        if (!rubyPath) {
            executable = false;
            await window.showErrorMessage('not has ruby path! please set.');
        } else if (rubyPath && (!Utils.fs.exists(rubyPath) || !(await Utils.fs.stat(rubyPath)).isFile())) {
            executable = false;
            await window.showErrorMessage(`invalid ruby path: ${rubyPath}`);
        }

        let gemFolderPaths: string[] = workspace.getConfiguration('rubygems.context').get('gemPath', []);
        if (!gemFolderPaths.length) { gemFolderPaths = Utils.getGemPaths(); }
        
        if (!gemFolderPaths.length) {
            executable = false;
            await window.showErrorMessage('not has gems path! please set.');
        } else {
            const invalidPaths = [];
            for (const gemFolderPath of gemFolderPaths) {
                const stat = await Utils.fs.stat(gemFolderPath);
                if (!stat.isDirectory()) {
                    executable = false;
                    invalidPaths.push(gemFolderPath);
                    await window.showErrorMessage(`invalid gems path: ${gemFolderPath}`);
                }
            }
        }

        return executable;
    }
    
    static async preinit(context: ExtensionContext) {
        console.log(context);
        
        if (!workspace.workspaceFolders) { return Disposable.from(); }
        
        let gemFolderPaths: string[] = workspace.getConfiguration('rubygems.context').get('gemPath', []);
        if (!gemFolderPaths.length) { gemFolderPaths = Utils.getGemPaths(); }
        console.debug('rubygemsFolders', gemFolderPaths);

        if (!gemFolderPaths || !gemFolderPaths.length) { return Disposable.from(); }
        
        // - 筛选出所有lockfile
        const uris = await this.getLockfileUris(workspace.workspaceFolders);
        
        // - 初始化 RubygemsFolder 和 LockfileFolders
        await LockfileFolders.addFolders(uris);
        await GemFolders.addFolders(gemFolderPaths);
    }

    static async getLockfileUris(workspaceFolders: Readonly<WorkspaceFolder[]>) {
        let uris: Uri[] = [];
        for (const workspaceFolder of workspaceFolders) {
            let relativePattern = new RelativePattern(workspaceFolder, '**/Gemfile.lock');
            const files = await workspace.findFiles(relativePattern);

            uris = uris.concat(files);
        }
        return uris;
    }
    
    constructor(public context: ExtensionContext) {
        super();
        const lockfileFolder = Container.getCurrentLockfileFolder();
        this.container = new Container(new RubygemsProvider(lockfileFolder));
    }

    async init() {
        await this.registerAll();

        const canSwitchLockfileFolder = workspace.getConfiguration('rubygems.explore').get('autoSwitchLockfileFolder', true);
        if (canSwitchLockfileFolder) { await this.onTextEditorActiveChanged(window.activeTextEditor); }
    }

    async registerAll() {
        await this.registerCommand();
        await this.registerEvent();
        await this.registerWatcher();
        await this.registerProvider();
    }

    async registerCommand() {
                // - 注册命令
        this.disposable.push(commands.registerCommand('rubygems.explorer.refresh', () => this.container.rubygemsProvider.refresh()));
        this.disposable.push(commands.registerCommand('rubygems.explorer.openFile', resource => this.openResource(resource)));
        this.disposable.push(commands.registerCommand('rubygems.explorer.openWebsite', url => this.openWebsite(url)));
        this.disposable.push(commands.registerCommand('rubygems.explorer.selectLockfileFolder', () => this.changeLockfile()));
    }

    async registerWatcher(){
        // - 监控所有 lockfile
        const watcher = workspace.createFileSystemWatcher('**/Gemfile.lock');
        watcher.onDidCreate((uri: Uri) => this.onLockfilesAdded([uri]));
        watcher.onDidDelete((uri: Uri) => this.onLockfilesDeleted([uri]));
        watcher.onDidChange((uri: Uri) => this.onLockfileChanged([uri]));
        this.disposable.push(watcher);
    }

    async registerEvent() {
        // - 监听 workspace change event
        this.disposable.push(workspace.onDidChangeWorkspaceFolders(e => this.onWorkspaceFolderChanged(e)));
        this.disposable.push(workspace.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        this.disposable.push(window.onDidChangeActiveTextEditor((e) => this.onTextEditorActiveChanged(e)));
        this.disposable.push(workspace.onDidOpenTextDocument((e) => this.onTextDocumentActivated(e)));
    }

    async registerProvider() {
        this.disposable.push(window.registerTreeDataProvider('rubygems.explorer', this.rubygemsProvider));
    }

    async onWorkspaceFolderChanged(e: WorkspaceFoldersChangeEvent) {
        console.log('onWorkspaceFolderChanged', e);
        if (e.added.length) {
            const uris = await Container.getLockfileUris((e.added as WorkspaceFolder[]));
            await this.onLockfilesAdded(uris);
        }

        if (e.removed.length) {
            const uris = await Container.getLockfileUris((e.removed as WorkspaceFolder[]));
            await this.onLockfilesDeleted(uris);
        }
    }

    async onLockfilesAdded(uris: Uri[]) {
        console.debug('onLockfilesAdded', uris);
        await LockfileFolders.addFolders(uris);
    }

    async onLockfilesDeleted(uris: Uri[]) {
        console.debug('onLockfilesDeleted', uris);
        LockfileFolders.removeFolders(uris);
        this.container.setCurrentLockfileFolder();
    }

    async onLockfileChanged(uris: Uri[]) {
        for (const uri of uris) {
            await LockfileFolders.get(uri)?.reload();
        }
    }

    async onConfigurationChanged(e: ConfigurationChangeEvent) {
        console.debug('in configuration');
        if (e.affectsConfiguration('rubygems.context.ruby') && e.affectsConfiguration('rubygems.context.gemPath')) {
        }
        await GemFolders.reload();
        this.rubygemsProvider.refresh();
    }

    async onTextEditorActiveChanged(editor: TextEditor | undefined) {
        console.debug('in text editor changed');
        if (!editor) { return; }
        this.onTextDocumentActivated(editor.document);
    }

    async onTextDocumentActivated(document: TextDocument | undefined) {
        console.debug('in text document changed');
        if (!document) { return; }
        console.debug('editor event', document.uri.fsPath);
        const lockfileFolder = LockfileFolders.match(document.uri);
        if (lockfileFolder && !this.rubygemsProvider.lockfileFolder?.equal(lockfileFolder)) {
            this.rubygemsProvider.lockfileFolder = lockfileFolder;
        }
    }
}