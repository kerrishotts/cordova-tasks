# Cordova Tasks

This module was created in order to more easily interface Cordova with Gulp (and potentially other build systems). It does so by using [cordova-lib](https://www.npmjs.com/package/cordova-lib) rather than using the [Cordova CLI](https://www.npmjs.com/package/cordova). Even so, the functionality is the same, and is compatible with the CLI.

This module is somewhat opinionated — it makes the assumption (founded or not) that your Cordova app is a _build artifact_. Hence the tasks typically assume that your Cordova project itself is in a `build` directory or the like (though you can configure the location). It also assumes that you will be copying from a template project (rather than downloading the default Hello World project). Finally, because of the expectation that your Cordova project is a build artifact, it does not offer the entire functionality of the Cordova CLI. For example, it doesn’t support platform updates or removals — the expectation is that you’d `rm` your `build` directory instead.

> **IMPORTANT**: This is a 0.2 version. Take that into consideration when using it. It might blow up in your face, run away with your computer, or reach out and throttle you at the most inopportune moment. More likely, it just won’t work the way you expect. (In that case, feel free to contribute or file a bug. In the other cases: I’m not liable!) Furthermore, the interface is extremely apt to change, especially as the functionality is fleshed out.



> **ALSO VERY IMPORTANT**: If you rely on keeping any information in the `.cordova` directory (like the PhoneGap Build App ID), _be very careful_! If you delete the `build` directory (like I do) without saving this information, you may be in a world of hurt.

## Installing Cordova Tasks

Cordova Tasks is available via NPM, and depends on Gulp and [`gulp-replace-task`](https://www.npmjs.com/package/gulp-replace-task) if you want to utilize the substitution functionality.

``` bash
$ npm install --save-dev cordova-tasks gulp-replace-task
```

You should also install whatever platforms you intend to target:

``` bash
$ npm install --save-dev cordova-ios cordova-android ...
```

## Using Cordova Tasks

First, you need to `require` Cordova Tasks in your `gulpfile`, like so:

``` JavaScript
var cordova = require("cordova-tasks");
```

You’ll need to get a reference to your project’s `package.son` file (which is where most of the configuration lives), `gulp`, and `gulp-replace-task`:

``` JavaScript
var pkg = require("./package.json"),
    gulp = require("gulp"),
    replace = require("gulp-replace-task");
```

By itself, this doesn’t do much. Next, you need to instantiate an instance of `CordovaTasks`:

```
var cordovaTasks = new cordova.CordovaTasks({
  pkg: pkg,              # your app's package.json
  basePath: __dirname,   # app's root
  buildDir: "build",     # target directory, relative to basePath
  sourceDir: "src",      # source directory, relative to basePath
  gulp: gulp,            # gulp
  replace: replace});    # gulp-replace-task
```

Before you can start using this instance, however, you need to ensure your `package.json` file is appropriately configured.

### Cordova Project Configuration

Most of the configuration for the generated Cordova Project will come from your `package.json`. The form is as follows:

``` json
{
  ...,
  "version": "0.1.0",
  ...,
  "cordova": {
    "name": "your-app's-name",
    "id": "com.example.reverse-domain",
    "description": "Description of your app",
    "author": {
      "name": "Your name",
      "email": "you@example.com",
      "site": "http://www.example.com"
    },
    "template": "./blank",
    "platforms": [ "ios", "android" ],
    "icon": {
      "ios": [
        { "src": "res/icon/ios/icon-60.png", "w": 60, "h": 60 }, ...
      ],
      "android": [
        { "src": "res/icon/android/ldpi.png", "d": "ldpi" }, ...
      ]
    },
    "splash": {
      "ios": [
        { "src": "res/splash/ios/Default~iphone.png", "w": 320, "h": 480 }, ...
      ],
      "android": [
        { "src": "res/splash/android/splash-land-hdpi.png", "d": "land-hdpi" }, ...
      ]
    },
    "preferences": {
      "orientation": "default", ...
    },
    "plugins": [
      "cordova-plugin-device", ...
    ]
  }, ...
```

Some notes about this format:

- The top-level `version` is used to give your Cordova project a version. **Required**
- Your app’s title, description, ID, etc. come from the `cordova` object. **Required**
- `cordova.name` is your app’s visible name. **Required**
- `cordova.id` is your app’s reverse domain ID. **Required**
- `cordova.description` is your app’s description. This is only visible in `config.xml`. **Required**
- `cordova.author` supplies your `config.xml` file with author information. You must supply your `name`, `email`, and `site`. **Required**
- `cordova.template` indicates the template to use when creating the Cordova project. This is equivalent to `--copy-from` when using the CLI. This should usually be a directory with a blank `www` directory inside. **Required**
- `cordova.platforms` indicates which platforms your project targets. You must have installed them using `npm install --save-dev cordova-<platform>` , not via the CLI. **Required**
- `cordova.icon` and `cordova.splash` indicate where your icons and splash screens are located. `src` is relative to the created Cordova project directory, and so in the above example, it would resolve to `$PROJECT_ROOT/build/res/…`.`w`, `h` specify the width and height, respectively (for iOS), while `d` specifies the density (for Android). An array should be present for each supported platform. If the files don’t exist, that’s OK; the build will complain but it isn’t fatal.
- `cordova.preferences` is an array containing key/value strings. The value should always be a string, even for boolean or numeric values.
- `cordova.plugins` is an array of plugins that should be added to the project. These can be plugin IDs (and optionally `@version`), or URL/local paths -- anything supported by `cordova plugin add` _should_ work.

### `config.xml` template

You also need to create a `config.xml` template in `basePath`/`sourceDir` /`config.xml`. Here’s an example template:

``` xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="{{{ID}}}" version="{{{VERSION}}}"
  xmlns="http://www.w3.org/ns/widgets"
  xmlns:cdv="http://cordova.apache.org/ns/1.0"
  xmlns:gap="http://phonegap.com/ns/1.0">
  <name>{{{NAME}}}</name>
  <description>
    {{{DESCRIPTION}}}}
  </description>
  <author email="{{{AUTHOR.EMAIL}}}" href="{{{AUTHOR.SITE}}}">
    {{{AUTHOR.NAME}}}
  </author>
  <content src="index.html" />

  <!-- local phonegap/cordova -->
  {{{PREFS}}}
  {{{PLUGINS}}}
  {{{ICONS}}}
  {{{SPLASHES}}}

  <!-- phonegap build; experimental -->
  {{{GAP:PLUGINS}}}
  {{{GAP:ICONS}}}
  {{{GAP:SPLASHES}}}

  <access origin="*" />
</widget>
```

This file is used as a template when creating the Cordova project. The substitution variables are described in the following section.

### Cordova Tasks Documentation

The following constants are present on the object returned from `require('cordova-tasks')`:

- `BUILD_MODE_DEBUG`: Build in `debug` mode
- `BUILD_MODE_RELEASE`: Build in `release` mode

The following methods are present on the `cordovaTasks` object:

- `init()`: initializes the project. It’s actually a combination of `create`, `copyConfig`, `addPlatforms`, and `addPlugins`. Returns a `promise`.

- `create()`: creates a new project. The project is created in `basePath`/`buildDir`. Returns a `promise`. **Note:** If this directory already exists, it must be empty. You can `rimraf` or similar plugin to clear this prior to calling this command if you want, like so:

- ``` Javascript
  var path = require("path"),
      rimraf = require("rimraf"),
      basePath = __dirname,
      buildDir = "build";
  function clean(cb) {
      rimraf(path.join(basePath, buildDir), cb);
  }
  ```

- `addPlugins()`: adds the plugins listed in `cordova.plugins` to the project. Returns a `promise`.

- `addPlatforms()`: adds the platforms listed in `cordova.platforms` and installed in `basePath`/`node_modules` into the project. Returns a `promise`.

- `prepare()`: Copies the files from `build/www` to each platform directory. This is the same as `cordova prepare`. There’s typically no need to do this, since `build`, `emulate`, and `run` take care of this step automatically. Returns a `promise`.

- `build({buildMode, platforms, options})`: builds the project. If `buildMode` isn’t supplied, it defaults to `debug`. If platforms is specified, it should be an array of platforms to build for. If it isn't specified, all platforms will be built. If `options` is specified, it must be an array, and it is concatenated to the array passed to `cordoba-lib`'s `build` command. Returns a `promise`.

- `emulate|run({platform, buildMode, options})`: emulates/runs the project for the specified platform (**required**). The `buildMode` is passed to `build` and defaults to `debug` if not supplied. If `options` is specified, it must be an array, and it will be concatenated to the array passed to `cordoba-lib`'s `run` or `emulate` command. Returns a `promise`.

- `cdProject()`: Changes to the `www` directory within `basePath`/`buildDir`. This is due to the way `cordoba-lib` requires all commands (other than `create`) to be within a Cordova project. Returns immediately.

- `cdUp()`: Changes back up to the original path.

- `copyConfig()`: Copies the template `config.xml` file in `basePath`/`sourceDir` to `basePath`/`buildDir` and processes the following substitution variables:

  - `{{{VERSION}}}` →  `pkg.version` (where `pkg` is your project’s `package.json`)

  - `{{{ID}}}` → `pkg.cordova.id`

  - `{{{NAME}}}` → `pkg.cordova.name`

  - `{{{DESCRIPTION}}}` → `pkg.cordova.description`

  - `{{{AUTHOR.NAME}}}` → `pkg.cordova.author.name`

  - `{{{AUTHOR.EMAIL}}}` → `pkg.cordova.author.email`

  - `{{{AUTHOR.SITE}}}` → `pkg.cordova.author.site`

  - `{{{PLUGINS}}}` → transforms `pkg.cordova.plugins` to `<plugin />` tags.

  - `{{{PREFS}}}` → transforms `pkg.cordova.preferences` to the appropriate XML

  - `{{{ICONS}}}` → transforms `pkg.cordova.icon` to the appropriate XML

  - `{{{SPLASHES}}}` → transforms `pkg.cordova.splash` to the appropriate XML

    > There are three replacement variables for PhoneGap Build as well: `{{{GAP:PLUGINS}}}`, `{{{GAP:ICONS}}}` and `{{{GAP:SPLASHES}}}`. These should be considered experimental.


  > **NOTE**: If you need to process these substitution variables in your own code, you can. Just call `cordovaTasks.processSubstitutions` as part of your stream process, like this:
  >
  > ``` javascript
  > function copyCode() {
  >     var isRelease = (BUILD_MODE === "release");
  >     return browserify("./src/www/js/app/index.js", {
  >             debug: !isRelease,
  >             standalone: "app"
  >         })
  >         .transform(babelify.configure({
  >           experimental: true
  >         }))
  >         .bundle()
  >         .on("error", gutil.log.bind(gutil, "Browserify Error"))
  >         .pipe(source("app.js"))
  >         .pipe(buffer())
  >         .pipe(cordovaTasks.performSubstitutions())
  >         .pipe(isRelease ? gutil.noop() : sourcemaps.init({
  >             loadMaps: true
  >         }))
  >         .pipe(isRelease ? uglify({preserveComments:"some"}) : gutil.noop())
  >         .pipe(isRelease ? gutil.noop() : sourcemaps.write()) // writes .map file
  >         .pipe(gulp.dest(path.join(BUILD_DIR, "www", "js", "app")))
  >         .pipe(livereload());
  > }
  > ```


## Workflow

So you’ve read all this and are wondering how the Cordova project gets updates to preferences, plugins and platforms, right?

_It doesn’t._

At least, I don’t have a method that does that directly. If you want to add that functionality, feel free to issue a pull request, though.

> Technically, it’d be super-cool to have a step that compared the settings in `package.json` and then made the appropriate changes at the next build. Wanna take that challenge? Submit a PR!

Personally, here’s what I do: blow away the `build` directory whenever I change my preferences, plugins or platforms. I have a command just for it in my `gulpfile`, `init`. It depends on a `clean` step that nukes the `build` directory and then `init` calls `cordovaTasks.init`. Easy-peasy.

## Tests

Not many. Yet. I’m sure there’s a way to do it, but I haven’t taken a crack at it. Instead, I’m going to use the horrible phrase, “it works for me!”. ;-)

There are some tests for some of the internal functionality, but these are slim, and don’t actually verify much. If you really want to run them, you can do so by cloning the repo, executing `npm install`, and then `npm test`.

## Changes

* 2.0 - Added support for `cordova-lib@5.0.0`, updated dependencies, added support for PLUGIN tag, added `platforms` to `build`
* 1.1 - Initial Release

## License.

MIT. See [LICENSE](./LICENSE).
