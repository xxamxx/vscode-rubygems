import { exec } from 'child_process';
import { basename, dirname, join as pjoin,resolve } from 'path';
import { RelativePattern, Uri, workspace, WorkspaceFolder } from 'vscode';
import * as bundler from './bundler/index';
import { Container } from './container';
import { Spec } from './spec';
import { UriComparer } from './util/comparer';

export class Project {
  static readonly RubyBinPath: string = pjoin(process.env.GEM_HOME || '', '/bin/ruby');

  constructor(public uri: Uri) {}

  public name() {
    return basename(this.uri.path);
  }

  public dirname() {
    return dirname(this.uri.path);
  }

  public workspace(): WorkspaceFolder | undefined {
    return workspace.getWorkspaceFolder(this.uri);
  }

  public equal(other: Project) {
    return UriComparer.equal(this.uri, other.uri);
  }

  
  public async getSpecs(): Promise<Spec[]> {
    const rubyPath = workspace.getConfiguration('rubygems.context').get('ruby', Project.RubyBinPath);
    const data = await Project.parseDependents(this.uri.path || '', rubyPath);
    const specifications = bundler.Specification.from_specifications(data);

    return specifications.map(specification => specification.toSpec());
  }

  private static async parseDependents(path: string, rubyPath = Project.RubyBinPath): Promise<any[]> {
    const ruby = rubyPath;
    const gemfile = pjoin(path, 'Gemfile');
    const lockfile = pjoin(path, 'Gemfile.lock');
    const converter = Container.context.asAbsolutePath('h11s/lockfile_converter.rb');

    console.debug('ruby', rubyPath);
    console.debug('gemfilePath', gemfile);
    console.debug('lockfilePath', lockfile);
    console.debug('h11sDirPath', converter);

    return new Promise((resolve, reject) => {
      // /Users/am/.rvm/rubies/ruby-2.5.3/bin/ruby
      exec(`${ruby} ${converter} ${gemfile} ${lockfile}`,
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
