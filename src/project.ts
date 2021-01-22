import { exec } from 'child_process';
import { basename, dirname, join as pjoin } from 'path';
import { RelativePattern, Uri, workspace, WorkspaceFolder } from 'vscode';
import * as bundler from './bundler/index';
import { Container } from './container';
import { Spec } from './spec';
import { UriComparer } from './util/comparer';
import { SpecEntry } from './view/spec/spec_entry';
import { Path } from './util/path';

export class Project {
  static readonly RubyBinPath: string = pjoin(process.env.GEM_HOME || '', '/bin/ruby');
  private entries: SpecEntry[] = []
  private specs: Spec[] = []

  constructor(public uri: Uri) {}

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
    return UriComparer.equal(this.uri, other.uri);
  }

  public findSpecEntry(path: string): SpecEntry | undefined{
    return this.entries.find(entry => Path.contain(entry.uri.fsPath, path))
  }

  public async getSpecEntries(options = {cache: true}): Promise<SpecEntry[]>{
    if(options.cache && this.entries.length) return this.entries

    const specs = await this.getSpecs();
    return this.entries = specs.map(spec => new SpecEntry(spec));
  }

  public async getSpecs(options = {cache: true}): Promise<Spec[]> {
    if(options.cache && this.specs.length) return this.specs
    
    // const rubyPath = workspace.getConfiguration('rubygems.context').get('ruby', Project.RubyBinPath);
    const data = await Project.parseDependents(this.uri.path || '');
    const specifications = bundler.Specification.from_specifications(data);

    return this.specs = specifications.map(specification => specification.toSpec());
  }

  private static async parseDependents(path: string): Promise<any[]> {
    const gemfile = pjoin(path, 'Gemfile');
    const lockfile = pjoin(path, 'Gemfile.lock');
    const converter = Container.context.asAbsolutePath('h11s/lockfile_converter.rb');

    console.debug('gemfilePath', gemfile);
    console.debug('lockfilePath', lockfile);
    console.debug('h11sDirPath', converter);

    return new Promise((resolve, reject) => {
      // /Users/am/.rvm/rubies/ruby-2.5.3/bin/ruby
      exec(
        `bundle exec ${converter} ${gemfile} ${lockfile}`,
        {
          cwd: path,
          windowsHide: true,
          maxBuffer: 1024 * 1024 * 10
        },
        (err: any, stdout: string | Buffer, stderr: string | Buffer) => {
          if (err) return reject(err);
          if (stderr) return reject(stderr);

          try {
            const data = JSON.parse(stdout.toString());
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
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
