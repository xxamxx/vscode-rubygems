import * as _ from 'lodash';
import { basename } from 'path';
import { TreeItem, TreeView, window, FileType, Uri } from 'vscode';
import { ViewEmitter } from '../../definition/a_view_emitter';
import { IEntry } from '../../definition/i_entry';
import { Project } from '../../project';
import { UriComparer } from '../../util/comparer';
import { choicePriorityFileUri } from '../../util/gem-util';
import { GeneralEntry } from '../general/general_entry';
import { SpecEntry } from './spec_entry';

export class SpecView extends ViewEmitter {
  public view: TreeView<IEntry>;

  constructor(public project: Project | undefined) {
    super();

    this.view = window.createTreeView('rubygems.explorer', { treeDataProvider: this, showCollapseAll: true, canSelectMany: false });

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

    if (!workspaceName) title = folderName;
    else if (workspaceName === folderName) title = workspaceName;
    else title = workspaceName + ' ‣ ' + folderName;

    this.view.title = title ? 'RUBYGEMS ∙ ' + title : 'RUBYGEMS';
  }

  async getTreeItem(element: IEntry): Promise<TreeItem> {
    return element.getTreeItem();
  }

  async getChildren(element?: IEntry): Promise<IEntry[]> {
    if (element) return element.getChildren();

    return this.getRoot();
  }

  async getParent(element: GeneralEntry): Promise<GeneralEntry | undefined>{
    const specs = await this.project?.getSpecs();
    if (!specs || specs.length <= 0) return undefined;

    const parent = element.getParent(specs);
    return parent
  }

  async getRoot(): Promise<IEntry[]> {
    if (!this.project) return [];

    const entries = await this.project.getSpecEntries();
    return SpecEntry.sort(entries);
  }


  async focus(uri: Uri){
    const entries = await this.project?.getSpecEntries();
    const specEntry = entries?.find(entry => UriComparer.contain(entry.uri, uri))
    if (!specEntry) return
    
    let entry
    if (UriComparer.equal(specEntry.uri, uri)){
      const fileUri = await choicePriorityFileUri(uri.path)
      entry = new GeneralEntry(fileUri, basename(fileUri.path), FileType.File);
    } else {
      entry = new GeneralEntry(uri, basename(uri.path), FileType.File);
    }
    
    await this.view.reveal(entry, {select: true, focus: true, expand: 3})
  }

}
