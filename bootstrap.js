!function(e) {
    "use strict";
    const t = "chrome://mega/content/", n = t + "secure.html#", r = "navigator:browser", o = "forEach", s = Components.classes, a = Components.interfaces, c = Components.results, i = Components.manager, l = Components.utils, u = Object.create, f = a.nsIContentPolicy.ACCEPT, g = a.nsIContentPolicy.REJECT_TYPE, d = s["@mozilla.org/systemprincipal;1"].createInstance(a.nsIPrincipal), p = a.nsIMessageListenerManager && s["@mozilla.org/globalmessagemanager;1"] && s["@mozilla.org/globalmessagemanager;1"].getService(a.nsIMessageListenerManager), m = (Math.random() * Date.now()).toString(36), I = function(e, t) {
        var n = {};
        return Object.getOwnPropertyNames(t)[o](function(e) {
            n[e] = Object.getOwnPropertyDescriptor(t, e);
        }), Object.defineProperties(e, n);
    }, h = function(e) {
        return "function" == typeof e && (e.prototype = void 0), Object.freeze(e);
    }, b = h(function() {}), E = [], C = function(e) {
        for (var t = z.wm.getEnumerator(r); t.hasMoreElements(); ) e(t.getNext().QueryInterface(a.nsIDOMWindow));
    }, y = function(e, t) {
        return w(e, t, "gre");
    }, w = function(e, t, n) {
        t = t || {};
        try {
            return l.import("resource://" + n + "/modules/" + e + ".jsm", t), t[e.split("/").pop()] || t;
        } catch (e) {
            return null;
        }
    }, v = function(e) {
        l.reportError(e);
    }, R = function(e) {
        z.tm.currentThread.dispatch(e.bind(null), 0);
    }, O = function(e) {
        return "function" == typeof e.getBrowser ? e.getBrowser() : "gBrowser" in e ? e.gBrowser : e.BrowserApp.deck;
    }, P = function(e) {
        E.push(e);
    }, S = function(e) {
        if ("mega:" === e.data.substr(0, 5)) {
            var t = e.target;
            if (t.ownerGlobal) {
                var n = O(t.ownerGlobal);
                n && ("function" == typeof n.updateBrowserRemoteness && n.updateBrowserRemoteness(t, !1), 
                t.loadURIWithFlags(e.data, 2176, null, null, null));
            }
        }
    }, A = y("XPCOMUtils"), D = h({
        onOpenWindow: function(e) {
            M(e.QueryInterface(a.nsIInterfaceRequestor).getInterface(a.nsIDOMWindow));
        },
        get classDescription() {
            return k.name;
        },
        get classID() {
            return Components.ID("{64696567-6f63-7220-6869-7265646a6f62}");
        },
        get contractID() {
            return "@mega.co.nz/content-policy;1";
        },
        get phContractID() {
            return "@mozilla.org/network/protocol;1?name=" + D.scheme;
        },
        get phClassID() {
            return Components.ID("{C69E8ACE-459A-45C1-85ED-CEC97CEB7DB4}");
        },
        get scheme() {
            return "mega";
        },
        defaultPort: -1,
        protocolFlags: a.nsIProtocolHandler.URI_NORELATIVE | a.nsIProtocolHandler.URI_NOAUTH | a.nsIProtocolHandler.URI_NON_PERSISTABLE | a.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE | a.nsIProtocolHandler.URI_FORBIDS_COOKIE_ACCESS | a.nsIProtocolHandler.URI_IS_UI_RESOURCE,
        newURI: function(e) {
            var t = s["@mozilla.org/network/simple-uri;1"].createInstance(a.nsIURI);
            return t.spec = ~e.indexOf(":") ? e : this.scheme + ":" + e, t;
        },
        newChannel: function(e) {
            var t;
            !e.path || e.schemeIs(this.scheme) && !e.path.replace("/", "", "g") ? t = n + e.ref : (t = z.io.newURI(n, null, null), 
            t = t.resolve(e.path));
            var r = z.io.newChannel(t, null, null);
            return r.owner = d, r.originalURI = e, r;
        },
        allowPort: function() {
            return !1;
        },
        QueryInterface: A.generateQI([ a.nsIContentPolicy, a.nsIFactory, a.nsIWebProgressListener, a.nsISupportsWeakReference, a.nsIProtocolHandler ]),
        createInstance: function(e, t) {
            if (e) throw c.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(t);
        },
        shouldProcess: function() {
            return f;
        },
        _hosts: {
            "mega.co.nz": 1,
            "mega.is": 1,
            "mega.io": 1,
            "mega.nz": 1
        },
        shouldLoad: function(e, t) {
            if (t.schemeIs("http") || t.schemeIs("https")) if (this._hosts[t.host] && "/" === t.path.split("#")[0]) try {
                switch (e) {
                  case 6:
                    if (~JSON.stringify(Components.stack).indexOf('"dch_handle"')) break;

                  case 7:
                    //t.spec = this.scheme + ":" + (t.hasRef ? "#" + t.ref : "");
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
                return v(e), g;
            } else if (~t.spec.indexOf(n)) return v(t.spec), g;
            return f;
        },
        onStateChange: b,
        onStatusChange: b,
        onProgressChange: b,
        onSecurityChange: b,
        onLocationChange: function(e, t, r) {
            try {
                if (L(r)) {
                    try {
                        t.cancel(c.NS_BINDING_REDIRECTED);
                    } catch (e) {}
                    e.DOMWindow.location = n + r.ref;
                }
            } catch (e) {
                v(e);
            }
        },
        handleEvent: function(e) {
            switch (e.type) {
              case "TabOpen":
                e.target.addProgressListener(D);
                break;

              case "TabClose":
                e.target.removeProgressListener(D);
            }
        },
        onCloseWindow: b,
        onWindowTitleChange: b
    }), L = function(e) {
        return (e.schemeIs("http") || e.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(e.host);
    }, _ = function(e) {
        return "a:" + m + ":" + e;
    }, U = function() {
        try {
            var e = i.QueryInterface(a.nsIComponentRegistrar);
            e.registerFactory(D.classID, D.classDescription, D.contractID, D);
        } catch (e) {
            if (3253928192 == e.result) return R(U);
            v(e);
        }
        z.cm.addCategoryEntry("content-policy", D.classDescription, D.contractID, !1, !0), 
        e.registerFactory(D.phClassID, D.scheme, D.phContractID, D);
        var n = a.nsITimer, r = s["@mozilla.org/timer;1"].createInstance(n);
        r.initWithCallback({
            notify: function() {
                k.findUpdates({
                    onUpdateAvailable: function(e, t) {
                        N.shouldAutoUpdate(e) && t.install();
                    }
                }, N.UPDATE_WHEN_USER_REQUESTED);
            }
        }, 36e5, n.TYPE_REPEATING_SLACK), p && (p.addMessageListener("MEGA:" + m + ":loadURI", S), 
        p.loadFrameScript(t + "e10s.js?rev=" + m, !0));
        const o = H && H.shouldBrowserBeRemote;
        "function" == typeof o && (H.shouldBrowserBeRemote = function(e) {
            var n = "" + e;
            return n.substr(0, t.length) == t || "mega:" == n.substr(0, 5) ? !1 : o.apply(H, arguments);
        }), P(function() {
            r.cancel(), R(function() {
                e.unregisterFactory(D.phClassID, D), e.unregisterFactory(D.classID, D);
            }), z.cm.deleteCategoryEntry("content-policy", D.classDescription, !1), p && (p.broadcastAsyncMessage("MEGA:" + m + ":bcast", _("d")), 
            p.removeMessageListener("MEGA:" + m + ":loadURI", S), p.removeDelayedFrameScript(t + "e10s.js?rev=" + m)), 
            "function" == typeof o && (H.shouldBrowserBeRemote = o);
        });
    }, B = function(t, n) {
        if (2 != n) {
            for (var r; r = E.pop(); ) try {
                r();
            } catch (e) {
                v(e);
            }
            z.wm.removeListener(D), C(j), z.io.getProtocolHandler("resource").QueryInterface(a.nsIResProtocolHandler).setSubstitution(k.tag, null);
            for (var o in e) try {
                delete e[o];
            } catch (e) {}
        }
    }, T = function(e) {
        N.getAddonByID(e.id, function(t) {
            var n = t.name.toLowerCase().replace(/[^\w]/g, "");
            k = I(u(t), h({
                tag: n,
                branch: z.prefs.getBranch("extensions." + n + ".")
            })), U(), z.io.getProtocolHandler("resource").QueryInterface(a.nsIResProtocolHandler).setSubstitution(k.tag, e.resourceURI), 
            C(M), z.wm.addListener(D), k.branch.setCharPref("version", k.version);
        });
    }, j = function(e) {
        var t = O(e);
        if (e.BrowserApp) {
            var n = e.BrowserApp;
            t.removeEventListener("TabOpen", D, !1), t.removeEventListener("TabClose", D, !1), 
            n.tabs[o](function(e) {
                e.browser.removeProgressListener(D);
            });
        } else p || t.removeProgressListener(D);
    }, M = function(e) {
        const t = e.document;
        if ("complete" !== t.readyState) return e.addEventListener("load", function t() {
            e.removeEventListener("load", t, !1), M(e);
        }, !1);
        if (r == t.documentElement.getAttribute("windowtype")) {
            var n = O(e);
            if (e.BrowserApp) {
                var s = e.BrowserApp;
                s.tabs[o](function(e) {
                    e.browser.addProgressListener(D);
                }), n.addEventListener("TabOpen", D, !1), n.addEventListener("TabClose", D, !1);
            } else p || n.addProgressListener(D);
        }
    }, N = y("AddonManager"), H = w("E10SUtils", {}, ""), z = I(u(y("Services")), h({
        cm: s["@mozilla.org/categorymanager;1"].getService(a.nsICategoryManager)
    }));
    var k = {};
    I(e, {
        startup: h(T.bind(null)),
        shutdown: h(B.bind(null)),
        install: b,
        uninstall: b
    });
}(this);
