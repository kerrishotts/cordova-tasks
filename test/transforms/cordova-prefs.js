import "core-js/shim";
import {transformCordovaPrefs} from "../../src/transforms/cordova-prefs";

let should = require("should");

let singlePref = {
    cordova: {
        preferences: {
            "orientation": "default"
        }
    }
};

let doublePref = {
    cordova: {
        preferences: {
            "orientation": "default",
            "fullscreen":  "false"
        }
    }
};


describe("cordova-prefs", () => {
    describe("#no-prefs", () => {
        it("should result in an empty string", () => {
            var result = transformCordovaPrefs();
            should(result).be.equal(``);
        })
    });
    describe("#single-pref", () => {
        it("should result in a single, well-formed XML tag", () => {
            var result = transformCordovaPrefs(singlePref);
            should(result).be.equal(`<preference name="${Object.keys(singlePref.cordova.preferences)[0]}" value="${singlePref.cordova.preferences.orientation}" />`);
        })
    });
    describe("#double-pref", () => {
        it("should result in a two well-formed XML tags", () => {
            var result = transformCordovaPrefs(doublePref);
            should(result).be.equal(
                `<preference name="${Object.keys(doublePref.cordova.preferences)[0]}" value="${doublePref.cordova.preferences.orientation}" />
  <preference name="${Object.keys(doublePref.cordova.preferences)[1]}" value="${doublePref.cordova.preferences.fullscreen}" />`);
        })
    })
});

