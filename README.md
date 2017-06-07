> Efficient task automation platform for web developers

**Notice: Work in progress. Some functionality and documentation are incomplete!**

Runup is a task automation platform specific for front-end web application development with a strong focus on performance.
Not being general purpose is a very conscious choice because it allows for more optimisation and more useful features for this specific use case.
 
**Contents**

1. [Overview](#overview)
2. [Install](#install)
3. [Usage](#usage)
4. [Example](#example)
5. [Documentation](#documentation)

# Overview

Runup separates the development and release build process as the two have very different concerns.

During development, you want to have fast feedback of what you're working on.
Fast feedback means less friction when trying out different things, more focus on things that matter, like the creative process, more efficiency, and ultimately more enjoyment.
Tools that take many seconds to respond to small code changes get in the way of that and quickly become frustrating.
Especially when you realise that many of those seconds are actually not even needed.
Runup makes the development process as efficient as possible because it is what developers interact with most.

Release builds happen relatively rarely so it's ok if they take a bit more time.
The focus there is on producing optimized and quality assets rather than fast builds.

The core platform uses an efficient architecture that avoids a lot of overhead.
During development, all assets are processed on demand when your browser requests them and are never saved to disk.
It also ships with all essential infrastructure you need, working out of the box, like an integrated web server, watcher and browser refresh, asset versioning for cache busting...

It is only a platform though, you still need to integrate it with the tools that do the real work (like node-sass to compile your SASS files).
However, Runup has a powerful and flexible extension mechanism to help you out that makes no assumptions about the actual tools you want to use.
It's generally straight-forward to integrate directly with the API of any existing tool, without the need for countless `runup-*` plugins to glue things together.
Plus, you get full control over your tool's API and it's options.
Sharing integration recipes in the wiki (TODO) is encouraged as an alternative to plugins.

The extension points are called **flows**, and they allow you to specify what needs to happen in 4 scenarios:

* **dev**: process an asset for development use: do the absolute minimum amount of work needed to show/run/debug it in your browser (bundle JS files, compile SASS files,...).
* **prd**: process an asset for production use: optimize as much as possible and take all the time needed for that (transpile, minify,...).
* **check**: verify the correctness of an asset (lint, test,...)
* **update**: runs in your browser when an asset is modified and determines how to respond to that.

More or less useful defaults are provided for all flows, so you only need to worry about those you care about.

More specific documentation will be added to the wiki (TODO).

# Install

```
$ npm install --saveDev runup
```
You can add ``--global`` to install the "binary" globally, but it's usually not necessary as runup can be easily setup through NPM scripts.

# Usage

Via command-line:
```
$ [node_modules/.bin/]runup [build] 
```
If `build` is specified, a release build will be made, otherwise, Runup starts in development mode.

(The `node_modules/.bin/` prefix is not needed with a `--global` install.)

As NPM scripts:
```
// package.json
{
  "scripts": {
    "dev": "runup",
    "build": "runup build"
  }
}
```
Then run one of:
```
$ npm run dev
$ npm run build
```

Finally, you could also use the API (TODO).

# Example

To see a very basic project in action, [have a look at this](example).

# Documentation

See wiki (TODO)