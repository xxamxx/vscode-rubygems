import { join } from 'path';
import { SpecType } from '../constant';
import { Spec } from '../spec';
import { GemDependency } from './gem_dependency';
import { StubSpecification } from './stub_specification';

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
    try {
      this.stub = new StubSpecification(payload.stub);
    } catch (error) {
      console.error(error)
    }
  }

  public toSpec() {
    const fullname = Spec.fullname(this.name, this.version, this.platform);
    const localness = this.stub.gems_dir.includes('/vendor/bundle/')
    return new Spec({
      name: this.name,
      version: this.version,
      platform: this.platform,
      defaulted: this.stub.default_gem,
      type: this.dependencies.length ? SpecType.Requirement : SpecType.Dependency,
      path: join(this.stub.gems_dir, fullname),
      dir: this.stub.gems_dir,
      localness
    });
  }
}
