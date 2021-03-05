import _ = require('lodash');
import { basename, dirname } from 'path';
import { RelativePattern, Uri, workspace, WorkspaceFolder } from 'vscode';
import * as bundler from './bundler/index';
import { Gemspec } from './bundler/gemspec';
import { Specification } from './bundler';
import { GemspecNode } from './view/node/gemspec-node';
import { SpecType } from './shared/constant';
import { FileUri } from './lib/ext/file-uri';
import { global } from './global';
import { FileNode } from './view/node/file-node';
import { instantFileNode } from './view/node/base-node';

export class Project {

  constructor(public uri: FileUri) {}

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

  public async getGemspecNodes(options = {cache: true}): Promise<GemspecNode[]> {
    let nodes: GemspecNode[] = [];
    if(options.cache) {
      nodes = global.nodeStorage.get(this.uri.path) as GemspecNode[]
      if (nodes.length) return nodes
    }
    
    const list: Gemspec[] = await Project.readGemspecList(this.uri.fsPath);

    nodes = _.chain(list)
      .sortBy(item => (item.type === SpecType.Requirement ? '0' : '1') + item.name)
      .map(item => new GemspecNode(item))
      .value();

    // cache
    global.nodeStorage.batch(this.uri.path, nodes)

    return nodes
  }

  async buildFileNode(filepath: string): Promise<FileNode | undefined>{
    return instantFileNode(this.uri.path, filepath)
  }

  static async readGemspecList(prjPath: string): Promise<Gemspec[]> {
    const data = await bundler.parseRubyDeps(prjPath);
    const specifications = Specification.from_specifications(data);
  
    const promises = specifications.map(specification => Gemspec.from(specification));
    const gemspecs = await Promise.all(promises)
    return gemspecs
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
