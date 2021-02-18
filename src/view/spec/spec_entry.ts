import * as open from 'open';
import * as _ from 'lodash';
import { TreeItem, workspace } from 'vscode';
import { SpecType } from '../../constant';
import { Spec } from '../../spec';
import { GeneralEntry } from '../general/general_entry';
import { SpecItem } from './spec_item';
import { SpecReplacer } from '../../util/spec-replacer';

export class SpecEntry extends GeneralEntry {
  static from(spec: Spec): SpecEntry {
    return new SpecEntry(spec);
  }

  static sort(entries: SpecEntry[]): SpecEntry[] {
    return _.chain(entries)
      .sortBy(entry => {
        return (entry.spec.type === SpecType.Requirement ? '0' : '1') + entry.name;
      })
      .value();
  }

  constructor(public readonly spec: Spec) {
    super(spec.uri, spec.name);
  }

  getTreeItem(): TreeItem {
    return SpecItem.from(this.spec);
  }

  async openWebsite(){
    const txt: string | undefined = workspace.getConfiguration('rubygems.other').get('website');
    if (!txt) return;

    const replacer = new SpecReplacer(this.spec)
    const url = replacer.replace(txt)
    await open(url)
  }
}
