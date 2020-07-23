import * as vscode from 'vscode';
import * as _fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

export namespace Utils {
	export namespace fs {

		function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
			if (error) {
				reject(massageError(error));
			} else {
				resolve(result);
			}
		}

		function massageError(error: Error & { code?: string; }): Error {
			if (error.code === 'ENOENT') {
				return vscode.FileSystemError.FileNotFound();
			}

			if (error.code === 'EISDIR') {
				return vscode.FileSystemError.FileIsADirectory();
			}

			if (error.code === 'EEXIST') {
				return vscode.FileSystemError.FileExists();
			}

			if (error.code === 'EPERM' || error.code === 'EACCESS') {
				return vscode.FileSystemError.NoPermissions();
			}

			return error;
		}

		export function checkCancellation(token: vscode.CancellationToken): void {
			if (token.isCancellationRequested) {
				throw new Error('Operation cancelled');
			}
		}

		export function readdir(path: string, opts?: { encoding: BufferEncoding | null; withFileTypes?: false; } | BufferEncoding | undefined | null): Promise<string[]> {
			return new Promise<string[]>((resolve, reject) => {
				_fs.readdir(path, opts, (error, children) => handleResult(resolve, reject, error, children));
			});
		}

		export function stat(path: string): Promise<_fs.Stats> {
			return new Promise<_fs.Stats>((resolve, reject) => {
				_fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
			});
		}

		export function readfile(path: string): Promise<Buffer> {
			return new Promise<Buffer>((resolve, reject) => {
				_fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
			});
		}

		export function writefile(path: string, content: Buffer): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				_fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
			});
		}

		export function exists(path: string): Promise<boolean> {
			return stat(path).then((s) => !!s).catch(() => false);
		}

		export function rmrf(path: string): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				rimraf(path, error => handleResult(resolve, reject, error, void 0));
			});
		}

		export function mkdir(path: string): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				mkdirp(path, error => handleResult(resolve, reject, error, void 0));
			});
		}

		export function rename(oldPath: string, newPath: string): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				_fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
			});
		}

		export function unlink(path: string): Promise<void> {
			return new Promise<void>((resolve, reject) => {
				_fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
			});
		}

		export function normalizeNFC(items: string): string;
		export function normalizeNFC(items: string[]): string[];
		export function normalizeNFC(items: string | string[]): string | string[] {
			if (process.platform !== 'darwin') {
				return items;
			}

			if (Array.isArray(items)) {
				return items.map(item => item.normalize('NFC'));
			}

			return items.normalize('NFC');
		}
	}
}

