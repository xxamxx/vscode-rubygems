import _ = require("lodash");
import { Disposable } from "vscode";
import { ViewNode } from "./shared/interface";


export class NodeStorage implements Disposable{
  
  dispose() { 
    Disposable.from(this).dispose(); 
  }
  
  private readonly collection = new Set<ViewNode>()
  private readonly map = new Map<string, Set<ViewNode>>()
  
  add(scope: string, values: ViewNode | ViewNode[]): this { 
    if (!_.isArray(values)) values = [values]

    const set = this.map.get(scope) || new Set<ViewNode>()

    values.forEach(value => {
      set.add(value)
      this.collection.add(value)
    });

    this.map.set(scope, set)
    return this
  }

  replace(scope: string, values: ViewNode[]): this { 
    const set = new Set<ViewNode>()

    values.forEach(value => {
      set.add(value)
      this.collection.add(value)
    });

    this.map.set(scope, set)
    return this
  }

  clear(scope?: string): void{
    if (scope === '' || !!scope) {
      this.map.delete(scope)
    } else {
      this.map.clear()
      this.collection.clear()
    }
  }

  delete(value: ViewNode): boolean{
    const s: boolean[] = []

    this.map.forEach(set => {
      s.push(set.delete(value) && this.collection.delete(value))
    })
    
    return _.every(s)
  }

  get(scope: string): ViewNode[]{
    return Array.from(this.map.get(scope) || [])
  }
  
  list(): ViewNode[]{
    return Array.from(this.collection)
  }

  scopes(){
    return Array.from(this.map.keys())
  }

}