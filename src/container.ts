import { commands, window, workspace, Disposable, ExtensionContext, Uri, RelativePattern, WorkspaceFoldersChangeEvent, WorkspaceFolder, QuickPickItem, ConfigurationChangeEvent, TextEditor, TextDocument } from "vscode";
import * as open from "open";
import { LockfileFolders } from "./lib/lockfile_folder";
import { GemFolders } from "./lib/gem_folder";
import { RubygemsProvider } from "./provider/rubygems_provider";
import { Utils } from "./util";


export class Container {
    static rubygemsProvider: RubygemsProvider;

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

    static getCurrentLockfileFolder() {
        // 当前活跃的编辑器
        const editor = window.activeTextEditor;
        const lockfileFolder = editor ? LockfileFolders.match(editor.document.uri) : undefined;
        if (lockfileFolder) { return lockfileFolder; }

        const firstLockfileFolder = LockfileFolders.folders[0];

        // 打开的编辑中选第一个
        const lockfileFolders = window.visibleTextEditors.map(element => {
            return LockfileFolders.match(element.document.uri);
        });
        const visibleDefaultLockfileFolder = lockfileFolders[0];

        console.debug('getCurrentLockfileFolder', visibleDefaultLockfileFolder, firstLockfileFolder);

        return visibleDefaultLockfileFolder || firstLockfileFolder;
    }
    
    static async initialization(context: ExtensionContext) {
        console.log(context);
        
        if (!workspace.workspaceFolders) { return Disposable.from(); }
        const canSwitchLockfileFolder = workspace.getConfiguration('rubygems.explore').get('autoSwitchLockfileFolder', true);
        let gemFolderPaths: string[] = workspace.getConfiguration('rubygems.context').get('gemPath', []);
        if (!gemFolderPaths.length) { gemFolderPaths = Utils.getGemPaths(); }
        console.debug('rubygemsFolders', gemFolderPaths);
        
        if (!gemFolderPaths || !gemFolderPaths.length) { return Disposable.from(); }
        const disposable = [];

        // - 筛选出所有lockfile
        const uris = await this.getLockfileUris(workspace.workspaceFolders);

        // - 初始化 RubygemsFolder 和 LockfileFolders
        await LockfileFolders.addFolders(uris);
        await GemFolders.addFolders(gemFolderPaths);

        // - 监控所有 lockfile
        const watcher = workspace.createFileSystemWatcher('**/Gemfile.lock');
        watcher.onDidCreate((uri: Uri) => this.onLockfilesAdded([uri]));
        watcher.onDidDelete((uri: Uri) => this.onLockfilesDeleted([uri]));
        watcher.onDidChange((uri: Uri) => this.onLockfileChanged([uri]));
        disposable.push(watcher);

        // - 注册命令
        const lockfileFolder = window.activeTextEditor?.document.uri ? LockfileFolders.match(window.activeTextEditor?.document.uri) : undefined;
        disposable.push(commands.registerCommand('rubygems.explorer.refresh', () => this.rubygemsProvider.refresh()));
        disposable.push(commands.registerCommand('rubygems.explorer.openFile', resource => this.openResource(resource)));
        disposable.push(commands.registerCommand('rubygems.explorer.openWebsite', url => this.openWebsite(url)));
        disposable.push(commands.registerCommand('rubygems.explorer.selectLockfileFolder', () => this.changeLockfile()));
        disposable.push(window.registerTreeDataProvider('rubygems.explorer', (this.rubygemsProvider = new RubygemsProvider(lockfileFolder))));

        // - 监听 workspace change event
        disposable.push(workspace.onDidChangeWorkspaceFolders(e => this.onWorkspaceFolderChanged(e)));
        disposable.push(workspace.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        if (canSwitchLockfileFolder) { 
            await this.onTextEditorActiveChanged(window.activeTextEditor);
            disposable.push(window.onDidChangeActiveTextEditor((e) => this.onTextEditorActiveChanged(e)));
            disposable.push(workspace.onDidOpenTextDocument((e) => this.onTextDocumentActivated(e)));
         }

        return Disposable.from(...disposable);
    }

    static async openWebsite(url: string): Promise<void> {
        console.debug('open website', url);
        await open(url);
    }
    
    static async openResource(resource: Uri): Promise<void> {
        console.debug('open resource', resource);
        await window.showTextDocument(resource);
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

    static async onWorkspaceFolderChanged(e: WorkspaceFoldersChangeEvent) {
        if (e.added.length) {
            const uris = await this.getLockfileUris((e.added as WorkspaceFolder[]));
            await this.onLockfilesAdded(uris);
        }

        if (e.removed.length) {
            const uris = await this.getLockfileUris((e.removed as WorkspaceFolder[]));
            await this.onLockfilesDeleted(uris);
        }
    }

    static async onLockfilesAdded(uris: Uri[]) {
        console.debug('onLockfilesAdded', uris);
        await LockfileFolders.addFolders(uris);
    }
    
    static async onLockfilesDeleted(uris: Uri[]) {
        console.debug('onLockfilesDeleted', uris);
        await LockfileFolders.removeFolders(uris);
        if (this.rubygemsProvider) { this.rubygemsProvider.lockfileFolder = this.getCurrentLockfileFolder(); }
    }

    static async onLockfileChanged(uris: Uri[]) {
        for (const uri of uris) {
            await LockfileFolders.get(uri)?.reload();
        }
    }

    static async onConfigurationChanged(e: ConfigurationChangeEvent) {
        console.debug('in configuration');
        if (e.affectsConfiguration('rubygems.context.ruby') && e.affectsConfiguration('rubygems.context.gemPath')) {
        }
        await GemFolders.reload();
        this.rubygemsProvider.refresh();
    }

    static async onTextEditorActiveChanged(editor: TextEditor | undefined) {
        console.debug('in text editor changed');
        if (!editor) { return; }
        this.onTextDocumentActivated(editor.document);
    }

    static async onTextDocumentActivated(document: TextDocument | undefined) {
        console.debug('in text document changed');
        if (!document) { return; }
        console.debug('editor event', document.uri.fsPath);
        const lockfileFolder = LockfileFolders.match(document.uri);
        if (lockfileFolder && !this.rubygemsProvider.lockfileFolder?.equal(lockfileFolder)) { 
            this.rubygemsProvider.lockfileFolder = lockfileFolder;
         }
    }

    static async selectLockfileFolder(): Promise<string | undefined> {
        const items: QuickPickItem[] = LockfileFolders.getQuickPickItems();
        const item: QuickPickItem | undefined = await window.showQuickPick(items, {
            matchOnDescription: true,
            matchOnDetail: true,
            ignoreFocusOut: true,
            canPickMany: false,
            placeHolder: 'Please Pick Lockfile Folder'
        });
        console.debug('pick workspace', item?.label);
        return item?.label;
    }

    static async changeLockfile() {
        const folderName = await this.selectLockfileFolder();
        console.debug('in select workspace', folderName);
        if (!folderName) { return undefined; }
        const lockfileFolder = LockfileFolders.find(folderName);
        console.debug('lockfile folder', lockfileFolder);
        
        this.rubygemsProvider.lockfileFolder = lockfileFolder;
    }
}