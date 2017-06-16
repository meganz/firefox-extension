
(function(Gs) {
	"use strict";

	const chromens = 'chrome://mega/content/';
	const megacuri = chromens +'secure.html#';
	const wtype = 'navigator:browser', F = 'forEach';

	const Cc = Components.classes;
	const Ci = Components.interfaces;
	const Cr = Components.results;
	const Cm = Components.manager;
	const Cu = Components.utils;

	const create = Object.create;
	const ACCEPT = Ci.nsIContentPolicy.ACCEPT;
	const REJECT = Ci.nsIContentPolicy.REJECT_TYPE;

	const mSystemPrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal);
	const globalMM = Ci.nsIMessageListenerManager && Cc["@mozilla.org/globalmessagemanager;1"]
		&& Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);

	const mRID = (Math.random()*Date.now()).toString(36);

	const extend = function(aDstObj, aSrcObj) {
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
		return Import2(aFile,aScope,'gre');
	};
	const Import2 = function(aFile,aScope,aPfx) {
		aScope = aScope || {};
		try {
			Cu.import("resource://"+aPfx+"/modules/"+ aFile +".jsm", aScope);
			return aScope[aFile.split("/").pop()] || aScope;
		} catch(e) {
			return null;
		}
	};
	const reportError = function(ex) {
		Cu.reportError(ex);
		// LOG(ex.message || ex);
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

		return aWindow.BrowserApp && aWindow.BrowserApp.deck;
	};
	const shutdown = function(func) {
		SQ.push(func);
	};
	const globalMMListener = function(msg) {
		// LOG(msg.name + ' ~~ ' + msg.data, msg);
		if (msg.data.substr(0,5) === 'mega:') {
			var browser = msg.target;
			if (browser.ownerGlobal) {
				if (typeof browser.ownerGlobal._loadURIWithFlags === 'function') {
					browser.ownerGlobal._loadURIWithFlags(browser, msg.data, { flags: 0x80 | 0x800 });
				}
				else {
					var gBrowser = getBrowser(browser.ownerGlobal);
					if (gBrowser) {
						if (typeof gBrowser.updateBrowserRemoteness === 'function') {
							gBrowser.updateBrowserRemoteness(browser, false);
						}
						browser.loadURIWithFlags(msg.data, 0x80|0x800,null,null,null);
						// LOG('loadURIWithFlags', msg.data);
					}
				}
			}
		}
	};
	const eventMMListener = function(msg) {
		var event = msg.data;
		var timer = delay(function() {
			Services.obs.notifyObservers(null, event.name, JSON.stringify(event));
			timer = null;
		}, 4444);
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
		get phContractID() {
			return "@mozilla.org/network/protocol;1?name="+i$.scheme;
		},
		get phClassID() {
			return Components.ID("{C69E8ACE-459A-45C1-85ED-CEC97CEB7DB4}");
		},
		get scheme() {
			return "mega";
		},
		defaultPort:-1,
		protocolFlags:
			Ci.nsIProtocolHandler.URI_NORELATIVE |
			Ci.nsIProtocolHandler.URI_NOAUTH |
			Ci.nsIProtocolHandler.URI_NON_PERSISTABLE |
			Ci.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE |
			Ci.nsIProtocolHandler.URI_FORBIDS_COOKIE_ACCESS |
			Ci.nsIProtocolHandler.URI_IS_UI_RESOURCE,
		newURI: function(aSpec, aOriginCharset, aBaseURI) {
			var uri = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);
			if (~aSpec.indexOf(':')) {
				uri.spec = aSpec;
			} else {
				uri.spec = this.scheme + ":" + aSpec
			}
			return uri;
		},
		newChannel: function(aURI) {
			return this.newChannel2(aURI, null);
		},
		newChannel2: function(aURI, aLoadInfo) {
			let uri;
			let channel;
			if (aURI.path && (!aURI.schemeIs(this.scheme) || String(aURI.path).split('#').shift().replace(/\//g, ''))) {
				uri = Services.io.newURI(megacuri, null, null);
				uri = uri.resolve(String(aURI.path).replace(/^\//, ''));
			} else {
				uri = megacuri + aURI.ref;
			}
			// LOG("newChannel2: " + aURI.spec + " -> " + uri, aURI, aLoadInfo);
			if (aLoadInfo) {
				uri = Services.io.newURI(uri, null, null);
				channel = Services.io.newChannelFromURIWithLoadInfo(uri, aLoadInfo);
			}
			else {
				channel = newChannel(uri);
			}
			if (aURI.schemeIs(this.scheme) && ~String(aURI.spec).indexOf(':/')) {
				try {
					aURI.spec = aURI.spec.replace(RegExp('^' + this.scheme + ':\\/+', 'i'), this.scheme + ':');
				}
				catch (ex) {}
			}
			channel.owner = mSystemPrincipal;
			channel.originalURI = aURI;
			return channel;
		},
		allowPort: function(aPort, aScheme) {
			return false;
		},
		QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy,Ci.nsIFactory,
			Ci.nsIWebProgressListener,Ci.nsISupportsWeakReference,Ci.nsIProtocolHandler]),
		createInstance: function(outer, iid) {
			if(outer)
				throw Cr.NS_ERROR_NO_AGGREGATION;
			return this.QueryInterface(iid);
		},
		shouldProcess: function(x,y) {
			return ACCEPT;
		},
		_hosts : {
			"mega.co.nz" : 1,
			"mega.is"    : 1,
			"mega.io"    : 1,
			"mega.nz"    : 1,
		},
		shouldLoad: function(x,y,z,n,m,t,p) {
			// return ACCEPT;
			if (y.schemeIs("http") || y.schemeIs("https")) {
				// if(this._hosts[y.host]) LOG('shouldLoad', y.path, y.spec, y);
				
				if(this._hosts[y.host] && !~String(y.path).indexOf('.') && String(y.path).substr(0,6) !== '/linux') try {
					switch(x) {
						case 6:
							if(~JSON.stringify(Components.stack).indexOf('"dch_handle"')) break;
						case 7:
							y.spec = this.scheme + ':'
										+ (y.hasRef ? '#' + y.ref
										: (y.path ? '#' + String(y.path).replace(/^[/#]+/, '') : ''));
							break;
						case 3:
						case 4:
						case 11:
							break;
						default:
							throw new Error('Resource blocked: ' + y.spec);
					}
				} catch(e) {
					if (e.result != Cr.NS_ERROR_MALFORMED_URI) {
						reportError(e);
						return REJECT;
					}
				}
				else if (~y.spec.indexOf(megacuri))
				{
					reportError(y.spec);
					return REJECT;
				}
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
		return (y.schemeIs("http") || y.schemeIs("https")) && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(y.host);
	};
	const getMMMsg = function(type) {
		return 'a:' + mRID + ':' + type;
	};
	const getPrincipalForFrame = function(docShell, frame) {
		let ssm = Services.scriptSecurityManager;
		let uri = frame.document.documentURIObject;
		return ssm.getDocShellCodebasePrincipal(uri, docShell);
	};
	const getSessionStorage = function() {
		try {
			let tmp = Cu.import('resource://app/modules/sessionstore/SessionStorage.jsm', {});
			return tmp.SessionStorageInternal;
		} catch(e) {}
		
		return false;
	};
	const register = function() {
		let registrar;

		if (addon.multiprocessCompatible) {
			// Services.ppmm.loadProcessScript('resource://mega/process-script.js?id=' + addon.psid, true);
			try {
				registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
				registrar.registerFactory(i$.phClassID, i$.scheme, i$.phContractID, i$);
			} catch (e) {
				if(0xC1F30100 == e.result)
					return later(register);
				reportError(e);
			}
		}
		else {
			try {
				registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
				registrar.registerFactory(i$.phClassID, i$.scheme, i$.phContractID, i$);
				registrar.registerFactory(i$.classID, i$.classDescription, i$.contractID, i$);
			} catch (e) {
				if(0xC1F30100 == e.result)
					return later(register);
				reportError(e);
			}

			Services.cm.addCategoryEntry('content-policy', i$.classDescription, i$.contractID, false, true);
		}

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
		
		if (globalMM) {
			globalMM.addMessageListener("MEGA:"+mRID+":event", eventMMListener);
			globalMM.addMessageListener("MEGA:"+mRID+":loadURI", globalMMListener);
			globalMM.loadFrameScript(chromens+'e10s.js?rev='+mRID,true);
		}
		
		const shouldBrowserBeRemote = E10SUtils && E10SUtils.shouldBrowserBeRemote;
		if (typeof shouldBrowserBeRemote === 'function') {
			E10SUtils.shouldBrowserBeRemote = function(aURL) {
				var url = '' + aURL;
				if (url.substr(0,chromens.length) == chromens || url.substr(0,5) == 'mega:')
					return false;
				return shouldBrowserBeRemote.apply(E10SUtils, arguments);
			};
		}
		const canLoadURIInProcess = E10SUtils && E10SUtils.canLoadURIInProcess;
		if (typeof canLoadURIInProcess === 'function') {
			E10SUtils.canLoadURIInProcess = function(aURL, aProcess) {
				var url = '' + aURL;
				if (url.substr(0,chromens.length) == chromens || url.substr(0,5) == 'mega:')
					return aProcess !== Ci.nsIXULRuntime.PROCESS_TYPE_CONTENT;
				return canLoadURIInProcess.apply(E10SUtils, arguments);
			};
		}
		const getRemoteTypeForURI = E10SUtils && E10SUtils.getRemoteTypeForURI;
		if (typeof getRemoteTypeForURI === 'function') {
			E10SUtils.getRemoteTypeForURI = function(aURL, aMultiProcess, aPreferredRemoteType) {
				var url = '' + aURL;
				if (url.substr(0,chromens.length) == chromens || url.substr(0,5) == 'mega:')
					return E10SUtils.NOT_REMOTE !== undefined ? E10SUtils.NOT_REMOTE : null;
				return getRemoteTypeForURI.apply(E10SUtils, arguments);
			};
		}
		const getRemoteTypeForURIObject = E10SUtils && E10SUtils.getRemoteTypeForURIObject;
		if (typeof getRemoteTypeForURIObject === 'function') {
			E10SUtils.getRemoteTypeForURIObject = function(aURI, aMultiProcess, aPreferredRemoteType) {
				if (String(aURI.spec).substr(0,chromens.length) == chromens || aURI.scheme == 'mega')
					return E10SUtils.NOT_REMOTE !== undefined ? E10SUtils.NOT_REMOTE : null;
				return getRemoteTypeForURIObject.apply(E10SUtils, arguments);
			};
		}
		// Workaround Bug 1247529
		const SessionStorageInternal = getSessionStorage();
		const ssCollect = SessionStorageInternal.collect;
		SessionStorageInternal.collect = function(aDocShell, aFrameTree) {
			let frameTree = [];
			aFrameTree.forEach(function(frame) {
				try {
					getPrincipalForFrame(aDocShell, frame).origin;
					frameTree.push(frame);
				}
				catch (e) {}
			});

			return ssCollect.call(SessionStorageInternal, aDocShell, frameTree);
		};

		shutdown(function() {
			uCheckTimer.cancel();

			if (addon.multiprocessCompatible) {
				// Services.ppmm.broadcastAsyncMessage('mega:' + addon.psid, 'shutdown');
				// Services.ppmm.removeDelayedProcessScript('resource://mega/process-script.js?id=' + addon.psid);

				later(function() {
					registrar.unregisterFactory(i$.phClassID, i$);
				});
			}
			else {
				later(function() {
					registrar.unregisterFactory(i$.phClassID, i$);
					registrar.unregisterFactory(i$.classID, i$);
				});

				Services.cm.deleteCategoryEntry('content-policy', i$.classDescription, false);
			}

			if (globalMM) {
				globalMM.broadcastAsyncMessage("MEGA:"+mRID+":bcast",getMMMsg('d'));
				globalMM.removeMessageListener("MEGA:"+mRID+":event", eventMMListener);
				globalMM.removeMessageListener("MEGA:"+mRID+":loadURI", globalMMListener);
				globalMM.removeDelayedFrameScript(chromens+'e10s.js?rev='+mRID);
			}
			if (typeof shouldBrowserBeRemote === 'function') {
				E10SUtils.shouldBrowserBeRemote = shouldBrowserBeRemote;
			}
			if (typeof canLoadURIInProcess === 'function') {
				E10SUtils.canLoadURIInProcess = canLoadURIInProcess;
			}
			if (typeof getRemoteTypeForURI === 'function') {
				E10SUtils.getRemoteTypeForURI = getRemoteTypeForURI;
			}
			if (typeof getRemoteTypeForURIObject === 'function') {
				E10SUtils.getRemoteTypeForURIObject = getRemoteTypeForURIObject;
			}
			if (typeof ssCollect === 'function') {
				SessionStorageInternal.collect = ssCollect;
			}
		});
	};
	const api_shutdown = function(aData,aReason) {
		if(2 == aReason)
			return;
		
		for(var f ; (f = SQ.pop()) ; ) {
			try {
				f();
			} catch(e) {
				reportError(e);
			}
		}

		Services.wm.removeListener(i$);
		wmf(unloadFromWindow);

		Services.io.getProtocolHandler("resource")
			.QueryInterface(Ci.nsIResProtocolHandler)
			.setSubstitution(addon.tag,null);
			
		for(var m in Gs) try { delete Gs[m]; } catch(e) {}
	};
	const api_startup = function(aData,aReason) {
		AddonManager.getAddonByID(aData.id,function(aAddon) {
			var tag = aAddon.name.toLowerCase().replace(/[^\w]/g,'');

			addon = aAddon;
			Object.defineProperty(addon, 'tag', { value: tag });
			Object.defineProperty(addon, 'psid', {
				configurable: true,
				value: addon.id.replace(/[^\w-]/g, '') + mRID
			});

			// DBG = LOG;//addon.version.replace(/[\d.]/g,'') == 'a' ? LOG:Vf;
			// DBG(Gs, addon, Services, i$);

			Services.io.getProtocolHandler("resource")
				.QueryInterface(Ci.nsIResProtocolHandler)
				.setSubstitution(addon.tag,aData.resourceURI);

			register();

			wmf(loadIntoWindow);
			Services.wm.addListener(i$);

			Services.prefs.setCharPref('extensions.' + tag + '.version', addon.version);
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
			if (!globalMM) browser.removeProgressListener(i$);
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

		// DBG('loadIntoWindow', document.documentElement.getAttribute("windowtype"), document.location.href);
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
			if (!globalMM) browser.addProgressListener(i$);
		}
	};
	const AddonManager = Import("AddonManager"), E10SUtils = Import2("E10SUtils",{},'');
	const Services = extend(create(Import("Services")), freeze({
		cm : Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager)
	}));
	const newChannel = (function() {
		if (typeof Services.io.newChannel2 !== 'function') {
			return function(aSpec) {
				return Services.io.newChannel(aSpec, null, null);
			};
		}
		return function(aSpec) {
			return Services.io.newChannel2(
				aSpec,
				'UTF-8',
				null, null, mSystemPrincipal, null,
				Ci.nsILoadInfo.SEC_ALLOW_CROSS_ORIGIN_DATA_IS_NULL,
				Ci.nsIContentPolicy.TYPE_DOCUMENT);
		};
	})();
	var DBG, console, addon = {};

	/**
	try {
		console = Import("devtools/Console").console;
	} catch(e) {
		console = { info : function(n,m) { Services.console.logStringMessage(m||n)}};
	}
	const LOG = function() {
		[].unshift.call(arguments,addon.name);
		console.info.apply(console, arguments);
		DBG == Vf || console.trace();
	}; /**/

	extend(Gs, {
		startup   : freeze(api_startup.bind(null)),
		shutdown  : freeze(api_shutdown.bind(null)),
		install   : Vf,
		uninstall : Vf
	});
})(this);
