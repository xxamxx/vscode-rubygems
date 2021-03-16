import _ = require("lodash");
import { dirname } from "path";
import { ChildNode, ParentNode } from "../../shared/interface";
import { FileUri } from "../../lib/ext/file-uri";
import { FileNode } from "./file-node";
import { FolderNode } from "./folder-node";
import { global } from "../../global"
import * as util from "../../util"
import { fp } from "../../util/fp";
import { GemspecNode } from "./gemspec-node";



export async function getFolderChildren(folder: ParentNode): Promise<ChildNode[]> {
  const nodes = global.nodeStorage.get(folder.resourceUri.path) as ChildNode[]
  if (nodes.length) return nodes;

  const list: FileUri[] = await util.readlist(folder.resourceUri);

  const children = _.chain(list)
    .sortBy((item) => -item.type, 0)
    .map((item): ChildNode => item.isDirectory 
      ? new FolderNode(item, folder, 'rubygems.explorer.foldernode') 
      : new FileNode(item, folder, 'rubygems.explorer.filenode')
    )
    .value();

  global.nodeStorage.replace(folder.resourceUri.path, children)
  return children
}

export async function instantFileNode(prjpath: string, filepath: string): Promise<FileNode | undefined>{
  const nodes = global.nodeStorage.get(prjpath) as GemspecNode[]
  const fileuri = await FileUri.file(filepath)
  const nodemap = _.keyBy(nodes, 'resourceUri.path')
  
  // 上一层就是 GemspecNode
  let path = dirname(filepath)
  if (nodemap[path]) return new FileNode(fileuri, nodemap[path], 'rubygems.explorer.filenode') 
  
  // 找出 GemspecNode
  const root = nodes.find(node => {
    const samepath = fp.samedir(node.resourceUri.path, fileuri.path)
    return samepath ? !!nodemap[samepath] : false
  })
  if (!root) return undefined
  
  // 遍历并实例化 FolderNode
  const promises = []
  do {
    promises.push(FileUri.file(path))
  } while(!nodemap[path = dirname(path)])
  
  const uris = await Promise.all(promises.reverse())
  const parent = _.reduce(uris, (parent: ParentNode, uri) => new FolderNode(uri, parent, 'rubygems.explorer.foldernode'), root)

  // 实例化 FileNode
  return new FileNode(fileuri, parent, 'rubygems.explorer.filenode')
}