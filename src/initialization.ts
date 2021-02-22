
import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  TextDocument,
  TextEditor,
  window,
  workspace
} from 'vscode';
import { Container } from './container';
import { ADisposable } from './definition/a-disposable';
import { Project } from './project';
import { SpecEntry } from './view/spec/spec-entry';

export class Initialization extends ADisposable {
  private static singleton: Initialization;

  static async init(context: ExtensionContext) {
    if (this.singleton) return this.singleton;

    const container = await Container.init(context);
    const initialization = new Initialization(container);
    await initialization.registerAll();
    return (this.singleton = initialization);
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
    this.disposable.push(
      commands.registerCommand('rubygems.command.refresh', () => this.container.specview.refresh()),
      commands.registerCommand('rubygems.command.open-file', async resource => window.showTextDocument(resource)),
      commands.registerCommand('rubygems.command.open-rubygems-website', async (entry: SpecEntry) => (entry && entry.openWebsite())),
      commands.registerCommand('rubygems.command.search', (...args) => console.log(args)),
      commands.registerCommand('rubygems.command.filter-reqs', (...args) => console.log(args)),
      commands.registerCommand('rubygems.command.filter-deps', (...args) => console.log(args)),
      commands.registerCommand('rubygems.command.focus', async () => this.container.focus()),
      commands.registerCommand('rubygems.command.all-collapsed', (...args) => console.log(args)),
    );
    
    // // this.disposable.push(commands.registerCommand('rubygems.explorer.selectLockfileFolder', () => this.pickLockfileFolder()));
  }

  async registerWatcher() {
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
    this.disposable.push(window.onDidChangeActiveTextEditor(e => this.onTextEditorActiveChanged(e)));
    this.disposable.push(workspace.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
    this.disposable.push(workspace.onDidOpenTextDocument(e => this.onTextDocumentActivated(e)));
  }

  async registerView() {
    this.disposable.push(window.registerTreeDataProvider('rubygems.explorer', this.container.specview));
  }

  private async onConfigurationChanged(e: ConfigurationChangeEvent) {
    if (e.affectsConfiguration('rubygems.context.ruby')) {
      this.container.refresh();
    }
  }

  private async onTextEditorActiveChanged(editor: TextEditor | undefined) {
    console.debug('open document', editor?.document.uri.path);
    if (!editor?.document) return;
    this.onTextDocumentActivated(editor.document);
  }
  
  private async onTextDocumentActivated(document: TextDocument | undefined) {
    if (!document) return;

    // set current gemfile project folder
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      const uris = await Project.findProjectUris([workspaceFolder]);
      this.container.setCurrentFolder(uris[0]);
    }
    
    // reveal entry by document
    this.container.specview.focus(document.uri)
  }
}
