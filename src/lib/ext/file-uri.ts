import * as vscode from 'vscode';
import * as fs from 'fs';
import { basename } from 'path';
import { fp } from '../../util';

export class FileUri implements vscode.Uri, vscode.FileStat {
  private readonly uri: vscode.Uri
  private readonly stat: fs.Stats
  
  static async file(path: string){
    const uri = vscode.Uri.file(path)
    const stat = fs.statSync(uri.fsPath)
    return new FileUri(uri, stat)
  }

  static async joinPath(base: vscode.Uri, ...pathSegments: string[]){
    if (base.scheme != 'file') throw new Error('the base uri only allow `file` schema!')

    const uri = vscode.Uri.joinPath(base, ...pathSegments)
    const stat = fs.statSync(uri.fsPath)
    return new FileUri(uri, stat)
  }

  static async from(uri: vscode.Uri){
    if (uri.scheme != 'file') throw new Error('the uri only allow `file` schema!')
    
    const stat = fs.statSync(uri.fsPath)
    return new FileUri(uri, stat)
  }

  private constructor(uri: vscode.Uri, stat: fs.Stats){
    if (uri.scheme != 'file') throw new Error('the uri only allow `file` schema!')

    this.uri = uri
    this.stat = stat
  }


  // reference vscode.Uri
  get scheme(): string{ return this.uri.scheme }
  get authority(): string{ return this.uri.authority }
  get path(): string{ return this.uri.path }
  get query(): string{ return this.uri.query }
  get fragment(): string{ return this.uri.fragment }
  get fsPath(): string{ return this.uri.fsPath }
  with(change: { scheme?: string | undefined; authority?: string | undefined; path?: string | undefined; query?: string | undefined; fragment?: string | undefined; }): vscode.Uri {
    return this.uri.with(change)
  }
  toString(skipEncoding?: boolean): string {
    return this.uri.toString(skipEncoding)
  }
  toJSON() {
    return this.uri.toJSON()
  }


  // reference vscode.FileStat
  get type(): vscode.FileType {
    return this.stat.isFile()
      ? vscode.FileType.File
      : this.stat.isDirectory()
      ? vscode.FileType.Directory
      : this.stat.isSymbolicLink()
      ? vscode.FileType.SymbolicLink
      : vscode.FileType.Unknown;
  }
  get size(): number {
    return this.stat.size;
  }
  get ctime(): number {
    return this.stat.ctime.getTime();
  }
  get mtime(): number {
    return this.stat.mtime.getTime();
  }


  get isFile(): boolean | undefined {
    return this.stat.isFile();
  }
  get isDirectory(): boolean | undefined {
    return this.stat.isDirectory();
  }
  get isSymbolicLink(): boolean | undefined {
    return this.stat.isSymbolicLink();
  }

  get name(): string{
    return basename(this.uri.fsPath)
  }

  hasSameDir(other: vscode.Uri): boolean{
    if (other.scheme != 'file') return false;
    if (this === other) return true;

    return fp.hasSameDir(this.fsPath, other.fsPath)
  }

  equal(other: vscode.Uri): boolean{
    return this.eql(other, {strict: true})
  }

  eql(other: vscode.Uri, options: { strict?: boolean } = { strict: false }): boolean{
    if (other.scheme != 'file') return false;
    if (this === other) return true;

    if (options.strict) {
      return this.toString(true) === other.toString(true);
    }
    return this.fsPath === other.fsPath;
  }
}
