import { ExtensionContext } from 'vscode';
import { Initialization } from './initialization';

export async function activate(context: ExtensionContext) {
	const executable = await Initialization.check(context);
	if (!executable) { return; }

	await Initialization.preinit(context);
	const initialization = new Initialization();
	await initialization.init();
	context.subscriptions.push(initialization);
}