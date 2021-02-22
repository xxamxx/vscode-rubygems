import _ = require("lodash");
import { TextEditor, Uri, window } from "vscode";
import { UriComparer } from "./comparer";

export function getCurrentTextEditors(): TextEditor[]{
  return _.compact([window.activeTextEditor, ...window.visibleTextEditors])
}

export function getSamedirActiveTextEditor(uri: Uri): TextEditor | undefined{
  const editors = getCurrentTextEditors()
  return editors.find(editor => UriComparer.contain(uri, editor.document.uri))
}

export function getSameActiveTextEditor(uri: Uri): TextEditor | undefined{
  const editors = getCurrentTextEditors()
  return editors.find(editor => UriComparer.equal(uri, editor.document.uri))
}
