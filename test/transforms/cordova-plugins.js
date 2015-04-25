"use strict";

import "core-js/shim";
import {transformCordovaPlugins, CORDOVA_PLUGIN_TEMPLATE, PGBUILD_PLUGIN_TEMPLATE} from "../../src/transforms/cordova-plugins";

let should = require("should");

let singlePluginNoVersion = {
    cordova: {
        plugins: [
            "org.apache.cordova.file"
        ]
    }
};
let singlePluginWithVersion = {
    cordova: {
        plugins: [
            "org.apache.cordova.file@1.3.0"
        ]
    }
};
let doublePluginNoVersion = {
    cordova: {
        plugins: [
            "org.apache.cordova.file",
            "org.apache.cordova.device"
        ]
    }
};

describe("cordova-plugins", () => {
    describe("#no-plugins", () => {
        it("should result in an empty string", () => {
            var result = transformCordovaPlugins();
            should(result).be.equal(``);
        })
    });
    describe("#single-plugin-no-version", () => {
        it("should result in a single, well-formed XML tag with no version attribute", () => {
            var result = transformCordovaPlugins(PGBUILD_PLUGIN_TEMPLATE, singlePluginNoVersion);
            should(result).be.equal(`<gap:plugin name="${singlePluginNoVersion.cordova.plugins[0]}" src="plugins.cordova.io" />`);
        })
    });
    describe("#single-plugin-with-version", () => {
        it("should result in a single, well-formed XML tag with a version attribute", () => {
            var result = transformCordovaPlugins(PGBUILD_PLUGIN_TEMPLATE, singlePluginWithVersion);
            should(result).be.equal(`<gap:plugin name="org.apache.cordova.file" version="1.3.0" src="plugins.cordova.io" />`);
        })
    });
    describe("#double-plugin-no-version", () => {
        it("should result in two well-formed XML tags with no version attribute", () => {
            var result = transformCordovaPlugins(PGBUILD_PLUGIN_TEMPLATE, doublePluginNoVersion);
            should(result).be.equal(`<gap:plugin name="${doublePluginNoVersion.cordova.plugins[0]}" src="plugins.cordova.io" />
  <gap:plugin name="${doublePluginNoVersion.cordova.plugins[1]}" src="plugins.cordova.io" />`);
        })
    });
});

