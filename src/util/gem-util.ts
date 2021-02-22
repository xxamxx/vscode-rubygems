import _ = require("lodash");
import { join, extname } from "path";
import { FileType, Uri } from "vscode";
import { Utils } from ".";
import { DefineFile, SpecfileExtname } from "../constant";

const DefinedPriorityFiles = [
  'readme', 
  'readme.md', 
  DefineFile.Gemfile.toLowerCase(), 
  DefineFile.Lockfile.toLowerCase()
]

export async function choicePriorityFileUri(path: string){
  let list: [string, FileType][] = await Utils.readDirectory(path);
  
  list = _.sortBy(list, [([a]) => {
    const file = a.toLowerCase()

    // .gemspec 优先
    if (extname(file) === SpecfileExtname) return Number.MIN_SAFE_INTEGER
    // 指定文件次之
    else if (DefinedPriorityFiles.includes(file)) return Number.MIN_SAFE_INTEGER + DefinedPriorityFiles.indexOf(file)
    // 按 UTF-16 code
    else return a
  }])

  return Uri.parse(join(path, list[0][0]))
}