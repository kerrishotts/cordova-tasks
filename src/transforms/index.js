"use strict";

import {transformCordovaAssets, CORDOVA_ASSET_TEMPLATE, PGBUILD_ASSET_TEMPLATE} from "./cordova-assets";
import {transformCordovaPlugins, CORDOVA_PLUGIN_TEMPLATE, PGBUILD_PLUGIN_TEMPLATE} from "./cordova-plugins";
import {transformCordovaPrefs} from "./cordova-prefs";

export const transforms = {
    templates: {
        CORDOVA_ASSET_TEMPLATE, CORDOVA_PLUGIN_TEMPLATE,
        PGBUILD_ASSET_TEMPLATE, PGBUILD_PLUGIN_TEMPLATE
    },
    transformCordovaAssets,
    transformCordovaPlugins,
    transformCordovaPrefs
};

