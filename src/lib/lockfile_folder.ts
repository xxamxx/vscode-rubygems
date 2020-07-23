import { Uri, workspace, QuickPickItem, WorkspaceFolder } from "vscode";
import { parse as pparse } from 'path';
import { GemEntry } from "../explorer/entry";
import { Specification } from "./ruby";
import { Utils } from "../util";
import _ = require("lodash");

export class LockfileFolder {
    private specifications: Specification[];
    name: string;
    path: string;
    workspaceFolder: WorkspaceFolder | undefined;

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
            description: wsName ? `${wsName} - ${this.name}` : this.name,
            detail: wsName ? `${wsName} - ${this.name}` : this.name,
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
    private static _folders: Map<Uri, LockfileFolder> = new Map();
    static get folders() {
        return Array.from(this._folders.values());
    }

    static async addFolders(uris: Uri[]) {
        for (const uri of uris) {
            const folder = new LockfileFolder(uri);
            this._folders.set(uri, folder);
            await folder.load();
        }
    }

    static async removeFolders(uris: Uri[]) {
        for (const uri of uris) {
            this._folders.delete(uri);
        }
    }

    static get(uri: Uri | undefined) {
        if (!uri) { return uri; }
        return this._folders.get(uri);
    }

    static find(name: string) {
        return this.folders.find((folder) => name === folder.name);
    }

    static match(uri: Uri) {
        return this.folders.find((folder) => folder.contain(uri));
    }

    static async reload() {
        for (const folder of this._folders.values()) {
            await folder.reload();
        }
    }

    static getQuickPickItems(): QuickPickItem[] {
        return this.folders.map((folder) => folder.getQuickPickItem());
    }
}