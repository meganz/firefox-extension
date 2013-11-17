
let {classes:Cc,interfaces:Ci,utils:Cu} = Components, addon;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/AddonManager.jsm");

function rsc(n) 'resource://' + addon.tag + '/' + n;
function LOG(m) (m = addon.name + ' Message @ '
	+ (new Date()).toISOString() + "\n> " + m,
		dump(m + "\n"), Services.console.logStringMessage(m));

let ACCEPT = Ci.nsIContentPolicy.ACCEPT,
	REJECT = Ci.nsIContentPolicy.REJECT_TYPE,
	VOID = function() {};

let i$ = {
	get classDescription() addon.name,
	get classID() Components.ID("{64696567-6f63-7220-6869-7265646a6f62}"),
	get contractID() "@mega.co.nz/content-policy;1",
	get Window() Services.wm.getMostRecentWindow('navigator:browser'),
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy,Ci.nsIFactory,
		Ci.nsIWebProgressListener,Ci.nsISupportsWeakReference]),
	createInstance: function(outer, iid) {
		if(outer)
			throw Cr.NS_ERROR_NO_AGGREGATION;
		return this.QueryInterface(iid);
	},
	shouldProcess: function() ACCEPT,
	shouldLoad: function(x,y,z,n,m,t,p) {
		
		if((y.scheme == 'https' || y.scheme == 'http') && /(?:^|\.)mega\.(?:co\.nz|is)$/.test(y.host)) try {
			switch(x) {
				case 6:
				case 7:
					y.spec = 'chrome://mega/content/secure.html#' + y.ref;
					break;
				case 3:
				case 4:
				case 11:
					break;
				default:
					throw new Error('Resource not allowed: ' + y.spec);
			}
		} catch(e) {
			Cu.reportError(e);
			return REJECT;
		}
		
		return ACCEPT;
	},
	roi: function(f) {
		Services.tm.currentThread.dispatch(f.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
	},
	startup: function() {
		try {
			let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
			registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
		} catch (e) {
			if(0xC1F30100 == e.result)
				return this.roi(this.startup);
			Cu.reportError(e);
		}
		
		let cm = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
		cm.addCategoryEntry('content-policy', this.classDescription, this.contractID, false, true);
		
		let i = Ci.nsITimer;
		this.uCheckTimer = Cc["@mozilla.org/timer;1"].createInstance(i);
		this.uCheckTimer.initWithCallback({
			notify: function() {
				addon.ptr.findUpdates({
					onUpdateAvailable: function(addon, installer) {
						if(AddonManager.shouldAutoUpdate(addon))
							installer.install();
					}
				}, AddonManager.UPDATE_WHEN_USER_REQUESTED);
			}
		},3600000,i.TYPE_REPEATING_SLACK);
		
		cm = undefined;
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
			this.roi(function() r.unregisterFactory(this.classID, this), Ci.nsIEventTarget.DISPATCH_NORMAL);
		} catch(e) {
			Cu.reportError(e);
		}
		
		if(this.uCheckTimer)
			this.uCheckTimer.cancel();
	},
	onStateChange   : VOID,
	onStatusChange  : VOID,
	onProgressChange: VOID,
	onSecurityChange: VOID,
	onLocationChange: function(w,r,l) {
		
		try {
			
			if((l.scheme == 'https' || l.scheme == 'http') && (l.host === 'mega.co.nz' || l.host === 'mega.is')) {
				
				try {
					r.cancel(Components.results.NS_BINDING_REDIRECTED);
				} catch(e) {}
				w.DOMWindow.location = 'chrome://mega/content/secure.html#' + l.ref;
			}
			
		} catch(e) {
			Cu.reportError(e);
		}
	},
	onOpenWindow: function(aWindow) {
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		loadIntoWindowStub(domWindow);
	},
	onCloseWindow: function() {},
	onWindowTitleChange: function() {}
};

function setTimeout(f,n) {
	let i = Ci.nsITimer, t = Cc["@mozilla.org/timer;1"].createInstance(i);
	t.initWithCallback({notify:f},n||30,i.TYPE_ONE_SHOT);
	return t;
}

function loadIntoWindowStub(domWindow) {
	
	if(domWindow.document.readyState == "complete") {
		loadIntoWindow(domWindow);
	} else {
		domWindow.addEventListener("load", function() {
			domWindow.removeEventListener("load", arguments.callee, false);
			loadIntoWindow(domWindow);
		}, false);
	}
}

function unloadFromWindow(window) {
	if(!(/^chrome:\/\/(browser|navigator)\/content\/\1\.xul$/.test(window&&window.location)))
		return;
	
	getBrowser(window).removeProgressListener(i$);
}

function loadIntoWindow(window) {
	if(!(/^chrome:\/\/(browser|navigator)\/content\/\1\.xul$/.test(window&&window.location)))
		return;
	
	getBrowser(window).addProgressListener(i$);
}

function getBrowser(w) {
	
	try {
		return w.getBrowser();
	} catch(e) {
		return w.gBrowser;
	}
}

function startup(aData) {
	AddonManager.getAddonByID(aData.id,function(data) {
		let io = Services.io, wm = Services.wm;
		
		addon = {
			id: data.id,
			name: data.name,
			version: data.version,
			ptr: data,
			tag: data.name.toLowerCase().replace(/[^\w]/g,'')
		};
		addon.branch = Services.prefs.getBranch('extensions.'+addon.tag+'.');
		
		io.getProtocolHandler("resource")
			.QueryInterface(Ci.nsIResProtocolHandler)
			.setSubstitution(addon.tag,
				io.newURI(__SCRIPT_URI_SPEC__+'/../',null,null));
		
		let windows = wm.getEnumerator("navigator:browser");
		while(windows.hasMoreElements()) {
			let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
			loadIntoWindowStub(domWindow);
		}
		wm.addListener(i$);
		
		i$.startup();
		addon.branch.setCharPref('version', addon.version);
	});
}

function shutdown(data, reason) {
	if(reason == APP_SHUTDOWN)
		return;
	
	i$.shutdown();
	
	Services.wm.removeListener(i$);
	
	let windows = Services.wm.getEnumerator("navigator:browser");
	while(windows.hasMoreElements()) {
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		unloadFromWindow(domWindow);
	}
	
	Services.io.getProtocolHandler("resource")
		.QueryInterface(Ci.nsIResProtocolHandler)
		.setSubstitution(addon.tag,null);
}

function install(data, reason) {}
function uninstall(data, reason) {}
