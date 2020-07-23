/// <reference path='../definition.ts'>

import { TreeItem, Uri, FileType } from 'vscode';
import * as _ from 'lodash';
import { join as pjoin, } from 'path';
import { Utils } from '../util';
import { Item, GemItem } from './tree_item';
import { Entry, EntryMode } from '../definition';

export class GeneralEntry implements Entry {
    uri: Uri;
    type: FileType;
    name: string;
    mode: EntryMode = EntryMode.General;
    icon?: string;

    constructor(uri: Uri, name: string, type: FileType) {
        this.uri = uri;
        this.name = name;
        this.type = type;
    }

    getTreeItem(): TreeItem {
        return new Item(this);
    }

    /**
     * @description 加载文件夹
     */
    async getChildren(): Promise<GeneralEntry[]> {
        const list = await Utils.readDirectory(this.uri.path);
        
        return _.chain(list).sortBy(([name, type]) => -type, 0).map(([name, type]: [string, FileType]): GeneralEntry => {
            const uri = Uri.parse(pjoin(this.uri.path, name));
            return new GeneralEntry(uri, name, type);
        }).value();
    }
}


export class GemEntry extends GeneralEntry {
    mode: EntryMode = EntryMode.Gem;
    global: boolean;
    icon?: string;

    constructor(uri: Uri, name: string, global: boolean = false) {
        super(uri, name, FileType.Directory);
        this.global = global;
    }

    getTreeItem(): TreeItem {
        return new GemItem(this);
    }
}
