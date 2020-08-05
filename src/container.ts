import { window, workspace, ExtensionContext, Uri, RelativePattern, WorkspaceFoldersChangeEvent, WorkspaceFolder, QuickPickItem, ConfigurationChangeEvent, TextEditor, TextDocument } from "vscode";
import * as open from "open";
import { LockfileFolders } from "./lib/lockfile_folder";
import { GemFolders } from "./lib/gem_folder";
import { RubygemsProvider } from "./provider/rubygems_provider";
import { ADisposable } from './a_disposable';


export class Container extends ADisposable {
 
    static async getLockfileUris(workspaceFolders: Readonly<WorkspaceFolder[]>) {
        let uris: Uri[] = [];
        for (const workspaceFolder of workspaceFolders) {
            let relativePattern = new RelativePattern(workspaceFolder, '**/Gemfile.lock');
            const files = await workspace.findFiles(relativePattern);

            uris = uris.concat(files);
        }
        return uris;
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

        return visibleDefaultLockfileFolder || firstLockfileFolder;
    }
    
    constructor(public rubygemsProvider: RubygemsProvider) {
        super();
    }

    setCurrentLockfileFolder() {
        this.rubygemsProvider.lockfileFolder = Container.getCurrentLockfileFolder();
    }

    async openWebsite(url: string): Promise<void> {
        console.debug('open website', url);
        await open(url);
    }
    
    async openResource(resource: Uri): Promise<void> {
        console.debug('open resource', resource);
        await window.showTextDocument(resource);
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

    async selectLockfileFolder(): Promise<string | undefined> {
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

    async changeLockfile() {
        const folderName = await this.selectLockfileFolder();
        console.debug('in select workspace', folderName);
        if (!folderName) { return undefined; }
        const lockfileFolder = LockfileFolders.find(folderName);
        console.debug('lockfile folder', lockfileFolder);
        
        this.rubygemsProvider.lockfileFolder = lockfileFolder;
    }
}