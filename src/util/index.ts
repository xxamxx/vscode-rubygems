import { join as pjoin } from 'path';
import * as vscode from 'vscode';
import { RelativePattern, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { Specification } from '../core/bundler';
import { FileStat } from './file_stat';
import { Utils as u } from './fs';
import { Path } from "./path";

export namespace Utils { 
	export function findWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined{
		if (!workspace.workspaceFolders) return;
		return workspace.workspaceFolders.find((folder) => Path.contain(uri.fsPath, folder.uri.path))
	}

	export function getCurrentWorkspaceFolder(): WorkspaceFolder | undefined {
			// 当前活跃的编辑器
			const editor = window.activeTextEditor;
			if (editor) return workspace.getWorkspaceFolder(editor.document.uri);

			// 打开的编辑中选第一个
			for (const editor of window.visibleTextEditors) {
				const workspaceFolder = workspace.getWorkspaceFolder(editor.document.uri);
				if (workspaceFolder) return workspaceFolder;
			}

			return undefined;
	}

	export async function hasGemfile(path: string): Promise<boolean> {
		if (path.length === 0) { return false; }
		return fs.exists(pjoin(path, 'Gemfile'));
	}

	export async function hasLockfile(path: string): Promise<boolean>{
		if (path.length === 0) { return false; }
		return fs.exists(pjoin(path, 'Gemfile.lock'));
	}

	/**
	 * @param path
	 */
	export async function isRubyContext(): Promise<boolean> {
		if (isRvmContext()) {
			return process.env.MY_RUBY_HOME !== undefined;
		} else {
			// todo 通过截取 $Path 判断是否有ruby bin 目录
			// todo 通过执行ruby程序是否报错判断
			return false;
		}
	}

	export async function isRvmContext(): Promise<boolean> {
		const list = ['rvm_bin_path'];
		return list.some((key) => process.env[key] !== undefined);
	}
	
	/**
	 * @todo 尝试通的bundle的环境变量获取path
	 * @todo 通过是否有bundle这个gem
	 * @todo 通过执行ruby程序获取
	 * 这个比较次要
	 * @param path 
	 */
	export async function isRubyBundleContext(path: string): Promise<boolean> {
		return false;
	}
	
	/**
	 * @todo 通过ruby目录去找
	 * @todo 通过执行ruby程序获取
	 */
	export async function hasRubylib(): Promise<boolean> {
		return false;
	}

	// 获取系统的 gems 目录,多ruby环境(rvm)提供选项
	const GEM_PATH = process.env.GEM_PATH || ""; // RubyGems 的 gem 目录
	export function getGemPaths(): string[] {
		return GEM_PATH.split(':').map(path => pjoin(path, 'gems'));
	}

	export async function getRubygems(gemPath: string): Promise<string[]> {
		const children = await u.fs.readdir(gemPath);

		return children.filter(async (child) => {
			const stat = new FileStat(await u.fs.stat(pjoin(gemPath, child)));
			return stat.isDirectory;
		});
	}

	export async function readDirectory(path: string): Promise<[string, vscode.FileType][]> {
		const children = await u.fs.readdir(path);

		const list: [string, vscode.FileType][] = [];
		for (const child of children) {
			const stat = new FileStat(await u.fs.stat(pjoin(path, child)));
			list.push([child, stat.type]);
		}

		return list;
	}




	export async function getSpecification(projectPath: string): Promise<Specification[]> {
		const specifications = await Utils.readLockfile(projectPath || '');
		return Specification.from_specifications(specifications);
	}

	export const fs = u.fs;
	export const file_stat = FileStat;
}

export {
	Path
}