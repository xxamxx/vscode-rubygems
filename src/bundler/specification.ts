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
  public static from_specifications(data: any[]): Specification[] {
    const list = [];

    for (const item of data) {
      if (!item.stub) continue;
      list.push(new Specification(item));
    }

    return list;
  }

  public constructor(payload: any) {
    this.name = payload.name;
    this.version = payload.version;
    this.platform = payload.platform;
    this.spec_fetcher = payload.spec_fetcher;
    this.source = payload.source;
    this.dependencies = GemDependency.from_dependencies(payload.dependencies);
    this.stub = new StubSpecification(payload.stub);
  }
}
