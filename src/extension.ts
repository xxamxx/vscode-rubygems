import { ExtensionContext } from 'vscode';
import { Initialization } from './initialization';

export async function activate(context: ExtensionContext) {
    const initialization = await Initialization.init(context);
    context.subscriptions.push(initialization);
}