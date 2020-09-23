import * as _ from 'lodash';
import { Command, TreeItem, TreeItemCollapsibleState, Uri, workspace } from 'vscode';
import { Container } from '../../container';
import { LocalFlag, SpecType } from '../../core/constant';
import { Spec } from '../../core/spec';

interface SpecItemOptions {
  uri: Uri, 
  label: string, 
  fullname: string,
  description: string, 
  tooltip: string, 
  type: SpecType
}


export class SpecItem extends TreeItem {
  public readonly type: SpecType = SpecType.Requirement;
  // command = { command: 'gemsExplorer.openOnRubyGems', title: "Open the Gem on RubyGems", arguments: [this.label], };

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
      tooltip,
    });
  }
  
  constructor(value: SpecItemOptions) {
    super(value.uri, TreeItemCollapsibleState.Collapsed);
    const svg = value.type === SpecType.Requirement ? 'spec.svg' : 'dependency.svg';
    this.contextValue = value.fullname;
    this.label = value.label;
    this.description = value.description;
    this.tooltip = value.tooltip;
    this.iconPath = {
      light: Container.context.asAbsolutePath('resources/light/' + svg),
      dark: Container.context.asAbsolutePath('resources/dark/' + svg)
    };
  }

  // "rubygems.explore.website": {
  //     "type": "string",
  //     "default": "https://rubygems.org/gems/${name}",
  //     "markdownDescription": "Open this gem in the website. ps: be replace `${name}`",
  //     "scope": "resource";
  // },
  get command(): Command | undefined {
    const url: string | undefined = workspace.getConfiguration('rubygems.explore').get('website');
    if (!url) return;

    return {
      command: 'rubygems.explorer.openWebsite',
      title: 'Open Gem On Website',
      arguments: [url.replace('${name}', this.label || '')]
    };
  }
}
