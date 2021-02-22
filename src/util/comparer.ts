import { TextDocument, TextEditor, Uri } from 'vscode';
import { Path } from '.';

abstract class Comparer<T> {
  abstract equal(lhs: T, rhs: T): boolean;
}

class UriComparer extends Comparer<Uri> {
  equal(lhs: Uri | undefined, rhs: Uri | undefined, options: { exact?: boolean } = { exact: false }) {
    if (lhs === rhs) return true;
    if (lhs === undefined || rhs === undefined) return false;

    if (options.exact) {
      return lhs.toString(true) === rhs.toString(true);
    }
    return lhs.scheme === rhs.scheme && lhs.fsPath === rhs.fsPath;
  }

  // samedir
  contain(dir: Uri, subdir: Uri): boolean {
    return Path.contain(dir.path, subdir.path);
  }
}

class TextDocumentComparer extends Comparer<TextDocument> {
  equal(lhs: TextDocument | undefined, rhs: TextDocument | undefined) {
    return lhs === rhs;
    // if (lhs === rhs) return true;
    // if (lhs === undefined || rhs === undefined) return false;

    // return uriComparer.equal(lhs.uri, rhs.uri);
  }
}

class TextEditorComparer extends Comparer<TextEditor> {
  equal(
    lhs: TextEditor | undefined,
    rhs: TextEditor | undefined,
    options: { useId: boolean; usePosition: boolean } = { useId: false, usePosition: false }
  ) {
    if (lhs === rhs) return true;
    if (lhs === undefined || rhs === undefined) return false;

    if (options.usePosition && lhs.viewColumn !== rhs.viewColumn) return false;

    if (options.useId && (!lhs.document || !rhs.document)) {
      if ((lhs as any).id !== (rhs as any).id) return false;

      return true;
    }

    return textDocumentComparer.equal(lhs.document, rhs.document);
  }
}

const textDocumentComparer = new TextDocumentComparer();
const textEditorComparer = new TextEditorComparer();
const uriComparer = new UriComparer();
export {
  textDocumentComparer as TextDocumentComparer,
  textEditorComparer as TextEditorComparer,
  uriComparer as UriComparer
};
