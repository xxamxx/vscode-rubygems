import { QuickPickItem, window } from "vscode";
import { LockfileFolders } from "../lib/lockfile_folder";


export class Picker{

    static async showLockfileFolderPick(lockfileStorage: typeof LockfileFolders): Promise<string | undefined> {
        const items: QuickPickItem[] = lockfileStorage.getQuickPickItems();
        const item: QuickPickItem | undefined = await this.showQuickPick(items, 'Please Pick Lockfile Folder');
        return item?.label;
    }

    private static async showQuickPick(items: QuickPickItem[], placeHolder: string) {
        return window.showQuickPick(items, {
            matchOnDescription: true,
            matchOnDetail: true,
            ignoreFocusOut: true,
            canPickMany: false,
            placeHolder
        });
    }
}