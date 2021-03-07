

import * as _ from 'lodash';
import { dirname } from 'path';
import { TreeView, window, Uri, TreeDataProvider, Event, EventEmitter } from 'vscode';
import { global } from "../global";
import { ParentNode, ViewNode } from '../shared/interface';
import { Project } from '../project';
import { GemspecNode } from './node/gemspec-node';
import { fp } from '../util/fp';
import { GemspecType } from '../shared/constant';

export class GemspecView implements TreeDataProvider<ViewNode> {
  readonly emitter: EventEmitter<ViewNode | undefined> = new EventEmitter<ViewNode | undefined>();
  readonly onDidChangeTreeData: Event<ViewNode | undefined> = this.emitter.event;
  readonly view: TreeView<ViewNode>;

  constructor(public project: Project | undefined) {
    this.view = window.createTreeView('rubygems.explorer', { treeDataProvider: this, showCollapseAll: true, canSelectMany: false });

    if (project) {
      this.project = project;
      this.setTitle(project.workspace?.name, this.project.name);
    }

    return this;
  }

  private setTitle(workspaceName: string | undefined, folderName: string) {
    let title = '';

    if (!workspaceName) title = folderName;
    else if (workspaceName === folderName) title = workspaceName;
    else title = workspaceName + ' ‣ ' + folderName;

    this.view.title = title ? 'RUBYGEMS ∙ ' + title : 'RUBYGEMS';
  }  
  
  refresh(): void {
    this.emitter.fire(undefined);
  }

  setProject(project: Project) {
    if (!project) return

    this.project = project;
    this.setTitle(project.workspace?.name, this.project.name);
    this.refresh();
  }

  async getTreeItem(element: ViewNode): Promise<ViewNode> {
    return element.getTreeItem();
  }

  async getChildren(element?: ParentNode): Promise<ViewNode[]> {
    if (element) return element.getChildren();

    return this.getRoot();
  }

  async getParent(element: ViewNode): Promise<ViewNode | null>{
    return element.getParent();
  }


  private nodes?: GemspecNode[];

  async getRoot(): Promise<GemspecNode[]> {
    if (this.nodes) return this.nodes
    
    return this.getGemspecNodes(this.filter)
  }

  
  private filter: any = undefined

  async reload(){
    this.nodes = await this.getGemspecNodes(this.filter, {cache: false})
    this.refresh()
  }
  
  async search(predicate?: any){
    this.nodes = await this.getGemspecNodes(this.filter = predicate)
    this.refresh()
  }

  async filterNodes(val: string){
    await this.search((someone: GemspecNode) => {
      return someone.gemspec.name.includes(val)
        || someone.gemspec.version.includes(val) 
        || someone.gemspec.platform.includes(val)  
        || someone.gemspec.type.includes(val) 
        || someone.gemspec.dir.includes(val) 
    })
  }

  async filterDeps(node: GemspecNode){
    const names = _.map(node.gemspec.specification.dependencies, 'name')

    await this.search((someone: GemspecNode) => names.includes(someone.gemspec.name))
  }

  async filterReqs(node: GemspecNode){
    await this.search((someone: GemspecNode) => {
      return !!_.find(someone.gemspec.specification.dependencies, {name: node.gemspec.name})
    })
  }
  

  async getGemspecNodes(predicate?: any, options = {cache: true}){
    if (!this.project) return [];

    const nodes = await this.project.findGemspecNodes(predicate, options);
    return this.nodes = _.sortBy(nodes, node => (node.gemspec.type === GemspecType.Requirement ? '0' : '1') + node.gemspec.name)
  }

  public focus = _.debounce(this._focus, 150)
  private async _focus(uri: Uri, opts = {select: true, focus: true, expand: 3}){
    if (!this.nodes) return

    const nodemap = _.keyBy(this.nodes, 'resourceUri.path')
    const node = this.nodes.find(node => {
      const samepath = fp.samedir(node.resourceUri.path, uri.path)
      return samepath ? !!nodemap[samepath] : false
    })
    if (!node) return
    
    let child
    if (node.resourceUri.equal(uri)) {
      child = node.choicePriorityChild()
    } else {
      const scopes = global.nodeStorage.scopes().sort().reverse()
      const scope = scopes.find(scope => scope === dirname(uri.path))
      
      if (scope) child = global.nodeStorage.get(scope).find(node => node.resourceUri.equal(uri))
      else if (this.project) child = await this.project.buildFileNode(uri.path)
    }
    
    if (child) await this.view.reveal(child, opts)
  }

}