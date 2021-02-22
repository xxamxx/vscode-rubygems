
import _ = require('lodash');
import { ExtensionContext, Uri, workspace, WorkspaceFolder } from 'vscode';
import { ADisposable } from './definition/a-disposable';
import { Project } from './project';
import { Utils } from './util';
import { getSameActiveTextEditor, getSamedirActiveTextEditor, getCurrentTextEditors } from './util/vscode-util';
import { SpecView } from './view/spec/spec-view';

export class Container extends ADisposable {
  private static singleton: Container;
  public static context: ExtensionContext;

  /**
   * 根据打活跃的编辑器选择对应的文件夹
   */
  static async getCurrentProject(): Promise<Project | undefined> {
    const workspaceFolder = Utils.getOpenWorkspaceFolder();
    if (!workspaceFolder && !workspace.workspaceFolders) return;

    // 先获取当前打开的workspace，可缩窄查找范围
    // 没有打开的workspace，就查找所有的workspace
    const workspaceFolders = workspaceFolder
      ? [workspaceFolder]
      : (workspace.workspaceFolders as Readonly<WorkspaceFolder[]>);
    const uris = await Project.findProjectUris(workspaceFolders);
    if (uris.length === 0) return;
    if (uris.length === 1) return new Project(uris[0]);

    const activeUri = uris.find(uri => !!getSamedirActiveTextEditor(uri))
    
    //上面都没有合适的，默认选中首个可用项目
    return new Project(activeUri || uris[0]);
  }

  static pickActiveTextEditorUri(uris: Uri[]): Uri | undefined{
    for (const uri of uris) {
      const editor = getSameActiveTextEditor(uri)
      if (editor) return editor.document.uri
    }
    
    const editors = getCurrentTextEditors()
    return editors[0]?.document.uri
  }

  static async init(context: ExtensionContext) {
    if (this.singleton) return this.singleton;

    this.context = context;
    const project = await this.getCurrentProject();
    return (this.singleton = new Container(new SpecView(project)));
  }

  private constructor(public specview: SpecView) {
    super();
    this.disposable.push(this.specview);
  }

  async setCurrentFolder(uri: Uri | undefined) {
    let project;
    if (uri) project = new Project(uri);
    else project = await Container.getCurrentProject();

    if (!project) return;
    this.specview.setProject(project);
  }

  refresh() {
    this.specview.refresh();
  }

  async focus(){
    const specs = await this.specview.project?.getSpecs()
    const uris = _.map(specs || [], 'uri')
    const uri = Container.pickActiveTextEditorUri(uris)

    if(uri) await this.specview.focus(uri)
  }
}
