import { EventEmitter, Event } from 'vscode';
import { IEntry } from './i-entry';
import { ADisposable } from './a-disposable';

export abstract class ViewEmitter extends ADisposable {
  protected aEntryEmitter: EventEmitter<IEntry | undefined> = new EventEmitter<IEntry | undefined>();
  readonly onDidChangeEntry: Event<IEntry | undefined> = this.aEntryEmitter.event;

  refresh(): void {
    this.aEntryEmitter.fire(undefined);
  }
}
