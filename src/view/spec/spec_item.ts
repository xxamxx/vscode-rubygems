import * as _ from 'lodash';
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Container } from '../../container';
import { LocalFlag, SpecType } from '../../constant';
import { Spec } from '../../spec';

interface SpecItemOptions {
  uri: Uri;
  label: string;
  fullname: string;
  description: string;
  tooltip: string;
  type: SpecType;
}

export class SpecItem extends TreeItem {
  public readonly contextValue: string = 'rubygems.explorer.specitem';
  public readonly type: SpecType = SpecType.Requirement;

  static from(spec: Spec): SpecItem {
    const label = spec.name;
    const description = spec.localness ? `${spec.version} - ${LocalFlag}` : spec.version;
    const tooltip = spec.fullname + (spec.localness ? ' - ' + LocalFlag : '');

    return new SpecItem({
      uri: spec.uri,
      type: spec.type,
      fullname: spec.fullname,
      label,
      description,
      tooltip
    });
  }

  constructor(value: SpecItemOptions) {
    super(value.uri, TreeItemCollapsibleState.Collapsed);
    const svg = value.type === SpecType.Requirement ? 'spec.svg' : 'dependency.svg';
    this.label = value.label;
    this.description = value.description;
    this.tooltip = value.tooltip;
    this.iconPath = {
      light: Container.context.asAbsolutePath('resources/icon/light/' + svg),
      dark: Container.context.asAbsolutePath('resources/icon/dark/' + svg)
    };
  }

}
