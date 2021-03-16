
export interface StubSpecificationData {
  full_name: string;
  name: string;
  version: string;
  platform: string;
  require_paths: string[];
  extensions: string[];
}

export interface StubSpecification {
  extension_dir: string;
  full_gem_path: string;
  gem_dir: string;
  ignored: string;
  loaded_from: string;
  data: StubSpecificationData;
  name: string;
  spec: string;
  base_dir: string;
  gems_dir: string;
  default_gem: boolean;
}

export class StubSpecification implements StubSpecification {
  constructor(payload: any) {
    this.extension_dir = payload.extension_dir;
    this.full_gem_path = payload.full_gem_path;
    this.gem_dir = payload.gem_dir;
    this.ignored = payload.ignored;
    this.loaded_from = payload.loaded_from;
    this.data = payload.data;
    this.name = payload.name;
    this.spec = payload.spec;
    this.base_dir = payload.base_dir;
    this.gems_dir = payload.gems_dir;
    this.default_gem = payload.default_gem === 'true';
  }
}
