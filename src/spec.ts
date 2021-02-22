import { Uri } from 'vscode';
import { DEFAULT_PLATFORM, SpecType } from './constant';
import { UriComparer } from './util/comparer';

export interface SpecOption {
  name: string;
  version: string;
  platform: string;
  defaulted: boolean;
  localness: boolean;
  type: SpecType;
  dir: string;
  path: string;
}

export class Spec {
  public readonly name: string;
  public readonly version: string;
  public readonly platform: string;
  public readonly defaulted: boolean = false;
  public readonly localness: boolean = false;
  public readonly type: SpecType = SpecType.Requirement;
  public readonly dir: string;
  public readonly uri: Uri;

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
    this.uri = Uri.parse(value.path);
  }

  equal(other: Spec): boolean{
    return UriComparer.equal(this.uri, other.uri)
      && this.type === this.type
      && this.platform === this.platform
      && this.localness === this.localness
  }

  get fullname(): string {
    return Spec.fullname(this.name, this.version, this.platform);
  }
}
