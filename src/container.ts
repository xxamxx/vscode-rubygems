
import _ = require('lodash');
import { ExtensionContext, Uri, workspace, WorkspaceFolder } from 'vscode';
import { ws } from './util';
import { Project } from './project';
import { GemspecView } from './view/gemspec-view';
import { Disposition } from './shared/abstract/disposable';
import { FileUri } from './lib/ext/file-uri';

export class Container extends Disposition {
  private static singleton: Container;
  public static context: ExtensionContext;

  /**
   * 根据打活跃的编辑器选择对应的文件夹
   */
  static async getCurrentProject(): Promise<Project | undefined> {
    const workspaceFolder = ws.getOpenWorkspaceFolder();
    if (!workspaceFolder && !workspace.workspaceFolders) return;

    // 先获取当前打开的workspace，可缩窄查找范围
    // 没有打开的workspace，就查找所有的workspace
    const workspaceFolders = workspaceFolder
      ? [workspaceFolder]
      : (workspace.workspaceFolders as Readonly<WorkspaceFolder[]>);
    const uris = await Project.findProjectUris(workspaceFolders);
    if (uris.length === 0) return;
    if (uris.length === 1) return new Project(await FileUri.from(uris[0]));

    const activeUri = uris.find(uri => !!ws.getSamedirActiveTextEditor(uri))
    
    //上面都没有合适的，默认选中首个可用项目
    return new Project(await FileUri.from(activeUri || uris[0]));
  }

  static pickActiveTextEditorUri(uris: Uri[]): Uri | undefined{
    for (const uri of uris) {
      const editor = ws.getSameActiveTextEditor(uri)
      if (editor) return editor.document.uri
    }
    
    const editors = ws.getCurrentTextEditors()
    return editors[0]?.document.uri
  }

  static async init(context: ExtensionContext) {
    if (this.singleton) return this.singleton;

    this.context = context;
    const project = await this.getCurrentProject();
    return (this.singleton = new Container(new GemspecView(project)));
  }

  private constructor(public gemspecView: GemspecView) {
    super();
  }

  async setCurrentFolder(uri: Uri | undefined) {
    let project;
    if (uri) project = new Project(await FileUri.from(uri));
    else project = await Container.getCurrentProject();

    if (!project) return;
    this.gemspecView.setProject(project);
  }

  async focus(){
    const nodes = await this.gemspecView.project?.findGemspecNodes()
    const uris = _.map(nodes || [], 'resourceUri')
    const uri = Container.pickActiveTextEditorUri(uris)

    if(uri) await this.gemspecView.reveal(uri)
  }
}
