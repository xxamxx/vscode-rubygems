import * as path from 'path';
import * as fs from 'fs';

export namespace Filepath {
  export function samedir(dir: string, subdir: string): boolean{
    try {
      if (!!path.extname(dir)){
        dir = path.dirname(dir);
      } else {
        const dirStat = fs.statSync(dir)
        if (!dirStat.isDirectory()) dir = path.dirname(dir);
      }
    } catch (error) {
      return false;
    }

    const section = subdir.slice(0, dir.length);
    return dir === section;
  }
}
