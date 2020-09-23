import * as _ from 'lodash';
import { TreeItem, TreeView, window } from 'vscode';
import { ViewEmitter } from '../../definition/a_view_emitter';
import { IEntry } from '../../definition/i_entry';
import { Project } from '../../project';
import { SpecEntry } from './spec_entry';

export class SpecView extends ViewEmitter {
  private view: TreeView<IEntry>;

  constructor(private project: Project | undefined) {
    super();

    this.view = window.createTreeView('rubygems.explorer', { treeDataProvider: this });
    if (project) {
      this.project = project;
      this.setViewTitle(project.workspace?.name, this.project.name);
    }

    this.disposable.push(this.view);
    return this;
  }

  setProject(project: Project) {
    this.project = project;
    this.setViewTitle(project.workspace?.name, this.project.name);
    this.refresh();
  }

  setViewTitle(workspaceName: string | undefined, folderName: string) {
    let title = '';

    if (!workspaceName) title = folderName
    else if (workspaceName === folderName) title = workspaceName
    else title = workspaceName + ' ‣ ' + folderName

    this.view.title = title ? 'RUBYGEMS ∙ ' + title : 'RUBYGEMS';
  }

  async getTreeItem(element: IEntry): Promise<TreeItem> {
    return element.getTreeItem();
  }

  async getChildren(element?: IEntry): Promise<IEntry[]> {
    if (element) return element.getChildren();

    return this.getRoot();
  }

  async getRoot(): Promise<IEntry[]> {
    if (!this.project) return [];

    const specs = await this.project.getSpecs();
    
    const entries: SpecEntry[] = specs.map(spec => new SpecEntry(spec));
    return SpecEntry.sort(entries);
  }
}
