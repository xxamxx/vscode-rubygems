import { FileType, TreeItem, Uri } from "vscode";

export interface IEntry {
  uri: Uri;
  type: FileType;
  name: string;
  getChildren(): Promise<IEntry[]>;
  getTreeItem(): TreeItem;
}