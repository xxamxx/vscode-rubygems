/// <reference path='../definition.ts'>

import { TreeItem } from 'vscode';
import { Spec } from '../../core/spec';
import { GeneralEntry } from '../general/general_entry';
import { SpecItem } from './spec_item';


export class SpecEntry extends GeneralEntry {
  
    static from(spec: Spec): SpecEntry{
        return new SpecEntry(spec);
    }

  constructor(
    public readonly spec: Spec
  ) {
    super(spec.uri, spec.name);
  }

  getTreeItem(): TreeItem {
    return SpecItem.from(this.spec);
  }

}
