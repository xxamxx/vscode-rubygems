import * as _ from "lodash";
import { parse as pparse } from 'path';
import { QuickPickItem, Uri, workspace, WorkspaceFolder } from "vscode";
import { placeholder } from "../config/basic";
import { Specification } from "../core/bundler";
import { GemEntry } from "../core/specification/spec_entry";
import { Utils } from "../util";

export class LockfileFolder {
    name: string;
    path: string;
    workspaceFolder: WorkspaceFolder | undefined;
    private specifications: Specification[];

    constructor(public lockfile: Uri) {
        this.specifications = [];
        const path = lockfile.fsPath;
        this.path = pparse(path).dir;
        this.name = pparse(this.path).name;
        this.workspaceFolder = workspace.workspaceFolders?.find((workspaceFolder) => this.be_contained(workspaceFolder.uri));
    }

    contain(uri: Uri) {
        return Utils.containPath(uri.fsPath, this.path);
    }

    be_contained(uri: Uri) {
        return Utils.containPath(this.lockfile.fsPath, uri.fsPath);
    }

    equal(other: any): boolean {
        if (!(other instanceof LockfileFolder)) { return false; }
        return this.lockfile.path === other.lockfile.path;
    }

    getQuickPickItem(): QuickPickItem {
        const wsName = this.workspaceFolder?.name;
        return {
            label: this.name,
            description: (this.name !== wsName) ? (wsName || placeholder.word) : '',
            detail: this.path
        };
    }

    async getEntries(gemMap: Map<string, GemEntry>): Promise<GemEntry[]> {
        console.debug('in lockfile get entries');

        const entries: GemEntry[] = [];
        const specifications = await this.load();
        specifications.forEach((specification) => {
            const gemEntry = gemMap.get(specification.full_name());
            if (!gemEntry) { return; }

            entries.push(gemEntry);
        });
        return _.sortBy(entries, 'name');
    }

    async reload() {
        this.specifications = await this.load();
    }

    async load(path: string = this.path): Promise<Specification[]> {
        console.debug('in load', path);
        if (!this.specifications.length) { this.specifications = await Utils.getSpecification(path); }
        return this.specifications;
    }
}

export class LockfileFolders {
    private static _folders: Map<string, LockfileFolder> = new Map();
    public static get folders() {
        return Array.from(this._folders.values());
    }

    public static async addFolders(uris: Uri[]) {
        for (const uri of uris) {
            const folder = new LockfileFolder(uri);
            this._folders.set(uri.path, folder);
            await folder.load();
        }
    }

    public static removeFolders(uris: Uri[]) {
        for (const uri of uris) {
            const deleted = this._folders.delete(uri.path);
            console.debug(uri.path, deleted);
        }
    }

    public static get(uri: Uri | undefined) {
        if (!uri) { return uri; }
        return this._folders.get(uri.path);
    }

    public static find(name: string) {
        return this.folders.find((folder) => name === folder.name);
    }

    public static match(uri: Uri) {
        return this.folders.find((folder) => folder.contain(uri));
    }

    public static async reload() {
        for (const folder of this._folders.values()) {
            await folder.reload();
        }
    }

    public static getQuickPickItems(): QuickPickItem[] {
        return this.folders.map((folder) => folder.getQuickPickItem());
    }
}


export class LockfileFolderStorage {
    private storage = new Map<string, LockfileFolder>();
    private folderPaths = new Set();
    private folderNames = new Set();


    public constructor() {
    }

    // 加载
    public load(uris: Uri[]) {
        for (const uri of uris) {
            const path = uri.fsPath;
            this._load(path);
        }
    }

    // 重载
    public reload(uris: Uri[]) {
        for (const uri of uris) {
            const path = uri.fsPath;
            this.storage.delete(path);
            this._load(path);
        }
    }

    // 移除
    public remove(uris: Uri[]) {
        for (const uri of uris) {
            const path = uri.fsPath;
            this._remove(path);
        }
    }

    // 获取
    public get(uri: Uri) {
        const path = uri.fsPath;
        this.storage.get(path);
    }

    // 匹配路径
    public match(uri: Uri | string) {

    }



    private _load(path: string) {
        const dir = pparse(path).dir;
        const name = pparse(path).name;
        const lockfileFolder = new LockfileFolder(path);
        this.folderPaths.add(dir);
        this.folderNames.add(name);
        this.storage.set(path, lockfileFolder);
    }

    private _remove(path: string) {
        const dir = pparse(path).dir;
        const name = pparse(path).name;
        this.folderPaths.delete(dir);
        this.folderNames.delete(name);
        this.storage.delete(path);
    }
}