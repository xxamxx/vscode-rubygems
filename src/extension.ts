import { ExtensionContext } from 'vscode';
import { Api } from './api';
import { Global } from './global';
import { Initialization } from './initialization';

export async function activate(context: ExtensionContext): Promise<Api> {
  Global.init(context);
  const initialization = await Initialization.init(context);
  context.subscriptions.push(initialization);

  return initialization.registerApi()
}
