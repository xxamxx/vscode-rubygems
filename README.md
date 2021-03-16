# The RubyGems Explorer
This VSCode Extension can be used to browser RubyGems source codes from your Ruby project.

![show-how](https://raw.githubusercontent.com/xxamxx/vscode-rubygems/master/resources/screenshots/rubygems-show-how.gif "show-how")

## Features

- Explore RubyGems by `Gemfile.lock`
- Support Multi-root Workspaces
- Filter RubyGems
  - Search
  - Dependencies Filter
  - Requirements Filter
- Focus on one of the RubyGems
- Open Website
- Provide APIs
  - `async focus(uri: Uri): Promise<void>`  
    focus on one of the RubyGems on Explorer via file uri
  - `async search(val: string): Promise<void>`  
    search some RubyGems information on Explorer

## Extension Settings

This extension contributes the following settings:

| Setting | Default | Description |  
| ------- | ------- | ----------- | 
| `rubygems.other.website` | `"https://rubygems.org/gems/${name}"` | The Ruby community’s gem hosting service. <br> provide properties: `name`, `version`, `platform`, `dir` | 

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

[see CHANGELOG](./CHANGELOG.md)

**Enjoy!**
