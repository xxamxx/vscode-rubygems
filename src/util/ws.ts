import _ = require("lodash");
import { TextEditor, Uri, window, workspace, WorkspaceFolder } from "vscode";
import { fp } from "./fp";


export namespace ws {
  export function getCurrentTextEditors(): TextEditor[]{
    return _.compact([window.activeTextEditor, ...window.visibleTextEditors])
  }

  export function getSamedirActiveTextEditor(uri: Uri): TextEditor | undefined{
    const editors = getCurrentTextEditors()
    return editors.find(editor => fp.hasSameDir(uri.path, editor.document.uri.path))
  }

  export function getSameActiveTextEditor(uri: Uri): TextEditor | undefined{
    const editors = getCurrentTextEditors()
    return editors.find(editor => uri.path === editor.document.uri.path)
  }

  export function getOpenWorkspaceFolder(): WorkspaceFolder | undefined {
    let workspaceFolder;
    // 当前活跃的编辑器
    const editor = window.activeTextEditor;
    if (editor && (workspaceFolder = workspace.getWorkspaceFolder(editor.document.uri))) return workspaceFolder;

    // 打开的编辑中选第一个
    for (const editor of window.visibleTextEditors) {
      const workspaceFolder = workspace.getWorkspaceFolder(editor.document.uri);
      if (workspaceFolder) return workspaceFolder;
    }

    return undefined;
  }
}