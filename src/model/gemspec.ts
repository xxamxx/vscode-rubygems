import { join } from 'path';
import _ = require('lodash');
import { Specification } from './specification';
import { DEFAULT_PLATFORM, GemspecType } from '../shared/constant';
import { FileUri } from '../lib/ext/file-uri';
import { global } from '../global';

export interface SpecOption {
  name: string;
  version: string;
  platform: string;
  defaulted: boolean;
  localness: boolean;
  type: GemspecType;
  dir: string;
  uri: FileUri;
  specification: Specification
}

export class Gemspec {

  static async from(specification: Specification) {
    const fullname = Gemspec.fullname(specification.name, specification.version, specification.platform);
    const localness = specification.stub.gems_dir.includes('/vendor/bundle/');
    return new Gemspec({
      name: specification.name,
      version: specification.version,
      platform: specification.platform,
      defaulted: specification.stub.default_gem,
      type: specification.dependencies.length ? GemspecType.Requirement : GemspecType.Dependency,
      uri: await FileUri.file(join(specification.stub.gems_dir, fullname)),
      dir: specification.stub.gems_dir,
      localness,
      specification,
    });
  }

  static async findAll(
    prjPath: string, 
    options: { predicate?: any, cache: boolean } = { cache: true }
  ): Promise<Gemspec[]>{
    let gemspecs = await this._getSource(prjPath, options)

    return options.predicate 
      ? _.filter<Gemspec>(gemspecs, options.predicate) as Gemspec[]
      : gemspecs as Gemspec[]
  }

  private static async _getSource(
    prjPath: string, 
    options: { cache: boolean } = { cache: true }
  ): Promise<Gemspec[]>{
    const key = `Gemspec:${prjPath}`
    let gemspecs: Gemspec[] = []
    if (options.cache) gemspecs = global.sourceStorage.get(key) || []
    
    if (gemspecs.length <= 0){
      const rows = await Specification.fromRubyBundle(prjPath)
      gemspecs = await Promise.all(rows.map(s => this.from(s)))
      // 为啥会 Map#set 对象数组就空了
      global.sourceStorage.set(key, _.cloneDeep(gemspecs))
    }
    return gemspecs
  }
  
  static fullname(name: string, version: string, platform: string | undefined): string {
    if (platform === DEFAULT_PLATFORM || !platform) {
      return `${name}-${version}`;
    } else {
      return `${name}-${version}-${platform}`;
    }
  }

  public readonly name: string;
  public readonly version: string;
  public readonly platform: string;
  public readonly defaulted: boolean = false;
  public readonly localness: boolean = false;
  public readonly type: GemspecType = GemspecType.Requirement;
  public readonly dir: string;
  public readonly uri: FileUri;
  public readonly specification: Specification;

  constructor(value: SpecOption) {
    this.name = value.name;
    this.version = value.version;
    this.platform = value.platform;
    this.defaulted = value.defaulted;
    this.localness = value.localness;
    this.type = value.type;
    this.dir = value.dir;
    this.uri = value.uri
    this.specification = value.specification
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
