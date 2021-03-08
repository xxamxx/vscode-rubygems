import { ExtensionContext } from 'vscode';
import { Api } from './api';
import { Initialization } from './initialization';

export async function activate(context: ExtensionContext): Promise<Api> {
  const initialization = await Initialization.init(context);
  context.subscriptions.push(initialization);

  return initialization.registerApi()
}
