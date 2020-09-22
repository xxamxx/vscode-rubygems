import * as path from 'path';

export namespace Path {
	export function contain(dir: string, subdir: string): boolean {
    try {
      dir = path.dirname(dir);
      subdir = path.dirname(subdir);
    } catch (error) {
      return false;
    }

		const section = subdir.slice(0, dir.length);
		return dir === section;
	}
}

