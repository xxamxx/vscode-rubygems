import { Disposable } from "vscode";


export abstract class ADisposable implements Disposable {
    protected disposable: Disposable[] = [];

    dispose() {
        Disposable.from(...this.disposable).dispose();
    }
}