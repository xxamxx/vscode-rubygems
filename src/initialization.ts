
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
import { Global } from './global';
import { Project } from './project';
import { Disposition } from './shared/abstract/disposable';
import { GemspecNode } from './view/node/gemspec-node';

export class Initialization extends Disposition {
  private static singleton: Initialization;

  static async init(context: ExtensionContext) {
    if (this.singleton) return this.singleton;
    Global.init(context);
    
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
      commands.registerCommand('rubygems.command.reload', () => this.container.gemspecView.reload()),
      commands.registerCommand('rubygems.command.open-file', async resource => window.showTextDocument(resource)),
      commands.registerCommand('rubygems.command.open-rubygems-website', async (node: GemspecNode) => (node && node.openWebsite())),
      commands.registerCommand('rubygems.command.filter-nodes', () => this.search()),
      commands.registerCommand('rubygems.command.clear-search', () => this.container.gemspecView.search()),
      commands.registerCommand('rubygems.command.filter-reqs', node => this.container.gemspecView.filterDeps(node)),
      commands.registerCommand('rubygems.command.filter-deps', node => this.container.gemspecView.filterReqs(node)),
      commands.registerCommand('rubygems.command.focus', async () => this.container.focus()),
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
  }

  private async search(){
    const val = await window.showInputBox({
      placeHolder: 'Search RubyGems Information',
      prompt: 'Filter: name, version, path, platform, type(dependency|requirement)'
    })
    if (!val) return

    await this.container.gemspecView.filterNodes(val)
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
    
    // reveal GemspecNode by document
    this.container.gemspecView.focus(document.uri)
  }
}
