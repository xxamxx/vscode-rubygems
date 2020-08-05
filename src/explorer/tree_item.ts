/// <reference path='../definition.ts'>

import { workspace, TreeItem, TreeItemCollapsibleState, Uri, FileType, Command } from 'vscode';
import { join as pjoin, } from 'path';
import * as _ from 'lodash';
import { Entry} from '../definition';


export class GemItem extends TreeItem {
    public readonly version: string;
    public readonly name: string;
    public readonly contextValue = 'gem-folder';
    public readonly iconPath = {
        light: pjoin(__filename, '..', '..', '..', 'resources', 'light', 'ruby-gem.svg'),
        dark: pjoin(__filename, '..', '..', '..', 'resources', 'dark', 'ruby-gem.svg')
    };
    get uri(): Uri { return this.entry.uri; }
    get label(): string { return this.name; }

    get description(): string {
        return this.entry.global ? `${this.version} - global` : this.version;
    }

    get tooltip(): string {
        return _.compact([this.name, this.version, this.entry.global && 'global']).join(' - ');
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


    constructor(public readonly entry: Entry & {global: boolean}) {
        super(entry.uri, entry.type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        const lastIndex = this.entry.name.lastIndexOf('-');
        this.name = this.entry.name.slice(0, lastIndex);
        this.version = this.entry.name.substring(lastIndex + 1);
    }

    // command = { command: 'gemsExplorer.openOnRubyGems', title: "Open the Gem on RubyGems", arguments: [this.label], };
}


export class Item extends TreeItem {
    public readonly command = { command: 'rubygems.explorer.openFile', title: "Open File", arguments: [this.uri], };
    // public readonly iconPath = {
    //     light: pjoin(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: pjoin(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
    get name(): string { return this.entry.name; }
    get uri(): Uri { return this.entry.uri; }
    get label(): string { return this.name; }
    get contextValue(): string {
        switch (this.entry.type) {
            case FileType.Directory:
                return 'folder';
            case FileType.File:
            case FileType.SymbolicLink:
                return 'file';
            default:
                return '';
        }
    }

    constructor(public readonly entry: Entry) {
        super(entry.uri, entry.type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
    }


    // static openWebsite(name: string) {
    //     const url: string | undefined = workspace.getConfiguration('rubygems.item').get('openWebsite');
    //     if (!url) { return; }
    //     commands.executeCommand('vscode.open', this.uri);
    // }

    // command = { command: 'gemsExplorer.openOnRubyGems', title: "Open the Gem on RubyGems", arguments: [this.label], };
}