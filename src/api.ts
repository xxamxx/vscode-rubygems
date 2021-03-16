import { commands, Uri } from "vscode";
import { Container } from "./container";


export class Api {
  constructor(
    private readonly container: Container,
  ){ }

  async focus(uri: Uri): Promise<void> {
    if (!uri) return
    return commands.executeCommand('rubygems.command.reveal', uri)
  }

  async search(val: string): Promise<void> {
    if (!val) return
    await commands.executeCommand('rubygems.command.search', val)
  }
}