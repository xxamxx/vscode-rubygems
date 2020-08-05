import { Event, TreeItem, EventEmitter, TreeDataProvider, window, Disposable, TreeView } from 'vscode';
import { placeholder } from '../config/basic';
import { Entry } from '../definition';
import { GeneralEntry } from '../explorer/entry';
import { LockfileFolder } from '../lib/lockfile_folder';
import { GemFolders } from '../lib/gem_folder';
import * as _ from 'lodash';


export class RubygemsProvider implements TreeDataProvider<Entry> {
	private defaultViewName = 'RUBYGEMS';
	private _onDidChangeTreeData: EventEmitter<Entry | undefined> = new EventEmitter<Entry | undefined>();
	readonly onDidChangeTreeData: Event<Entry | undefined> = this._onDidChangeTreeData.event;
	protected _disposable: Disposable;
	private view: TreeView<Entry>;
	private currentLockfileFolder: LockfileFolder | undefined;
	private setLockfileFolder = _.throttle((lockfileFolder) => {
		this.currentLockfileFolder = lockfileFolder;
		this.view.title = this.currentLockfileFolder ? `${this.defaultViewName} ${placeholder.refer} ${this.currentLockfileFolder.name}` : this.defaultViewName;
		this.refresh();
	}, 20);

	set lockfileFolder(lockfileFolder: LockfileFolder | undefined) {
		this.setLockfileFolder(lockfileFolder);
	}

	get lockfileFolder() {
		return this.currentLockfileFolder;
	}


	constructor(lockfileFolder: LockfileFolder | undefined) { 
		this.view = window.createTreeView('rubygems.explorer', { treeDataProvider: this });
		this.view.title = this.defaultViewName;
		this.lockfileFolder = lockfileFolder;
		this._disposable = Disposable.from(this.view);
		return this;
	}

	dispose() {
		this._disposable.dispose();
	}

	/**
	 * @implements
	 * @param {Entry} element
	 */
	async getTreeItem(element: GeneralEntry): Promise<TreeItem> {
		// const state = element.type === FileType.Directory ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None;
		// return new TreeItem(element.name, state);
		return element.getTreeItem();
	}

	/**
	 * @description 提供数据的，tree item负责展示数据 
	 * @implements
	 * @param {GeneralEntry} element
	 */
	async getChildren(element?: GeneralEntry): Promise<Entry[]> {
		// 加载文件夹
		if (element) { return element.getChildren(); }

		// 加载gems
		return this.getRoot();
	}

	async getRoot(): Promise<Entry[]> {
		console.debug('in root');
		if (!this.currentLockfileFolder) { return []; }
		return this.currentLockfileFolder.getEntries(GemFolders.map);
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
		console.debug('in refresh');
	}
}