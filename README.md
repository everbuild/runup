> Efficient task automation platform for web developers

Runup is a task automation platform specific for front-end web application development with a strong focus on performance.
Not being general purpose is a very conscious choice because it allows for more optimization and more useful features for this specific use case.


# Overview

* Separation of development and build concerns: optimized for fast feedback during **development** and high quality during **build**.
* Define tasks in **flows**, a powerful and flexible extension mechanism using standard Node.js files.
* No need for countless `runup-*` plugins to glue things together, in stead writing your own flows and integrating directly with existing tools is easy.
* Assets are processed **on demand** when your browser requests them and are never saved to disk. Unchanged assets are cached in memory.
* Includes all essential infrastructure you need, working out of the box:
  * Integrated web server
  * Integrated source file watcher
  * Live browser refresh
  * Asset hashing for cache busting
* Lightweight: efficient architecture with carefully chosen and minimal dependencies; starts in around half a second.


# Documentation

The [wiki](https://github.com/everbuild/runup/wiki) contains full documentation and a [tutorial](https://github.com/everbuild/runup/wiki/Tutorial).


# Install

```
$ npm install --saveDev runup
```
You can add ``--global`` to install the "binary" globally, but it's usually not necessary as Runup can be easily setup through NPM scripts.


# Usage

The best way is via NPM scripts:

```json
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

* `dev` starts Runup in development mode.
* `build` makes a release build.

You can off course also use the CLI directly:

```
$ [./node_modules/.bin/]runup [build] 
```

(The `node_modules` prefix is not needed with a `--global` install.)

Finally, you can also use the [API](https://github.com/everbuild/runup/wiki/API#main-api).