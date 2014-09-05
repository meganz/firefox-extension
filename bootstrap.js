!function(e) {
    "use strict";
    const n = "chrome://mega/content/secure.html#", t = "navigator:browser", r = "forEach", o = Components.classes, s = Components.interfaces, a = Components.results, c = Components.manager, i = Components.utils, l = Object.create, u = s.nsIContentPolicy.ACCEPT, f = s.nsIContentPolicy.REJECT_TYPE, g = o["@mozilla.org/systemprincipal;1"].createInstance(s.nsIPrincipal), d = s.nsIMessageListenerManager && o["@mozilla.org/globalmessagemanager;1"] && o["@mozilla.org/globalmessagemanager;1"].getService(s.nsIMessageListenerManager), p = function(e, n) {
        var t = {};
        return Object.getOwnPropertyNames(n)[r](function(e) {
            t[e] = Object.getOwnPropertyDescriptor(n, e);
        }), Object.defineProperties(e, t);
    }, I = function(e) {
        return "function" == typeof e && (e.prototype = void 0), Object.freeze(e);
    }, m = I(function() {}), h = [], C = function(e) {
        for (var n = j.wm.getEnumerator(t); n.hasMoreElements(); ) e(n.getNext().QueryInterface(s.nsIDOMWindow));
    }, E = function(e, n) {
        return n = n || {}, i.import("resource://gre/modules/" + e + ".jsm", n), n[e.split("/").pop()] || n;
    }, b = function(e) {
        i.reportError(e);
    }, w = function(e) {
        j.tm.currentThread.dispatch(e.bind(null), 0);
    }, y = function(e) {
        return "function" == typeof e.getBrowser ? e.getBrowser() : "gBrowser" in e ? e.gBrowser : e.BrowserApp.deck;
    }, v = function(e) {
        h.push(e);
    }, R = function(e) {
        if ("mega:" === e.data.substr(0, 5)) {
            var n = e.target;
            if (n.ownerGlobal) {
                var t = y(n.ownerGlobal);
                t && (t.updateBrowserRemoteness(n, !1), n.loadURIWithFlags(e.data, 2176, null, null, null));
            }
        }
    }, O = E("XPCOMUtils"), P = I({
        onOpenWindow: function(e) {
            _(e.QueryInterface(s.nsIInterfaceRequestor).getInterface(s.nsIDOMWindow));
        },
        get classDescription() {
            return B.name;
        },
        get classID() {
            return Components.ID("{64696567-6f63-7220-6869-7265646a6f62}");
        },
        get contractID() {
            return "@mega.co.nz/content-policy;1";
        },
        get phContractID() {
            return "@mozilla.org/network/protocol;1?name=" + P.scheme;
        },
        get phClassID() {
            return Components.ID("{C69E8ACE-459A-45C1-85ED-CEC97CEB7DB4}");
        },
        get scheme() {
            return "mega";
        },
        defaultPort: -1,
        protocolFlags: s.nsIProtocolHandler.URI_NORELATIVE | s.nsIProtocolHandler.URI_NOAUTH | s.nsIProtocolHandler.URI_NON_PERSISTABLE | s.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE | s.nsIProtocolHandler.URI_FORBIDS_COOKIE_ACCESS | s.nsIProtocolHandler.URI_IS_UI_RESOURCE,
        newURI: function(e) {
            var n = o["@mozilla.org/network/simple-uri;1"].createInstance(s.nsIURI);
            return n.spec = ~e.indexOf(":") ? e : this.scheme + ":" + e, n;
        },
        newChannel: function(e) {
            var t;
            e.path ? (t = j.io.newURI(n, null, null), t = t.resolve(e.path)) : t = n + e.ref;
            var r = j.io.newChannel(t, null, null);
            return r.owner = g, r.originalURI = e, r;
        },
        allowPort: function() {
            return !1;
        },
        QueryInterface: O.generateQI([ s.nsIContentPolicy, s.nsIFactory, s.nsIWebProgressListener, s.nsISupportsWeakReference, s.nsIProtocolHandler ]),
        createInstance: function(e, n) {
            if (e) throw a.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(n);
        },
        shouldProcess: function() {
            return u;
        },
        shouldLoad: function(e, t) {
            if (t.schemeIs("http") || t.schemeIs("https")) {
                if ("mega.co.nz" === t.host && "/" === t.path.split("#")[0]) try {
                    switch (e) {
                      case 6:
                        if (~JSON.stringify(Components.stack).indexOf('"dch_handle"')) break;

                      case 7:
                        t.spec = n + t.ref;
                        break;

                      case 3:
                      case 4:
                      case 11:
                        break;

                      default:
                        throw new Error("Resource blocked: " + t.spec);
                    }
                } catch (e) {
                    return b(e), f;
                }
                else if (~t.spec.indexOf(n)) return b(t.spec), f;
            }
            return u;
        },
        onStateChange: m,
        onStatusChange: m,
        onProgressChange: m,
        onSecurityChange: m,
        onLocationChange: function(e, t, r) {
            try {
                if (L(r)) {
                    try {
                        t.cancel(a.NS_BINDING_REDIRECTED);
                    } catch (e) {}
                    e.DOMWindow.location = n + r.ref;
                }
            } catch (e) {
                b(e);
            }
        },
        handleEvent: function(e) {
            switch (e.type) {
              case "TabOpen":
                e.target.addProgressListener(P);
                break;

              case "TabClose":
                e.target.removeProgressListener(P);
            }
        },
        onCloseWindow: m,
        onWindowTitleChange: m
    }), L = function(e) {
        return (e.schemeIs("http") || e.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(e.host);
    }, S = function() {
        try {
            var e = c.QueryInterface(s.nsIComponentRegistrar);
            e.registerFactory(P.classID, P.classDescription, P.contractID, P);
        } catch (e) {
            if (3253928192 == e.result) return w(S);
            b(e);
        }
        j.cm.addCategoryEntry("content-policy", P.classDescription, P.contractID, !1, !0), 
        e.registerFactory(P.phClassID, P.scheme, P.phContractID, P);
        var n = s.nsITimer, t = o["@mozilla.org/timer;1"].createInstance(n);
        t.initWithCallback({
            notify: function() {
                B.findUpdates({
                    onUpdateAvailable: function(e, n) {
                        T.shouldAutoUpdate(e) && n.install();
                    }
                }, T.UPDATE_WHEN_USER_REQUESTED);
            }
        }, 36e5, n.TYPE_REPEATING_SLACK), d && (d.addMessageListener("MEGA::loadURI", R), 
        d.loadFrameScript("chrome://mega/content/e10s.js", !0)), v(function() {
            t.cancel(), w(function() {
                e.unregisterFactory(P.phClassID, P), e.unregisterFactory(P.classID, P);
            }), j.cm.deleteCategoryEntry("content-policy", P.classDescription, !1), d && (d.removeMessageListener("MEGA::loadURI", R), 
            d.removeDelayedFrameScript("chrome://mega/content/e10s.js"));
        });
    }, D = function(n, t) {
        if (2 != t) {
            for (var r; r = h.pop(); ) try {
                r();
            } catch (e) {
                b(e);
            }
            j.wm.removeListener(P), C(U), j.io.getProtocolHandler("resource").QueryInterface(s.nsIResProtocolHandler).setSubstitution(B.tag, null);
            for (var o in e) try {
                delete e[o];
            } catch (e) {}
        }
    }, A = function(e) {
        T.getAddonByID(e.id, function(n) {
            var t = n.name.toLowerCase().replace(/[^\w]/g, "");
            B = p(l(n), I({
                tag: t,
                branch: j.prefs.getBranch("extensions." + t + ".")
            })), S(), j.io.getProtocolHandler("resource").QueryInterface(s.nsIResProtocolHandler).setSubstitution(B.tag, e.resourceURI), 
            C(_), j.wm.addListener(P), B.branch.setCharPref("version", B.version);
        });
    }, U = function(e) {
        var n = y(e);
        if (e.BrowserApp) {
            var t = e.BrowserApp;
            n.removeEventListener("TabOpen", P, !1), n.removeEventListener("TabClose", P, !1), 
            t.tabs[r](function(e) {
                e.browser.removeProgressListener(P);
            });
        } else d || n.removeProgressListener(P);
    }, _ = function(e) {
        const n = e.document;
        if ("complete" !== n.readyState) return e.addEventListener("load", function n() {
            e.removeEventListener("load", n, !1), _(e);
        }, !1);
        if (t == n.documentElement.getAttribute("windowtype")) {
            var o = y(e);
            if (e.BrowserApp) {
                var s = e.BrowserApp;
                s.tabs[r](function(e) {
                    e.browser.addProgressListener(P);
                }), o.addEventListener("TabOpen", P, !1), o.addEventListener("TabClose", P, !1);
            } else d || o.addProgressListener(P);
        }
    }, T = E("AddonManager"), j = p(l(E("Services")), I({
        cm: o["@mozilla.org/categorymanager;1"].getService(s.nsICategoryManager)
    }));
    var B = {};
    p(e, {
        startup: I(A.bind(null)),
        shutdown: I(D.bind(null)),
        install: m,
        uninstall: m
    });
}(this);
