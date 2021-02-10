import { FileType, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { IEntry } from '../../definition/i_entry';

export class GeneralItem extends TreeItem {
  public readonly contextValue: string = 'rubygems.generalitem';
  public readonly command = { command: 'rubygems.command.openFile', title: 'Open File', arguments: [this.uri] };

  public get name(): string {
    return this.entry.name;
  }
  public get uri(): Uri {
    return this.entry.uri;
  }
  public get label(): string {
    return this.name;
  }
  // public get contextValue(): string {
  //   switch (this.entry.type) {
  //     case FileType.Directory:
  //       return 'folder';
  //     case FileType.File:
  //     case FileType.SymbolicLink:
  //       return 'file';
  //     default:
  //       return '';
  //   }
  // }

  public constructor(public readonly entry: IEntry) {
    super(
      entry.uri,
      entry.type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None
    );
  }
}
