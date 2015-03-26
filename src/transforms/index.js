import {transformCordovaAssets, CORDOVA_ASSET_TEMPLATE, PGBUILD_ASSET_TEMPLATE} from "./cordova-assets";
import {transformCordovaPlugins} from "./cordova-plugins";
import {transformCordovaPrefs} from "./cordova-prefs";

export const transforms = {
    templates: {
        CORDOVA_ASSET_TEMPLATE,
        PGBUILD_ASSET_TEMPLATE
    },
    transformCordovaAssets,
    transformCordovaPlugins,
    transformCordovaPrefs
};

