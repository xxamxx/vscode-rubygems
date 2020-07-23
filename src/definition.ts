/// <reference path='explore/entry.ts'>
/// <reference path='explore/tree_item.ts'>

import { FileType, Uri } from "vscode";



export enum EntryMode {
    General = 0,
    Gem = 1,
}

export interface Entry {
    uri: Uri;
    type: FileType;
    name: string;
    mode: EntryMode;
    icon?: string;
}
