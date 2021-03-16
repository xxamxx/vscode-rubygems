import _ = require("lodash");
import { join, delimiter } from "path";
import { ExtensionContext } from "vscode";
import { Disposition } from "./shared/abstract/disposable";
import { NodeStorage } from "./node-storage";
import { fs } from "./util";


export class Global extends Disposition{
  private static context: ExtensionContext
  private static global: Global

  static init(context: ExtensionContext){
    context.subscriptions.push(this.global)
    this.context = context
  }
  
  constructor(){
    super()
    
    if (Global.global) return Global.global

    return Global.global = this
  }

  get context(): ExtensionContext{
    return Global.context
  }
    
  readonly gempath: string = join(process.env.GEM_HOME || '', '/bin/ruby');

  private _node_storage!: NodeStorage;
  get nodeStorage(){
    if (this._node_storage) return this._node_storage
    this._node_storage = new NodeStorage()
    
    this.disposable.push(this._node_storage)
    
    return this._node_storage
  }

  private _source_storage: Map<string, any> = new Map<string, any>()
  get sourceStorage(){
    return this._source_storage
  }

  private _command!: any;
  private get command(){
    if (this._command) return this._command
    return undefined
  }
  
  private _configuration!: any;
  private get configuration(){
    if (this._configuration) return this._configuration
    return undefined
  }

  get ruby_paths(){
    return _.compact([
      process.env['MY_RUBY_HOME'] ? join(process.env['MY_RUBY_HOME'], 'bin') : '',
      ...(process.env['PATH']?.split(delimiter).filter(ele => ele.includes('ruby')) || [])
    ])
  }

  private async getBundleBinaryPath(){
    return this.ruby_paths.find(async path => {
      return fs.exists(join(path, 'bundle'))
    })
  }

  private _bundle_binary?: string
  async getBundleBinary(){
    if (this._bundle_binary) return this._bundle_binary
    
    const path = await this.getRubyBinaryPath()
    return this._bundle_binary = path && join(path, 'bundle')
  }

  private async getRubyBinaryPath(){
    return this.ruby_paths.find(async path => {
      return fs.exists(join(path, 'ruby'))
    })
  }

  private _ruby_binary?: string
  async getRubyBinary(){
    if (this._ruby_binary) return this._ruby_binary
    
    const path = await this.getRubyBinaryPath()
    return this._ruby_binary = path && join(path, 'ruby')
  }
}

export const global: Global = new Global();