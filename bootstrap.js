!function(e) {
    "use strict";
    const t = "chrome://mega/content/secure.html#", n = "navigator:browser", r = "forEach", o = Components.classes, s = Components.interfaces, c = Components.results, a = Components.manager, i = Components.utils, u = Object.create, l = s.nsIContentPolicy.ACCEPT, f = s.nsIContentPolicy.REJECT_TYPE, d = function(e, t) {
        var n = {};
        return Object.getOwnPropertyNames(t)[r](function(e) {
            n[e] = Object.getOwnPropertyDescriptor(t, e);
        }), Object.defineProperties(e, n);
    }, p = function(e) {
        return "function" == typeof e && (e.prototype = void 0), Object.freeze(e);
    }, g = p(function() {}), m = [], h = function(e) {
        for (var t = S.wm.getEnumerator(n); t.hasMoreElements(); ) e(t.getNext().QueryInterface(s.nsIDOMWindow));
    }, I = function(e, t) {
        return t = t || {}, i.import("resource://gre/modules/" + e + ".jsm", t), t[e.split("/").pop()] || t;
    }, y = function(e) {
        i.reportError(e);
    }, b = function(e) {
        S.tm.currentThread.dispatch(e.bind(null), 0);
    }, w = function(e) {
        return "function" == typeof e.getBrowser ? e.getBrowser() : "gBrowser" in e ? e.gBrowser : e.BrowserApp.deck;
    }, v = function(e) {
        m.push(e);
    }, E = I("XPCOMUtils"), C = p({
        onOpenWindow: function(e) {
            R(e.QueryInterface(s.nsIInterfaceRequestor).getInterface(s.nsIDOMWindow));
        },
        get classDescription() {
            return j.name;
        },
        get classID() {
            return Components.ID("{64696567-6f63-7220-6869-7265646a6f62}");
        },
        get contractID() {
            return "@mega.co.nz/content-policy;1";
        },
        QueryInterface: E.generateQI([ s.nsIContentPolicy, s.nsIFactory, s.nsIWebProgressListener, s.nsISupportsWeakReference ]),
        createInstance: function(e, t) {
            if (e) throw c.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(t);
        },
        shouldProcess: function() {
            return l;
        },
        shouldLoad: function(e, n) {
            if (P(n)) try {
                switch (e) {
                  case 6:
                    if(~JSON.stringify(Components.stack).indexOf('"dch_handle"')) break;
                  case 7:
                    n.spec = t + n.ref;
                    break;

                  case 3:
                  case 4:
                  case 11:
                    break;

                  default:
                    throw new Error("Resource not allowed: " + n.spec);
                }
            } catch (e) {
                return y(e), f;
            }
            return l;
        },
        onStateChange: g,
        onStatusChange: g,
        onProgressChange: g,
        onSecurityChange: g,
        onLocationChange: function(e, n, r) {
            try {
                if (P(r)) {
                    try {
                        n.cancel(c.NS_BINDING_REDIRECTED);
                    } catch (e) {}
                    e.DOMWindow.location = t + r.ref;
                }
            } catch (e) {
                y(e);
            }
        },
        handleEvent: function(e) {
            switch (e.type) {
              case "TabOpen":
                e.target.addProgressListener(C);
                break;

              case "TabClose":
                e.target.removeProgressListener(C);
            }
        },
        onCloseWindow: g,
        onWindowTitleChange: g
    }), P = function(e) {
        return (e.schemeIs("http") || e.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(e.host);
    }, O = function() {
        try {
            var e = a.QueryInterface(s.nsIComponentRegistrar);
            e.registerFactory(C.classID, C.classDescription, C.contractID, C);
        } catch (e) {
            if (3253928192 == e.result) return b(O);
            y(e);
        }
        S.cm.addCategoryEntry("content-policy", C.classDescription, C.contractID, !1, !0);
        var t = s.nsITimer, n = o["@mozilla.org/timer;1"].createInstance(t);
        n.initWithCallback({
            notify: function() {
                j.findUpdates({
                    onUpdateAvailable: function(e, t) {
                        A.shouldAutoUpdate(e) && t.install();
                    }
                }, A.UPDATE_WHEN_USER_REQUESTED);
            }
        }, 36e5, t.TYPE_REPEATING_SLACK), v(function() {
            n.cancel(), b(function() {
                e.unregisterFactory(C.classID, C);
            }), S.cm.deleteCategoryEntry("content-policy", C.classDescription, !1);
        });
    }, L = function(t, n) {
        if (2 != n) {
            for (var r; r = m.pop(); ) try {
                r();
            } catch (e) {
                y(e);
            }
            S.wm.removeListener(C), h(T), S.io.getProtocolHandler("resource").QueryInterface(s.nsIResProtocolHandler).setSubstitution(j.tag, null);
            for (var o in e) try {
                delete e[o];
            } catch (e) {}
        }
    }, D = function(e) {
        A.getAddonByID(e.id, function(t) {
            var n = t.name.toLowerCase().replace(/[^\w]/g, "");
            j = d(u(t), p({
                tag: n,
                branch: S.prefs.getBranch("extensions." + n + ".")
            })), O(), S.io.getProtocolHandler("resource").QueryInterface(s.nsIResProtocolHandler).setSubstitution(j.tag, e.resourceURI), 
            h(R), S.wm.addListener(C), j.branch.setCharPref("version", j.version);
        });
    }, T = function(e) {
        var t = w(e);
        if (e.BrowserApp) {
            var n = e.BrowserApp;
            t.removeEventListener("TabOpen", C, !1), t.removeEventListener("TabClose", C, !1), 
            n.tabs[r](function(e) {
                e.browser.removeProgressListener(C);
            });
        } else t.removeProgressListener(C);
    }, R = function(e) {
        const t = e.document;
        if ("complete" !== t.readyState) return e.addEventListener("load", function t() {
            e.removeEventListener("load", t, !1), R(e);
        }, !1);
        if (n == t.documentElement.getAttribute("windowtype")) {
            var o = w(e);
            if (e.BrowserApp) {
                var s = e.BrowserApp;
                s.tabs[r](function(e) {
                    e.browser.addProgressListener(C);
                }), o.addEventListener("TabOpen", C, !1), o.addEventListener("TabClose", C, !1);
            } else o.addProgressListener(C);
        }
    }, A = I("AddonManager"), S = d(u(I("Services")), p({
        cm: o["@mozilla.org/categorymanager;1"].getService(s.nsICategoryManager)
    }));
    var j = {};
    d(e, {
        startup: p(D.bind(null)),
        shutdown: p(L.bind(null)),
        install: g,
        uninstall: g
    });
}(this);
