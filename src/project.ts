import * as _ from 'lodash';
import { basename, dirname } from 'path';
import { RelativePattern, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Gemspec } from './model/gemspec';
import { GemspecNode } from './view/node/gemspec-node';
import { FileUri } from './lib/ext/file-uri';
import { global } from './global';
import { FileNode } from './view/node/file-node';
import { instantFileNode } from './view/node/base-node';

export class Project {

  constructor(public uri: FileUri) {}

  public get title() {
    const workspaceName = this.workspace?.name || ''
    const folderName = this.name || ''

    if (!workspaceName) return folderName;
    else if (workspaceName === folderName) return workspaceName;
    else return workspaceName + ' ‣ ' + folderName;
  }

  public get name() {
    return basename(this.uri.path);
  }

  public get dirname() {
    return dirname(this.uri.path);
  }

  public get workspace(): WorkspaceFolder | undefined {
    return workspace.getWorkspaceFolder(this.uri);
  }

  public equal(other: Project) {
    return this.uri.equal(other.uri);
  }

  public async findGemspecNodes(predicate?: any, options = {cache: true}): Promise<GemspecNode[]> {
    let nodes: GemspecNode[] = [];
    if(options.cache) nodes = global.nodeStorage.get(this.uri.path) as GemspecNode[]
    
    if (!nodes.length) {
      global.nodeStorage.clear(this.uri.path)
      const list = await Gemspec.findAll(this.uri.path, { cache: false});
      // cache
      global.nodeStorage.batch(
        this.uri.path, 
        nodes = list.map(item => new GemspecNode(item))
      )
    }

    return predicate 
      ? _.filter(nodes, predicate)
      : nodes
  }

  async buildFileNode(filepath: string): Promise<FileNode | undefined>{
    return instantFileNode(this.uri.path, filepath)
  }

  static async findProjectUris(workspaceFolders: Readonly<WorkspaceFolder[]>): Promise<Uri[]> {
    let list: Uri[] = [];
    for (const workspaceFolder of workspaceFolders) {
      const relativePattern = new RelativePattern(workspaceFolder, '**/Gemfile.lock');
      const files = await workspace.findFiles(relativePattern);

      const uris = files.map(file => Uri.parse(dirname(file.path)));
      list = list.concat(uris);
    }
    return list;
  }
}
