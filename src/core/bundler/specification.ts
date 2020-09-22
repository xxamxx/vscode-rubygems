import { Spec } from "../spec";
import { GemDependency} from './gem_dependency';
import { StubSpecification } from './stub_specification';

const DEFAULT_PLATFORM = 'ruby';

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

    public static from_specifications(specifications: any[]): Specification[] {
        return specifications.map((specification) => (new Specification(specification)));
    }

    public constructor(payload: any) {
        this.name = payload.name;
        this.version = payload.version;
        this.platform = payload.platform;
        this.spec_fetcher = payload.spec_fetcher;
        this.source = payload.source;
        this.dependencies = GemDependency.from_dependencies(payload.dependencies);
        this.stub = payload.stub ? new StubSpecification(payload.stub) : undefined;
    }

    public full_name(): string {
        if (this.platform === DEFAULT_PLATFORM || !this.platform) { return `${this.name}-${this.version}`; }
        else { return `${this.name}-${this.version}-${this.platform}`; }
    }

    public match_name(name: string): boolean {
        return this.full_name() === name;
    }

    public toSpec(){
        return new Spec({
            name: this.name,
            version: this.version,
            defaulted: false,
            globally: true,
            required: true,
            path: '',
            dir: '',
        })
    }
}