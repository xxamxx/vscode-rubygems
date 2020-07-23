import * as vscode from 'vscode';
import { join as pjoin, resolve } from 'path';
import { exec } from 'child_process';
import { FileStat } from './file_stat';
import { Utils as u } from './fs';
import { Specification } from '../lib/ruby';
import { workspace } from 'vscode';

export namespace Utils {
	// 解析 Gemfile
	// export function readGemfile(path: string): object {
	// 	const gemfilePath = pjoin(path, 'Gemfile');
	// 	return JSON.parse(fs.readFileSync(gemfilePath, 'utf-8'));
	// }

	export function gemfileExists(path: string): Promise<boolean> {
		const gemfilePath = pjoin(path, 'Gemfile');
		return Utils.fs.exists(gemfilePath);
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

	export async function hasLockfile(path: string): Promise<boolean>{
		if (path.length === 0) { return false; }
		return fs.exists(pjoin(path, 'Gemfile.lock'));
	}

	// 获取系统的 Ruby bin 文件的地址
	const GEM_HOME = process.env['GEM_HOME'] || "";
	export function getGemBin(): string {
		return pjoin(GEM_HOME, '/bin/ruby');
	}

	// 获取系统的 gems 目录,多ruby环境(rvm)提供选项
	const GEM_PATH = process.env['GEM_PATH'] || ""; // RubyGems 的 gem 目录
	export function getGemPaths(): string[] {
		return GEM_PATH.split(':').map(path => pjoin(path, 'gems'));
	}

	export async function readLockfile(path: string): Promise<any[]> {
		const gemfilePath = pjoin(path, 'Gemfile');
		const lockfilePath = pjoin(path, 'Gemfile.lock');
		const converterPath = resolve(__dirname, '../../', 'h11s/lockfile_converter.rb');
		// RUBY 配置
		
		const rubyPath = workspace.getConfiguration('rubygems.context').get('ruby', getGemBin());
		console.debug('ruby', rubyPath);
		console.debug('gemfilePath', gemfilePath);
		console.debug('lockfilePath', lockfilePath);
		console.debug('h11sDirPath', converterPath);
		
		return new Promise((resolve, reject) => {
			// /Users/am/.rvm/rubies/ruby-2.5.3/bin/ruby 
			exec(`${rubyPath} ${converterPath} ${gemfilePath} ${lockfilePath}`, {
				cwd: path,
				windowsHide: true,
				maxBuffer: 1024 * 1024 * 10
			}, (err: any, stdout: string | Buffer, stderr: string | Buffer) => {
				if (err) { console.error(err); return reject(err); }
				if (stderr) { console.error(stderr); return reject(stderr); }

				console.debug('data length', stdout.length);
				try {
					const data = JSON.parse(stdout.toString());
					resolve(data);
				} catch (error) {
					reject(error);
				}
			});
			
		});
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

	export function containPath(path: string, otherPath: string): boolean {
		const section = path.slice(0, otherPath.length);
		return otherPath === section;
	}


	export async function getSpecification(projectPath: string): Promise<Specification[]> {
		const specifications = await Utils.readLockfile(projectPath || '');
		return Specification.from_specifications(specifications);
	}

	export const fs = u.fs;
	export const file_stat = FileStat;
}
