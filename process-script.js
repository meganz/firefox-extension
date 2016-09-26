(function(global) {
'use strict';

const Cu = Components.utils;
const Cc = Components.classes;
const Cr = Components.results;
const Ci = Components.interfaces;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(global, 'console', 'resource://gre/modules/Console.jsm');

let ACCEPT = Ci.nsIContentPolicy.ACCEPT,
    REJECT = Ci.nsIContentPolicy.REJECT_REQUEST;

const gContentPolicy = Object.freeze({
    get classDescription() 'MEGA Content Policy',
    get classID() Components.ID("616C6532-1980-48D8-94CA-3288B6F199BF"),
    get contractID() "@mega.nz/content-policy;1",

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIFactory,
        Ci.nsIContentPolicy,Ci.nsISupportsWeakReference]),

    createInstance: function(outer, iid) {
        if(outer)
            throw Cr.NS_ERROR_NO_AGGREGATION;
        return this.QueryInterface(iid);
    },
    shouldProcess: function() {
        return ACCEPT;
    },
    shouldLoad: function(aType, aURI) {
        if (aURI.asciiHost === 'mega.nz' && String(aURI.path).split('#')[0] === '/') {
            try {
                switch (aType) {
                    case 6:
                    case 7:
                        aURI.spec = 'mega:bug1305316.nz' + (aURI.hasRef ? '#' + aURI.ref : '');
                        break;
                }
            }
            catch (e) {}
        }

        return ACCEPT;
    },

    queue: function(f) {
        Services.tm.currentThread.dispatch(f.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
    },

    startup: function() {
        try {
            let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
        } catch (e) {
            if(0xC1F30100 == e.result)
                return this.queue(this.startup);
            Cu.reportError(e);
        }

        let cm = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
        cm.addCategoryEntry('content-policy', this.classDescription, this.contractID, false, true);
    },

    shutdown: function() {
        try {
            let cm = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
            cm.deleteCategoryEntry('content-policy', this.classDescription, false);
        } catch(e) {
            Cu.reportError(e);
        }

        try {
            let r = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            this.queue(function() r.unregisterFactory(this.classID, this));
        } catch(e) {
            Cu.reportError(e);
        }
    },

    receiveMessage: function(ev) {

        if (ev.data === 'shutdown') {
            this.shutdown();
            global.removeMessageListener('mega:' + psid, this);
        }
    }
});

const psid = String(Components.stack.filename).split("=").pop();

global.addMessageListener('mega:' + psid, gContentPolicy);
gContentPolicy.startup();

})(this);
