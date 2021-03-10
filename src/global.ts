import { join } from "path";
import { ExtensionContext } from "vscode";
import { Disposition } from "./shared/abstract/disposable";
import { NodeStorage } from "./node-storage";


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
}

export const global: Global = new Global();