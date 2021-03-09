import _ = require("lodash");
import { extname } from "path";
import { env, Command, TreeItem, TreeItemCollapsibleState, workspace, Uri } from "vscode";
import { Gemspec } from "../../model/gemspec";
import { DefineFile, SpecfileExtname, GemspecType } from "../../shared/constant";
import { global } from "../../global";
import { ChildNode } from "../../shared/interface";
import { FileUri } from "../../lib/ext/file-uri";
import { getFolderChildren } from "./base-node";


const DefinedPriorityFiles = [
  'readme', 
  'readme.md', 
  DefineFile.Gemfile.toLowerCase(), 
  DefineFile.Lockfile.toLowerCase()
]

export class GemspecNode extends TreeItem{
  readonly contextValue: string = 'rubygems.explorer.node.gemspec';
  readonly resourceUri!: FileUri;
  children: ChildNode[] = [];

  constructor(
    readonly gemspec: Gemspec, 
    state: TreeItemCollapsibleState = TreeItemCollapsibleState.Collapsed, 
    readonly command?: Command
  ){
    super(gemspec.uri, state)
  }

  get id(): string {
    return 'rubygems.explorer.' + this.gemspec.fullname
  }

  get label() {
    return this.gemspec.name
  }

  get description() {
    return this.gemspec.localness
      ? `${this.gemspec.version} - Local` 
      : this.gemspec.version;
  }

  get tooltip(): string{
    return this.gemspec.fullname + 
      (this.gemspec.localness ? ' - Local' : '');
  }

  get iconPath() {
    const svg = this.gemspec.type === GemspecType.Requirement ? 'spec.svg' : 'dependency.svg';
    return {
      light: global.context.asAbsolutePath('resources/icon/light/' + svg),
      dark: global.context.asAbsolutePath('resources/icon/dark/' + svg)
    };
  }

  getTreeItem(): GemspecNode {
    return this
  }

  async getChildren(): Promise<ChildNode[]> {
    return this.children = await getFolderChildren(this)
  }

  getParent(): null{
    return null
  }
  
  async openWebsite(){
    let url: string = workspace.getConfiguration('rubygems.other').get('website') || '';
    if (url == '') return;

    Object.entries(this.gemspec).forEach(([key, val])=>{
      if (typeof val === 'string') url = url.replace(`\$\{${key}\}`, val)
    })

    const uri = await env.asExternalUri(Uri.parse(url))
    return env.openExternal(uri)
  }

  choicePriorityChild(){
    const list = _.sortBy(this.children, [(child) => {
      const file = child.resourceUri.name.toLowerCase()
  
      // .gemspec 优先
      if (extname(file) === SpecfileExtname) return Number.MIN_SAFE_INTEGER
      // 指定文件次之
      else if (DefinedPriorityFiles.includes(file)) return Number.MIN_SAFE_INTEGER + DefinedPriorityFiles.indexOf(file)
      // 按 UTF-16 code
      else return file
    }])
  
    return list[0]
  }
}