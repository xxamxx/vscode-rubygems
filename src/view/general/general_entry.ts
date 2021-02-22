import * as _ from 'lodash';
import { basename, dirname, join as pjoin } from 'path';
import { FileType, TreeItem, Uri } from 'vscode';
import { IEntry } from '../../definition/i_entry';
import { Spec } from '../../spec';
import { Utils } from '../../util';
import { FileStat } from '../../lib/file-stat';
import { SpecEntry } from '../spec/spec_entry';
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
    const list: [string, FileStat][] = await Utils.readDirectory(path);

    return _.chain(list)
      .sortBy(([name, stat]) => -stat.type, 0)
      .map(
        ([name, stat]): IEntry => {
          const uri = Uri.parse(pjoin(path, name));
          return new GeneralEntry(uri, name, stat.type);
        }
      )
      .value();
  }

  getParent(specs: Spec[] = []): GeneralEntry | undefined {
    const path = dirname(this.uri.path)
    const uri = Uri.parse(path);

    let spec: any = specs.find(spec => spec.uri.path === uri.path)
    let entry: GeneralEntry | SpecEntry
    if (spec) entry = new SpecEntry(spec);
    else entry = new GeneralEntry(uri, basename(path), FileType.Directory);

    return entry as GeneralEntry
  }
}
