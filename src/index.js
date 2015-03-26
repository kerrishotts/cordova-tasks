import "core-js/shim";
import {transforms} from "./transforms/index";
import cordovaLib from "cordova-lib";
let cordova = cordovaLib.cordova.raw;
import path from "path";
function performSubstitutions(replace, pkg) {
    return replace({
        patterns: [
            {match: /{{{VERSION}}}/g, replacement: pkg.version},
            {match: /{{{ID}}}/g, replacement: pkg.cordova.id},
            {match: /{{{NAME}}}/g, replacement: pkg.cordova.name},
            {match: /{{{DESCRIPTION}}}/g, replacement: pkg.cordova.description},
            {match: /{{{AUTHOR.NAME}}}/g, replacement: pkg.cordova.author.name},
            {match: /{{{AUTHOR.EMAIL}}}/g, replacement: pkg.cordova.author.email},
            {match: /{{{AUTHOR.SITE}}}/g, replacement: pkg.cordova.author.site},
            {match: /{{{PREFS}}}/g, replacement: transforms.transformCordovaPrefs.bind(null, pkg)},
            {
                match:       /{{{ICONS}}}/g,
                replacement: transforms.transformCordovaAssets.bind(null, "icon", transforms.templates.CORDOVA_ASSET_TEMPLATE, pkg)
            },
            {
                match:       /{{{SPLASHES}}}/g,
                replacement: transforms.transformCordovaAssets.bind(null, "splash", transforms.templates.CORDOVA_ASSET_TEMPLATE, pkg)
            },
            {match: /{{{GAP:PLUGINS}}}/g, replacement: transforms.transformCordovaPlugins.bind(null, pkg)},
            {
                match:       /{{{GAP:ICONS}}}/g,
                replacement: transforms.transformCordovaAssets.bind(null, "icon", transforms.templates.PGBUILD_ASSET_TEMPLATE, pkg)
            },
            {
                match:       /{{{GAP:SPLASHES}}}/g,
                replacement: transforms.transformCordovaAssets.bind(null, "splash", transforms.templates.PGBUILD_ASSET_TEMPLATE, pkg)
            }]
    });
}

export const BUILD_MODE_RELEASE = "release",
             BUILD_MODE_DEBUG   = "debug";

export class CordovaTasks {
    constructor({pkg, basePath, sourceDir, buildDir, gulp, replace}) {
        this.pkg = pkg;
        this.basePath = basePath;
        this.sourcePath = path.join(basePath, sourceDir);
        this.buildPath = path.join(basePath, buildDir);
        this.gulp = gulp;
        this.replace = replace;

        this.performSubstitutions = performSubstitutions.bind(this, replace, pkg);
    }

    copyConfig() {
        return this.gulp.src(path.join(this.sourcePath, "config.xml"))
            .pipe(performSubstitutions(this.replace, this.pkg))
            .pipe(this.gulp.dest(this.buildPath));
    }

    /**
     * Creates the cordova project based on the settings in package.json
     * cordova.id specifies the app's id
     * cordova.name specifies the app's display name
     * cordova.template specifies where the initial template should come from
     *    TODO: maybe the above should be removed and www just deleted?
     *    TODO: that said, if we don't specify one, default gets downloaded
     */
    create() {
        return cordova.create(this.buildPath, this.pkg.cordova.id,
            this.pkg.cordova.name, {
                lib: {
                    www: {
                        url:  path.join(this.basePath, this.pkg.cordova.template),
                        link: false
                    }
                }
            });
    }

    /**
     * All cordova commands other than create need to be in the project's
     * directory. This will change the current working directory to the
     * cordova project directory.
     */
    cdProject() {
        process.chdir(path.join(this.buildPath, "www"));
    }

    /**
     * Changes back to the (meta-) project's directory after a cordova
     * command
     */
    cdUp() {
        process.chdir("..");
    }

    /**
     * Add the plugins specified in cordova.plugins in package.json
     */
    addPlugins() {
        this.cdProject();
        return cordova.plugins("add", this.pkg.cordova.plugins).then(this.cdUp);
    }

    /**
     * Removes the plugins specified in cordova.plugins in package.json
     */
    removePlugins() {
        this.cdProject();
        return cordova.plugins("rm", this.pkg.cordova.plugins.reverse()).then(this.cdUp);
    }

    /**
     * Adds the platforms specified in cordova.platforms in package.json.
     * The platforms must also be added as dev dependencies.
     */
    addPlatforms() {
        this.cdProject();
        function transformPlatform(platform) {
            return path.join(this.basePath, "node_modules", "cordova-" + platform);
        }

        return cordova.platforms("add", this.pkg.cordova.platforms.map(transformPlatform.bind(this))).then(this.cdUp);
    }

    /**
     * build the cordova project
     */
    build({buildMode, options=[]}) {
        this.cdProject();
        return cordova.build({
            options: ["--" + buildMode].concat(options)
        }).then(this.cdUp);
    }

    /**
     * prepare the cordova project
     */
    prepare() {
        this.cdProject();
        return cordova.prepare().then(this.cdUp);
    }

    /**
     * emulate the app with the specified platform
     */
    emulate({platform, buildMode=BUILD_MODE_DEBUG}, options=[]) {
        this.cdProject();
        return cordova.emulate({
            platforms: [platform],
            options:   ["--" + buildMode].concat(options)
        }).then(this.cdUp);
    }

    /**
     * run the app on the specified platform
     */
    run({platform, buildMode=BUILD_MODE_DEBUG, options=[]}) {
        this.cdProject();
        return cordova.run({
            platforms: [platform],
            options:   ["--device", "--" + buildMode].concat(options)
        }).then(this.cdUp);
    }

    init() {
        return this.create()
            .then(this.copyConfig.bind(this))
            .then(this.addPlugins.bind(this))
            .then(this.addPlatforms.bind(this));
    }

}

