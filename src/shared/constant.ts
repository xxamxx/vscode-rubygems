
export enum SpecType {
  Requirement = 'requirement',
  Dependency = 'dependency'
}

export enum DefineFile {
  Gemfile = "Gemfile",
  Lockfile = "Gemfile.lock"
}

export const DEFAULT_PLATFORM = 'ruby';


export const SpecfileExtname = '.gemspec'


const placeholder = {
  char: '◼︎',
  word: '◼︎◼︎◼︎',
  line: '◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎'
};
