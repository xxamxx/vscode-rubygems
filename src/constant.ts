export enum RubyFileSymbol {
  Gemfile = 'Gemfile',
  Lockfile = 'Gemfile.lock'
}


export enum SpecType {
  Requirement = 'requirement',
  Dependency = 'dependency'
}

export const DEFAULT_PLATFORM = 'ruby';

export const LocalFlag = 'Local'

const placeholder = {
  char: '◼︎',
  word: '◼︎◼︎◼︎',
  line: '◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎',
};