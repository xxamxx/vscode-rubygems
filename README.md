# Vscode-Rubygems README

The is Rubygems Explorer, it can browser rubygems source codes of your project by `Gemfile.lock`.
the extension be to autoload all folder of containing `Gemfile.lock` in the workspaces.

## Features

起始判断
- 是否有ruby环境 -- 通过环境变量
- 是否有bundle -- 通过环境变量
- 是否包含 Gemfile.lock -- 拼接path，通过stat判断

feature
- explore RubyGems by `Gemfile.lock`
- switch LockfileFolder which when the active editor has changed
- support multi LockfileFolder
- switch LockfileFolder on change document
- switch LockfileFolder on change document
> Tip: LockfileFolder is a folder of containing `Gemfile.lock`.

## Extension Settings

This extension contributes the following settings:

* `rubygems.explorer.selectLockfileFolder`: select LockfileFolder
* `rubygems.explorer.refresh`: refresh current LockfileFolder

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

[see CHANGELOG](./CHANGELOG.md)

**Enjoy!**