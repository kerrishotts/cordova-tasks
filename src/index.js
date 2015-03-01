import "core-js/shim";
import * as transforms from "transforms/index";
let replace = require("replace"),
    cordova = require("cordova-lib");

function performSubstitutions(pkg) {
    return replace({
        patterns: [
            {match: /{{{VERSION}}}/g, replacement: pkg.version},
            {match: /{{{ID}}}/g, replacement: pkg.cordova.id},
            {match: /{{{NAME}}}/g, replacement: pkg.cordova.name},
            {match: /{{{DESCRIPTION}}}/g, replacement: pkg.cordova.description},
            {match: /{{{AUTHOR.NAME}}}/g, replacement: pkg.cordova.author.name},
            {match: /{{{AUTHOR.EMAIL}}}/g, replacement: pkg.cordova.author.email},
            {match: /{{{AUTHOR.SITE}}}/g, replacement: pkg.cordova.author.site},
            {match: /{{{PREFS}}}/g, replacement: transforms.transformCordovaPrefs},
            {match: /{{{ICONS}}}/g, replacement: transforms.transformCordovaAssets.bind(null, "icon", transforms.templates.CORDOVA_ASSET_TEMPLATE)},
            {match: /{{{SPLASHES}}}/g, replacement: transforms.transformCordovaAssets.bind(null, "splash", transforms.templates.CORDOVA_ASSET_TEMPLATE)},
            {match: /{{{GAP:PLUGINS}}}/g, replacement: transforms.transformCordovaPlugins},
            {match: /{{{GAP:ICONS}}}/g, replacement: transforms.transformCordovaAssets.bind(null, "icon", transforms.templates.PGBUILD_ASSET_TEMPLATE)},
            {match: /{{{GAP:SPLASHES}}}/g, replacement: transforms.transformCordovaAssets.bind(null, "splash", transforms.templates.PGBUILD_ASSET_TEMPLATE)}]
    });
}

// cordova commands
// inspired by https://github.com/kamrik/CordovaGulpTemplate/blob/master/gulpfile.js
var cordovaTasks = {
    /**
     * Creates the cordova project based on the settings in package.json
     * cordova.id specifies the app's id
     * cordova.name specifies the app's display name
     * cordova.template specifies where the initial template should come from
     *    TODO: maybe the above should be removed and www just deleted?
     *    TODO: that said, if we don't specify one, default gets downloaded
     */
    create:        function create() {
        gutil.log("Creating Cordova project at " + BUILD_DIR);
        gutil.log("...  ID:", pkg.cordova.id);
        gutil.log("...NAME:", pkg.cordova.name);
        gutil.log("... SRC:", pkg.cordova.template);
        return cordova.create(BUILD_DIR, pkg.cordova.id,
            pkg.cordova.name, {
                lib: {
                    www: {
                        url:  path.join(__dirname, pkg.cordova.template),
                        link: false
                    }
                }
            })
            .then(logDone);
    },
    /**
     * All cordova commands other than create need to be in the project's
     * directory. This will change the current working directory to the
     * cordova project directory.
     */
    cdProject:     function cdProject() {
        process.chdir(path.join(BUILD_DIR, "www"));
        gutil.log("... CWD:", process.cwd());
    },
    /**
     * Changes back to the (meta-) project's directory after a cordova
     * command
     */
    cdUp:          function cdUp() {
        process.chdir("..");
        gutil.log("... CWD:", process.cwd());
    },
    /**
     * Add the plugins specified in cordova.plugins in package.json
     */
    addPlugins:    function addPlugins() {
        gutil.log("Adding plugins...");
        return cordova.plugins("add", pkg.cordova.plugins)
            .then(logDone);
    },
    /**
     * Removes the plugins specified in cordova.plugins in package.json
     */
    removePlugins: function removePlugins() {
        gutil.log("Removing plugins...");
        return cordova.plugins("rm", pkg.cordova.plugins.reverse())
            .then(logDone);
    },
    /**
     * Adds the platforms specified in cordova.platforms in package.json.
     * The platforms must also be added as dev dependencies.
     */
    addPlatforms:  function addPlatforms() {
        function transformPlatform(platform) {
            return path.join(__dirname, "node_modules", "cordova-" + platform);
        }

        gutil.log("Adding platforms...");
        return cordova.platforms("add", pkg.cordova.platforms.map(transformPlatform))
            .then(logDone);
    },
    /**
     * build the cordova project
     */
    build:         function build() {
        gutil.log("Building...", BUILD_MODE);
        return cordova.build({
            options: ["--" + BUILD_MODE]
        })
            .then(logDone);
    },
    /**
     * prepare the cordova project
     */
    prepare:       function prepare() {
        gutil.log("Preparing...");
        return cordova.prepare()
            .then(logDone);
    },
    /**
     * emulate the app with the specified platform
     */
    emulate:       function emulate() {
        gutil.log("Starting emulator...", PLATFORM, BUILD_MODE);
        return cordova.emulate({
            platforms: [PLATFORM],
            options:   ["--" + BUILD_MODE]
        })
            .then(logDone);
    },
    /**
     * run the app on the specified platform
     */
    run:           function run() {
        gutil.log("Running app on device...", PLATFORM, BUILD_MODE);
        return cordova.run({
            platforms: [PLATFORM],
            options:   ["--device", "--" + BUILD_MODE]
        })
            .then(logDone);
    }
};

