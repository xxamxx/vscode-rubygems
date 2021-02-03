import { ExtensionContext, Memento, workspace } from "vscode";


class Storage implements Memento{
  private static workspaceState: Memento;
  private static globalState: Memento;

  static initState(context: ExtensionContext): void{
    if (!context.workspaceState || !context.globalState) throw new Error('`workspaceState` or `globalState` is undefined!')
    
    this.workspaceState = context.workspaceState
    this.globalState = context.globalState
  }

  static alloc(prefix: string, type: 'workspace' | 'global' = 'workspace'): Storage{
    let memento = null;
    switch (type) {
      case 'global':
        memento = this.globalState
        break;
      case 'workspace':
        memento = this.workspaceState
        break;
      default:
        throw new Error('type only accept `workspace` or `global`!')
    }
    return new Storage(prefix, memento)
  }

  private constructor(public readonly prefix: string, private readonly memento: Memento){}

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get(key: string, defaultValue?: any) {
    return this.memento.get(this.getActualKey(key), defaultValue)
  }
  update(key: string, value: any): Thenable<void> {
    return this.memento.update(this.getActualKey(key), value)
  }

  private getActualKey(key: string): string{
    return this.prefix + '.' + key
  }

}


export default Storage
export const defaultWorkspaceStorage = Storage.alloc('', 'workspace')
export const defaultGlobalStorage = Storage.alloc('', 'global')