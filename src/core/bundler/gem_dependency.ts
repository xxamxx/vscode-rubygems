
export interface GemDependency {
    name: string;
    type: string;
    prerelease: string;
    version_requirements: string;
    requirement: GemRequirement;
}

export class GemDependency implements GemDependency {
    constructor(payload: any) {
    this.name = payload.name;
    this.type = payload.type;
    this.prerelease = payload.prerelease;
    this.version_requirements = payload.version_requirements;
    this.requirement = new GemRequirement(payload.requirement);
    }

    static from_dependencies(dependencies: any[]): GemDependency[] {
        return dependencies.map((dependency) => (new GemDependency(dependency)));
    }
}



export interface GemRequirement {
    requirements: [string, string][];
}

export class GemRequirement implements GemRequirement {
    constructor(payload: any) {
        this.requirements = payload;
    }
}