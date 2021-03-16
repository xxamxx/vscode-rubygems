import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";
import { ParentNode } from "../../shared/interface";
import { FileUri } from "../../lib/ext/file-uri";

export class FileNode extends TreeItem{
  readonly resourceUri!: FileUri;

  constructor(
    uri: FileUri,
    readonly parent: ParentNode,
    readonly contextValue: string,
    readonly command: Command = { 
      command: 'rubygems.command.open-file', title: 'Open File', arguments: [uri] 
    }
  ) {
    super(uri, TreeItemCollapsibleState.None)
  }

  get id(): string {
    return this.parent.id + '.' + this.resourceUri.name
  }

  get label() {
    return this.resourceUri.name
  }
  
  getTreeItem(): FileNode {
    return this
  }

  getChildren(): undefined {
    return undefined
  }

  getParent(): ParentNode{
    return this.parent
  }
}