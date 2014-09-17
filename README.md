## WIP ##

Mostly working for text and photo Tumblog entries.

This plugin requires the [hexo-tag-asset-res](https://github.com/timnew/hexo-tag-asset-res) plugin to be installed.

It also requires the `post_asset_folder: true` setting to be on.

# Tumblr migrator

Migrate your blog from Tumblr to [Hexo].

## Install

``` bash
$ npm install hexo-migrator-tumblr --save
```

## Usage

Execute the following command after installed. `source` is the file path or URL of a Tumblr blog.

``` bash
$ hexo migrate tumblr <source> <consumer_key>
```

[Hexo]: http://hexo.io