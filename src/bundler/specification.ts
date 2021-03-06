import { RubyBundleHandler } from '../lib/ruby-bundle-handler';
import { GemDependency } from './gem-dependency';
import { StubSpecification } from './stub-specification';

const DEFAULT_PLATFORM = 'ruby';

export interface Specification {
  name: string;
  version: string;
  platform: string;
  spec_fetcher: string;
  dependencies: GemDependency[];
  source: string;
  stub: StubSpecification;
}

export class Specification implements Specification {

  static async fromRubyBundle(prjPath: string): Promise<any[]> {
    const data = await RubyBundleHandler.exec(prjPath)
    return this.initialize(data);
  }

  static initialize(data: any[]): Specification[] {
    const list = [];

    for (const item of data) {
      if (!item.stub) continue;
      list.push(new Specification(item));
    }

    return list;
  }

  private constructor(payload: any) {
    this.name = payload.name;
    this.version = payload.version;
    this.platform = payload.platform;
    this.spec_fetcher = payload.spec_fetcher;
    this.source = payload.source;
    this.dependencies = GemDependency.from_dependencies(payload.dependencies);
    this.stub = new StubSpecification(payload.stub);
  }
}
