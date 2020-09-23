import * as _ from 'lodash';
import { TreeItem } from 'vscode';
import { SpecType } from '../../constant';
import { Spec } from '../../spec';
import { GeneralEntry } from '../general/general_entry';
import { SpecItem } from './spec_item';

export class SpecEntry extends GeneralEntry {
  static from(spec: Spec): SpecEntry {
    return new SpecEntry(spec);
  }

  static sort(entries: SpecEntry[]): SpecEntry[] {
    return _.chain(entries).sortBy((entry) => {
      return (entry.spec.type === SpecType.Requirement ? '0' : '1') + entry.name 
    }).value();
  }

  constructor(public readonly spec: Spec) {
    super(spec.uri, spec.name);
  }

  getTreeItem(): TreeItem {
    return SpecItem.from(this.spec);
  }
}
