import * as child_process from 'child_process';
import { ProgressLocation, window } from 'vscode';
import { join } from 'path';
import { DefineFile } from '../shared/constant';
import { global } from '../global';

export class RubyBundleHandler{

  constructor(
  ){}

  static async getBundle(){
    const binPath = await global.getBundleBinary()
    if (!binPath) throw new Error('can\'t found `bundle` command')

    return binPath
  }
  
  static async exec(prjPath: string): Promise<any[]> {
    const start = process.hrtime.bigint()

    return window.withProgress(
      {location: ProgressLocation.Notification, title: 'Loading RubyGems'},
      async (progress) => {
        const gemfile = join(prjPath, DefineFile.Gemfile);
        const lockfile = join(prjPath, DefineFile.Lockfile);
        const converter = global.context.asAbsolutePath('h11s/lockfile_converter.rb');
        const bundle = await this.getBundle();
      
        const promise = new Promise((resolve, reject) => {
          child_process.exec(
            [
              bundle,
              'exec',
              converter,
              gemfile,
              lockfile,
            ].join(' '),
            {
              cwd: prjPath,
              windowsHide: true,
              maxBuffer: 1024 * 1024 * 100,
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
    
        promise.finally(() => {
          const end = process.hrtime.bigint()
          console.debug(`Benchmark: \`bundle exec\` took ${Number(end - start) / 1000000} milliseconds`)
        })
    
        return promise as Promise<any[]>
      }
    )
  }
}