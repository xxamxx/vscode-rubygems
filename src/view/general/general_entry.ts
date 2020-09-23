import * as _ from 'lodash';
import { join as pjoin } from 'path';
import { FileType, TreeItem, Uri } from 'vscode';
import { IEntry } from '../../core/definition/i_entry';
import { Utils } from '../../util';
import { GeneralItem } from './general_item';

export class GeneralEntry implements IEntry {
  constructor(
    public readonly uri: Uri,
    public readonly name: string,
    public readonly type: FileType = FileType.Unknown
  ) {}

  getTreeItem(): TreeItem {
    return new GeneralItem(this);
  }

  /**
   * @description 加载文件夹
   */
  async getChildren(): Promise<IEntry[]> {
    const path = this.uri.path;
    const list = await Utils.readDirectory(path);

    return _.chain(list)
      .sortBy(([name, type]) => -type, 0)
      .map(
        ([name, type]: [string, FileType]): IEntry => {
          const uri = Uri.parse(pjoin(path, name));
          return new GeneralEntry(uri, name, type);
        }
      )
      .value();
  }
}
