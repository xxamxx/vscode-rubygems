/// <reference path='../definition.ts'>

import { workspace, TreeItem, TreeItemCollapsibleState, Uri, FileType, Command } from 'vscode';
import { join as pjoin, } from 'path';
import * as _ from 'lodash';
import { Spec } from '../../core/spec';


export class SpecItem extends TreeItem {
    public readonly contextVaslue = 'gem-folder';
    public readonly iconPath = {
        light: pjoin(__filename, '..', '..', '..', 'resources', 'light', 'ruby-gem.svg'),
        dark: pjoin(__filename, '..', '..', '..', 'resources', 'dark', 'ruby-gem.svg')
    };
    // command = { command: 'gemsExplorer.openOnRubyGems', title: "Open the Gem on RubyGems", arguments: [this.label], };

    static from(spec: Spec): SpecItem{
        const label = spec.name;
        const description = spec.globally ? `${spec.version} - global` : spec.version;
        const tooltip = _.compact([spec.name, spec.version, (spec.globally ? 'global' : '')]).join(' - ');
        return new SpecItem(spec.uri, label, description, tooltip);
    }

    constructor(uri: Uri, label: string, description: string, tooltip: string, type: FileType = FileType.Unknown) {
        super(uri, type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        this.label = label;
        this.description = description;
        this.tooltip = tooltip;
    }

    // "rubygems.explore.website": {
    //     "type": "string",
    //     "default": "https://rubygems.org/gems/${name}",
    //     "markdownDescription": "Open this gem in the website. ps: be replace `${name}`",
    //     "scope": "resource";
    // },
    get command(): Command | undefined {
        const url: string | undefined = workspace.getConfiguration('rubygems.explore').get('website');
        if (!url) { return; }
        return { command: 'rubygems.explorer.openWebsite', title: "Open Gem On Website", arguments: [url.replace('${name}', this.name)], };
    }

}
