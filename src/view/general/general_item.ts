import { FileType, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { IEntry } from '../../definition/i_entry';

export class GeneralItem extends TreeItem {
  public readonly contextValue: string = 'rubygems.explorer.generalitem';
  public readonly command = { command: 'rubygems.command.open-file', title: 'Open File', arguments: [this.uri] };

  public get name(): string {
    return this.entry.name;
  }
  public get uri(): Uri {
    return this.entry.uri;
  }
  public get label(): string {
    return this.name;
  }

  public constructor(public readonly entry: IEntry) {
    super(
      entry.uri,
      entry.type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None
    );
  }
}
