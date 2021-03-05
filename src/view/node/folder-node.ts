
import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import { ChildNode, ParentNode } from "../../shared/interface";
import { FileUri } from "../../lib/ext/file-uri";
import { getFolderChildren } from "./base-node";

export class FolderNode extends TreeItem{
  readonly resourceUri!: FileUri;
  children: ChildNode[] = []

  constructor(
    uri: FileUri,
    readonly parent: ParentNode,
    readonly contextValue: string,
    state: TreeItemCollapsibleState = TreeItemCollapsibleState.Collapsed,
    readonly command?: Command
  ) {
    super(uri, state)
  }

  get id(): string {
    return this.parent.id + '.' + this.resourceUri.name
  }

  get label() {
    return this.resourceUri.name
  }
  
  getTreeItem(): FolderNode {
    return this
  }

  async getChildren(): Promise<ChildNode[]> {
    return this.children = await getFolderChildren(this)
  }

  getParent(): ParentNode{
    return this.parent
  }
}