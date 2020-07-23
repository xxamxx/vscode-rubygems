import { GemDependency} from './gem_dependency';
import { StubSpecification } from './stub_specification';

const DEFAULT_PLATFORM: string = 'ruby';

export interface Specification {
    name: string;
    version: string;
    platform: string;
    spec_fetcher: string;
    dependencies: GemDependency[];
    source: string;
    stub?: StubSpecification;
}

export class Specification implements Specification {

    constructor(payload: any) {
        this.name = payload.name;
        this.version = payload.version;
        this.platform = payload.platform;
        this.spec_fetcher = payload.spec_fetcher;
        this.source = payload.source;
        this.dependencies = GemDependency.from_dependencies(payload.dependencies);
        this.stub = payload.stub ? new StubSpecification(payload.stub) : undefined;
    }

    static from_specifications(specifications: any[]): Specification[] {
        return specifications.map((specification) => (new Specification(specification)));
    }

    full_name(): string {
        if (this.platform === DEFAULT_PLATFORM || !this.platform) { return `${this.name}-${this.version}`; }
        else { return `${this.name}-${this.version}-${this.platform}`; }
    }

    match_name(name: string): boolean {
        return this.full_name() === name;
    }
}

export class SpecificationSet extends Set<Specification> {
    // includes(name: string): boolean{
    // }
}