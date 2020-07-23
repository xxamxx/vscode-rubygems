import { Uri } from "vscode";
import { join as pjoin } from 'path';
import { GemEntry } from "../explorer/entry";
import { Utils } from "../util";


export class GemFolder {
    private entries: GemEntry[] = [];

    constructor(public path: string, public global: boolean = false) { }

    async load(map: Map<string, GemEntry> = new Map(), ): Promise<Map<string, GemEntry>>{
        const entries = await this.build(); 
        for (const entry of entries) {
            map.set(entry.name, entry);
        }

        return map;
    }

    async rebuild() {
        this.entries = [];
        return this.build();
    }

    private async build(path: string = this.path) {
        if (!this.entries.length) {
            const rubygems = await Utils.getRubygems(path);
            return rubygems.map((gem): GemEntry => {
                const uri = Uri.file(pjoin(path, gem));
                return new GemEntry(uri, gem, this.global);
            });
        }

        return this.entries;
    }
}

export class GemFolders{
    static map: Map<string, GemEntry> = new Map();
    static folders: Map<string, GemFolder> = new Map();

    static async addFolders(paths: string[]) {
        for (const path of paths) {
            const folder = new GemFolder(path);
            this.folders.set(path, folder);
            await folder.load(this.map);
        }
    }

    static async removeFolder(paths: string[]) {
        for (const path of paths) {
            this.folders.delete(path);
            await this.reload();
        }
    }

    static async reload() {
        this.map = new Map();
        for (const folder of this.folders.values()) {
            await folder.rebuild();
            await folder.load(this.map);
        }
    }
}