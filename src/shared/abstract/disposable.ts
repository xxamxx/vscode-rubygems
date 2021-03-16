import { Disposable } from 'vscode';

export abstract class Disposition implements Disposable {
  protected disposable: Disposable[] = [];

  dispose() {
    Disposable.from(...this.disposable).dispose();
  }
}
