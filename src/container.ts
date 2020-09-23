import { ExtensionContext, Uri, window } from 'vscode';
import { ADisposable } from './core/definition/a_disposable';
import { Project } from './core/project';
import { Utils } from './util';
import { UriComparer } from './util/comparer';
import { SpecView } from './view/specification/spec_view';

export class Container extends ADisposable {
  private static singleton: Container;
  public static context: ExtensionContext;

  /**
   * 根据打活跃的编辑器选择对应的文件夹
   */
  static async getCurrentProject(): Promise<Project | undefined> {
    const workspaceFolder = Utils.getCurrentWorkspaceFolder();
    if (!workspaceFolder) return;

    const uris = await Project.findProjectUris([workspaceFolder]);
    if (uris.length === 0) return;
    if (uris.length === 1) return new Project(uris[0]);
    let prj;

    // 当前活跃的编辑器
    const editor = window.activeTextEditor;
    if (editor) prj = uris.find(uri => UriComparer.contain(uri, editor.document.uri));

    // 打开的编辑中选第一个
    const visible = [];
    for (const editor of window.visibleTextEditors) {
      const uri = uris.find(uri => UriComparer.contain(uri, editor.document.uri));
      if (uri) visible.push(uri);
    }
    if (visible.length) prj = visible[0];

    if (!prj) return;

    return new Project(prj);
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
}
