
(function(Gs) {
	"use strict";

	const megacuri = 'chrome://mega/content/secure.html#';
	const wtype = 'navigator:browser', F = 'forEach';

	const Cc = Components.classes;
	const Ci = Components.interfaces;
	const Cr = Components.results;
	const Cm = Components.manager;
	const Cu = Components.utils;

	const create = Object.create;
	const ACCEPT = Ci.nsIContentPolicy.ACCEPT;
	const REJECT = Ci.nsIContentPolicy.REJECT_TYPE;

	const expand = function(aDstObj, aSrcObj) {
		var tmp = {};
		Object.getOwnPropertyNames(aSrcObj)[F](function(name) {
			tmp[name] = Object.getOwnPropertyDescriptor(aSrcObj, name);
		});
		return Object.defineProperties(aDstObj, tmp);
	};
	const freeze = function(obj) {
		if(typeof obj === 'function')
			obj.prototype = undefined;
		return Object.freeze(obj);
	};
	const Vf = freeze(function() {}), SQ = [];
	const wmf = function(callback) {
		var windows = Services.wm.getEnumerator(wtype);
		while(windows.hasMoreElements())
			callback(windows.getNext()
				.QueryInterface(Ci.nsIDOMWindow));
	};
	const loadSubScript = function(aFile,aScope) {
		Services.scriptloader.loadSubScript(aFile,aScope||Gs);
	};
	const Import = function(aFile,aScope) {
		aScope = aScope || {};
		Cu.import("resource://gre/modules/"+ aFile +".jsm", aScope);
		return aScope[aFile.split("/").pop()] || aScope;
	};
	const reportError = function(ex) {
		Cu.reportError(ex);
		LOG(ex.message || ex);
	};
	const later = function(f) {
		Services.tm.currentThread.dispatch(f.bind(null), 0);
	};
	const delay = function(func,ms) {
		var i = Ci.nsITimer, t = Cc["@mozilla.org/timer;1"].createInstance(i);
		t.initWithCallback({notify:func.bind(null)},ms||30,i.TYPE_ONE_SHOT);
		return t;
	};
	const getBrowser = function(aWindow) {
		if(typeof aWindow.getBrowser === 'function')
			return aWindow.getBrowser();

		if("gBrowser" in aWindow)
			return aWindow.gBrowser;

		return aWindow.BrowserApp.deck;
	};
	const shutdown = function(func) {
		SQ.push(func);
	};
	const XPCOMUtils = Import("XPCOMUtils");
	const i$ = freeze({
		onOpenWindow: function(aWindow) {
			loadIntoWindow(aWindow
				.QueryInterface(Ci.nsIInterfaceRequestor)
				.getInterface(Ci.nsIDOMWindow));
		},
		get classDescription() {
			return addon.name;
		},
		get classID() {
			return Components.ID("{64696567-6f63-7220-6869-7265646a6f62}");
		},
		get contractID() {
			return "@mega.co.nz/content-policy;1";
		},
		QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy,Ci.nsIFactory,
			Ci.nsIWebProgressListener,Ci.nsISupportsWeakReference]),
		createInstance: function(outer, iid) {
			if(outer)
				throw Cr.NS_ERROR_NO_AGGREGATION;
			return this.QueryInterface(iid);
		},
		shouldProcess: function() {
			return ACCEPT;
		},
		shouldLoad: function(x,y,z,n,m,t,p) {
			if(isMEGA(y)) try {
				switch(x) {
					case 6:
					case 7:
						y.spec = megacuri + y.ref;
						break;
					case 3:
					case 4:
					case 11:
						break;
					default:
						throw new Error('Resource not allowed: ' + y.spec);
				}
			} catch(e) {
				reportError(e);
				return REJECT;
			}
			return ACCEPT;
		},
		onStateChange   : Vf,
		onStatusChange  : Vf,
		onProgressChange: Vf,
		onSecurityChange: Vf,
		onLocationChange: function(w,r,l) {
			try {
				if(isMEGA(l)) {
					try {
						r.cancel(Cr.NS_BINDING_REDIRECTED);
					} catch(e) {}
					w.DOMWindow.location = megacuri + l.ref;
				}
			} catch(e) {
				reportError(e);
			}
		},
		handleEvent: function(ev) {
			switch(ev.type) {
				case 'TabOpen':
					ev.target.addProgressListener(i$);
					break;
				case 'TabClose':
					ev.target.removeProgressListener(i$);
				default:
					break;
			}
		},
		onCloseWindow:Vf,
		onWindowTitleChange:Vf
	});
	const isMEGA = function(y) {
	DBG('isMEGA', y.spec, y);
		return (y.schemeIs("http") || y.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(y.host);
	};
	const register = function() {
		try {
			var registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
			registrar.registerFactory(i$.classID, i$.classDescription, i$.contractID, i$);
		} catch (e) {
			if(0xC1F30100 == e.result)
				return later(register);
			reportError(e);
		}

		Services.cm.addCategoryEntry('content-policy', i$.classDescription, i$.contractID, false, true);

		var i = Ci.nsITimer, uCheckTimer = Cc["@mozilla.org/timer;1"].createInstance(i);
		uCheckTimer.initWithCallback({
			notify: function() {
				addon.findUpdates({
					onUpdateAvailable: function(addon, installer) {
						if(AddonManager.shouldAutoUpdate(addon))
							installer.install();
					}
				}, AddonManager.UPDATE_WHEN_USER_REQUESTED);
			}
		},3600000,i.TYPE_REPEATING_SLACK);

		shutdown(function() {
			Services.cm.deleteCategoryEntry('content-policy', i$.classDescription, false);

			later(function() {
				registrar.unregisterFactory(i$.classID, i$);
			});

			uCheckTimer.cancel();
		});
	};
	const api_shutdown = function(aData,aReason) {
		if(2 == aReason)
			return;

		for(var f ; (f = SQ.pop()) ; f());

		Services.wm.removeListener(i$);
		wmf(unloadFromWindow);

		Services.io.getProtocolHandler("resource")
			.QueryInterface(Ci.nsIResProtocolHandler)
			.setSubstitution(addon.tag,null);

		for(var m in Gs) try { delete Gs[m]; } catch(e) {}
	};
	const api_startup = function(aData) {
		AddonManager.getAddonByID(aData.id,function(aAddon) {
			var tag = aAddon.name.toLowerCase().replace(/[^\w]/g,'');

			addon = expand(create(aAddon), freeze({ tag : tag,
				branch : Services.prefs.getBranch('extensions.'+tag+'.'),
			}));

			DBG = LOG;//addon.version.replace(/[\d.]/g,'') == 'a' ? LOG:Vf;
			DBG(Gs, addon);

			register();

			Services.io.getProtocolHandler("resource")
				.QueryInterface(Ci.nsIResProtocolHandler)
				.setSubstitution(addon.tag,aData.resourceURI);

			wmf(loadIntoWindow);
			Services.wm.addListener(i$);

			addon.branch.setCharPref('version', addon.version);
		});
	};
	const unloadFromWindow = function(window) {
		var browser = getBrowser(window);
		if(window.BrowserApp) {
			var BrowserApp = window.BrowserApp;
			browser.removeEventListener("TabOpen", i$, false);
			browser.removeEventListener("TabClose", i$, false);
			BrowserApp.tabs[F](function(tab) {
				tab.browser.removeProgressListener(i$);
			});
		} else {
			browser.removeProgressListener(i$);
		}
	};
	const loadIntoWindow = function(window) {
		const document = window.document;

		if(document.readyState !== "complete") {
			return window.addEventListener("load",function l(){
				window.removeEventListener("load", l, false);
				loadIntoWindow(window);
			}, false);
		}

		DBG('loadIntoWindow', document.documentElement.getAttribute("windowtype"), document.location.href);
		if(wtype!=document.documentElement.getAttribute("windowtype"))
			return;

		var browser = getBrowser(window);
		if(window.BrowserApp) {
			var BrowserApp = window.BrowserApp;
			BrowserApp.tabs[F](function(tab) {
				tab.browser.addProgressListener(i$);
			});
			browser.addEventListener("TabOpen", i$, false);
			browser.addEventListener("TabClose", i$, false);
		} else {
			browser.addProgressListener(i$);
		}
	};
	const AddonManager = Import("AddonManager");
	var Services = create(Import("Services")), DBG, console, addon = {};
	var lazy = XPCOMUtils.defineLazyServiceGetter.bind(XPCOMUtils, Services);
	lazy("cm", "@mozilla.org/categorymanager;1", "nsICategoryManager");
	freeze(Services);

	/**/
	try {
		console = Import("devtools/Console").console;
	} catch(e) {
		console = { log : function(n,m) { Services.console.logStringMessage(m||n)}};
	}
	const LOG = function() {
		[].unshift.call(arguments,addon.name);
		console.log.apply(console, arguments);
		DBG == Vf || console.trace();
	}; /**/

	expand(Gs, {
		startup   : freeze(api_startup.bind(null)),
		shutdown  : freeze(api_shutdown.bind(null)),
		install   : Vf,
		uninstall : Vf
	});
})(this);
