import { FileNode } from "../view/node/file-node"
import { FolderNode } from "../view/node/folder-node"
import { GemspecNode } from "../view/node/gemspec-node"

export type ParentNode = GemspecNode | FolderNode
export type ChildNode = FolderNode | FileNode
export type ViewNode = GemspecNode | FolderNode | FileNode

export const isParentNode = (val: any) => isViewNode(val) && (val as ParentNode).children !== undefined
export const isChildNode = (val: any) => isViewNode(val) && (val as ChildNode).parent !== undefined
export const isViewNode = (val: any) => (val as ChildNode).resourceUri !== undefined
  || (val as ChildNode).label !== undefined
  || (val as ChildNode).collapsibleState !== undefined