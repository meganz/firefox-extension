!function(e) {
    "use strict";
    const t = "chrome://mega/content/", n = t + "secure.html#", r = "navigator:browser", o = "forEach", s = Components.classes, a = Components.interfaces, c = Components.results, i = Components.manager, l = Components.utils, u = Object.create, f = a.nsIContentPolicy.ACCEPT, g = a.nsIContentPolicy.REJECT_TYPE, p = s["@mozilla.org/systemprincipal;1"].createInstance(a.nsIPrincipal), d = a.nsIMessageListenerManager && s["@mozilla.org/globalmessagemanager;1"] && s["@mozilla.org/globalmessagemanager;1"].getService(a.nsIMessageListenerManager), m = (Math.random() * Date.now()).toString(36), I = function(e, t) {
        var n = {};
        return Object.getOwnPropertyNames(t)[o](function(e) {
            n[e] = Object.getOwnPropertyDescriptor(t, e);
        }), Object.defineProperties(e, n);
    }, h = function(e) {
        return "function" == typeof e && (e.prototype = void 0), Object.freeze(e);
    }, b = h(function() {}), E = [], y = function(e) {
        for (var t = z.wm.getEnumerator(r); t.hasMoreElements(); ) e(t.getNext().QueryInterface(a.nsIDOMWindow));
    }, C = function(e, t) {
        return w(e, t, "gre");
    }, w = function(e, t, n) {
        t = t || {};
        try {
            return l.import("resource://" + n + "/modules/" + e + ".jsm", t), t[e.split("/").pop()] || t;
        } catch (e) {
            return null;
        }
    }, R = function(e) {
        l.reportError(e);
    }, v = function(e) {
        z.tm.currentThread.dispatch(e.bind(null), 0);
    }, P = function(e) {
        return "function" == typeof e.getBrowser ? e.getBrowser() : "gBrowser" in e ? e.gBrowser : e.BrowserApp.deck;
    }, O = function(e) {
        E.push(e);
    }, S = function(e) {
        if ("mega:" === e.data.substr(0, 5)) {
            var t = e.target;
            if (t.ownerGlobal) {
                var n = P(t.ownerGlobal);
                n && ("function" == typeof n.updateBrowserRemoteness && n.updateBrowserRemoteness(t, !1), 
                t.loadURIWithFlags(e.data, 2176, null, null, null));
            }
        }
    }, L = C("XPCOMUtils"), U = h({
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
            return "@mozilla.org/network/protocol;1?name=" + U.scheme;
        },
        get phClassID() {
            return Components.ID("{C69E8ACE-459A-45C1-85ED-CEC97CEB7DB4}");
        },
        get scheme() {
            return "mega";
        },
        defaultPort: -1,
        protocolFlags: a.nsIProtocolHandler.URI_NORELATIVE | a.nsIProtocolHandler.URI_NOAUTH | a.nsIProtocolHandler.URI_NON_PERSISTABLE | a.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE | a.nsIProtocolHandler.URI_FORBIDS_COOKIE_ACCESS | a.nsIProtocolHandler.URI_IS_UI_RESOURCE,
        newURI: function(e, t, n) {
            var r = s["@mozilla.org/network/simple-uri;1"].createInstance(a.nsIURI);
            return ~e.indexOf(":") ? r.spec = e : r.spec = this.scheme + ":" + e, r;
        },
        newChannel: function(e) {
            var t;
            !e.path || e.schemeIs(this.scheme) && !String(e.path).split("#").shift().replace(/\//g, "") ? t = n + e.ref : (t = z.io.newURI(n, null, null), 
            t = t.resolve(e.path));
            var r = z.io.newChannel(t, null, null);
            return r.owner = p, r.originalURI = e, r;
        },
        allowPort: function(e, t) {
            return !1;
        },
        QueryInterface: L.generateQI([ a.nsIContentPolicy, a.nsIFactory, a.nsIWebProgressListener, a.nsISupportsWeakReference, a.nsIProtocolHandler ]),
        createInstance: function(e, t) {
            if (e) throw c.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(t);
        },
        shouldProcess: function(e, t) {
            return f;
        },
        _hosts: {
            "mega.co.nz": 1,
            "mega.is": 1,
            "mega.io": 1,
            "mega.nz": 1
        },
        shouldLoad: function(e, t, r, o, s, a, c) {
            if (t.schemeIs("http") || t.schemeIs("https")) if (this._hosts[t.host] && "/" === t.path.split("#")[0]) try {
                switch (e) {
                  case 6:
                    if (~JSON.stringify(Components.stack).indexOf('"dch_handle"')) break;

                  case 7:
                    t.spec = this.scheme + ":" + (t.hasRef ? "#" + t.ref : "");
                    break;

                  case 3:
                  case 4:
                  case 11:
                    break;

                  default:
                    throw new Error("Resource blocked: " + t.spec);
                }
            } catch (e) {
                return R(e), g;
            } else if (~t.spec.indexOf(n)) return R(t.spec), g;
            return f;
        },
        onStateChange: b,
        onStatusChange: b,
        onProgressChange: b,
        onSecurityChange: b,
        onLocationChange: function(e, t, r) {
            try {
                if (_(r)) {
                    try {
                        t.cancel(c.NS_BINDING_REDIRECTED);
                    } catch (e) {}
                    e.DOMWindow.location = n + r.ref;
                }
            } catch (e) {
                R(e);
            }
        },
        handleEvent: function(e) {
            switch (e.type) {
              case "TabOpen":
                e.target.addProgressListener(U);
                break;

              case "TabClose":
                e.target.removeProgressListener(U);
            }
        },
        onCloseWindow: b,
        onWindowTitleChange: b
    }), _ = function(e) {
        return (e.schemeIs("http") || e.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(e.host);
    }, A = function(e) {
        return "a:" + m + ":" + e;
    }, D = function() {
        try {
            var e = i.QueryInterface(a.nsIComponentRegistrar);
            e.registerFactory(U.classID, U.classDescription, U.contractID, U);
        } catch (e) {
            if (3253928192 == e.result) return v(D);
            R(e);
        }
        z.cm.addCategoryEntry("content-policy", U.classDescription, U.contractID, !1, !0), 
        e.registerFactory(U.phClassID, U.scheme, U.phContractID, U);
        var n = a.nsITimer, r = s["@mozilla.org/timer;1"].createInstance(n);
        r.initWithCallback({
            notify: function() {
                k.findUpdates({
                    onUpdateAvailable: function(e, t) {
                        N.shouldAutoUpdate(e) && t.install();
                    }
                }, N.UPDATE_WHEN_USER_REQUESTED);
            }
        }, 36e5, n.TYPE_REPEATING_SLACK), d && (d.addMessageListener("MEGA:" + m + ":loadURI", S), 
        d.loadFrameScript(t + "e10s.js?rev=" + m, !0));
        const o = H && H.shouldBrowserBeRemote;
        "function" == typeof o && (H.shouldBrowserBeRemote = function(e) {
            var n = "" + e;
            return n.substr(0, t.length) == t || "mega:" == n.substr(0, 5) ? !1 : o.apply(H, arguments);
        });
        const c = H && H.canLoadURIInProcess;
        "function" == typeof c && (H.canLoadURIInProcess = function(e, n) {
            var r = "" + e;
            return r.substr(0, t.length) == t || "mega:" == r.substr(0, 5) ? n !== a.nsIXULRuntime.PROCESS_TYPE_CONTENT : c.apply(H, arguments);
        }), O(function() {
            r.cancel(), v(function() {
                e.unregisterFactory(U.phClassID, U), e.unregisterFactory(U.classID, U);
            }), z.cm.deleteCategoryEntry("content-policy", U.classDescription, !1), d && (d.broadcastAsyncMessage("MEGA:" + m + ":bcast", A("d")), 
            d.removeMessageListener("MEGA:" + m + ":loadURI", S), d.removeDelayedFrameScript(t + "e10s.js?rev=" + m)), 
            "function" == typeof o && (H.shouldBrowserBeRemote = o), "function" == typeof c && (H.canLoadURIInProcess = c);
        });
    }, B = function(t, n) {
        if (2 != n) {
            for (var r; r = E.pop(); ) try {
                r();
            } catch (e) {
                R(e);
            }
            z.wm.removeListener(U), y(j), z.io.getProtocolHandler("resource").QueryInterface(a.nsIResProtocolHandler).setSubstitution(k.tag, null);
            for (var o in e) try {
                delete e[o];
            } catch (e) {}
        }
    }, T = function(e, t) {
        N.getAddonByID(e.id, function(t) {
            var n = t.name.toLowerCase().replace(/[^\w]/g, "");
            k = I(u(t), h({
                tag: n,
                branch: z.prefs.getBranch("extensions." + n + ".")
            })), D(), z.io.getProtocolHandler("resource").QueryInterface(a.nsIResProtocolHandler).setSubstitution(k.tag, e.resourceURI), 
            y(M), z.wm.addListener(U), k.branch.setCharPref("version", k.version);
        });
    }, j = function(e) {
        var t = P(e);
        if (e.BrowserApp) {
            var n = e.BrowserApp;
            t.removeEventListener("TabOpen", U, !1), t.removeEventListener("TabClose", U, !1), 
            n.tabs[o](function(e) {
                e.browser.removeProgressListener(U);
            });
        } else d || t.removeProgressListener(U);
    }, M = function(e) {
        const t = e.document;
        if ("complete" !== t.readyState) return e.addEventListener("load", function t() {
            e.removeEventListener("load", t, !1), M(e);
        }, !1);
        if (r == t.documentElement.getAttribute("windowtype")) {
            var n = P(e);
            if (e.BrowserApp) {
                var s = e.BrowserApp;
                s.tabs[o](function(e) {
                    e.browser.addProgressListener(U);
                }), n.addEventListener("TabOpen", U, !1), n.addEventListener("TabClose", U, !1);
            } else d || n.addProgressListener(U);
        }
    }, N = C("AddonManager"), H = w("E10SUtils", {}, ""), z = I(u(C("Services")), h({
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
