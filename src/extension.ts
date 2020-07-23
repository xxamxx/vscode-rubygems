import { ExtensionContext } from 'vscode';
import { Container } from './container';

export async function activate(context: ExtensionContext) {
	const executable = await Container.check(context);
	if (!executable) { return; }

	context.subscriptions.push(await Container.initialization(context));
}