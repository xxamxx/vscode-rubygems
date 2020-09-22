import { Uri } from 'vscode';

export interface SpecOption {
    name: string;
    version: string;
    defaulted: boolean;
    globally: boolean;
    required: boolean;
    dir: string;
    path: string;
}

export class Spec {
    public readonly fullname: string;
    public readonly defaulted: boolean = false;
    public readonly globally: boolean = false;
    public readonly required: boolean = false;
    public readonly dir: string;
    public readonly uri: Uri;

    constructor(value: SpecOption) {
        this.fullname = value.name;
        this.defaulted = value.defaulted;
        this.globally = value.globally;
        this.required = value.required;
        this.dir = value.dir;
        this.uri = Uri.parse(value.path);
    }

    get name(){
        const lastIndex = this.fullname.lastIndexOf('-');
        return this.fullname.slice(0, lastIndex);
    }

    get version(){
        const lastIndex = this.fullname.lastIndexOf('-');
        return this.fullname.substring(lastIndex + 1);
    }
}