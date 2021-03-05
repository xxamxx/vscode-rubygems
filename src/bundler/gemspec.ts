import { join } from 'path';
import { Specification } from './specification';
import { DEFAULT_PLATFORM, SpecType } from '../shared/constant';
import { FileUri } from '../lib/ext/file-uri';

export interface SpecOption {
  name: string;
  version: string;
  platform: string;
  defaulted: boolean;
  localness: boolean;
  type: SpecType;
  dir: string;
  uri: FileUri;
}

export class Gemspec {
  public readonly name: string;
  public readonly version: string;
  public readonly platform: string;
  public readonly defaulted: boolean = false;
  public readonly localness: boolean = false;
  public readonly type: SpecType = SpecType.Requirement;
  public readonly dir: string;
  public readonly uri: FileUri;

  static async from(specification: Specification) {
    const fullname = Gemspec.fullname(specification.name, specification.version, specification.platform);
    const localness = specification.stub.gems_dir.includes('/vendor/bundle/');
    return new Gemspec({
      name: specification.name,
      version: specification.version,
      platform: specification.platform,
      defaulted: specification.stub.default_gem,
      type: specification.dependencies.length ? SpecType.Requirement : SpecType.Dependency,
      uri: await FileUri.file(join(specification.stub.gems_dir, fullname)),
      dir: specification.stub.gems_dir,
      localness
    });
  }

  static fullname(name: string, version: string, platform: string | undefined): string {
    if (platform === DEFAULT_PLATFORM || !platform) {
      return `${name}-${version}`;
    } else {
      return `${name}-${version}-${platform}`;
    }
  }

  constructor(value: SpecOption) {
    this.name = value.name;
    this.version = value.version;
    this.platform = value.platform;
    this.defaulted = value.defaulted;
    this.localness = value.localness;
    this.type = value.type;
    this.dir = value.dir;
    this.uri = value.uri
  }

  equal(other: Gemspec): boolean{
    return this.uri.equal(other.uri)
      && this.type === this.type
      && this.platform === this.platform
      && this.localness === this.localness
  }

  get fullname(): string {
    return Gemspec.fullname(this.name, this.version, this.platform);
  }
}
