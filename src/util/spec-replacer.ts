import { Spec } from "../spec";


export class SpecReplacer{
  constructor(readonly spec: Spec){ }

  replace(txt: string){
    Object.entries(this.spec).forEach(([key, val])=>{
      if (typeof val === 'string') txt = txt.replace(`\$\{${key}\}`, val)
    })
    return txt
  }
}