import { fs } from './fs'
import { FileUri } from '../lib/ext/file-uri';

export async function readlist(uri: FileUri): Promise<FileUri[]> {
  const children = await fs.readdir(uri.fsPath);
  const promises = children.map(child => FileUri.joinPath(uri, child))
  return Promise.all(promises)
}

