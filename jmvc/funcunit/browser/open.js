(function($){

var confirms = [], 
	prompts = [], 
	currentDocument,
	lookingForNewDocument = false,
	
	// returns true if url matches current window's url
	isCurrentPage = function(url){
		if( FuncUnit.win.location.pathname === url ||
			FuncUnit.win.href === url ){
			return true;
		}
		return false;
	};
/**
 * @add FuncUnit
 */
$.extend(FuncUnit,{
	/**
	 * @attribute browsers
	 * Used to configure the browsers selenium uses to run FuncUnit tests.  See the 
	 * [funcunit.selenium Selenium] page for more information.
	 */
	
	// href comes from settings
	/**
	 * @attribute href
	 * The location of the page running the tests on the server and where relative paths 
	 * passed in to [FuncUnit.static.open] will be referenced from.
	 * 
	 * This is typically where the test page runs on the server.  It can be set before 
	 * calls to [FuncUnit.static.open]:
	@codestart
	test("opening something", function(){
	  S.href = "http://localhost/tests/mytest.html"
	  S.open("../myapp")
	  ...
	})
	@codeend
	 */
	
	// jmvcRoot comes from settings
	/**
	 * @attribute jmvcRoot
	 * jmvcRoot should be set to url of JMVC's root folder.  
	 * <p>This is used to calculate JMVC style paths (paths that begin with  //).
	 * This is the prefered method of referencing pages if
	 * you want to test on the filesystem and test on the server.</p>
	 * <p>This is usually set in the global config file in <code>funcunit/settings.js</code> like:</p>
	@codestart
	FuncUnit = {jmvcRoot: "http://localhost/script/" }
	@codeend
	 */
	
	// open is a method
	/**
	 * Opens a page.  It will error if the page can't be opened before timeout. 
	 * <h3>Example</h3>
	@codestart
	//a full url
	S.open("http://localhost/app/app.html")
	
	//from jmvc root (FuncUnit.jmvcRoot must be set)
	S.open("//app/app.html")
	@codeend
	
	 * <h3>Paths in Selenium</h3>
	 * Selenium runs the testing page from the filesystem and by default will look for pages on the filesystem unless provided a full
	 * url or information that can translate a partial path into a full url. FuncUnit uses [FuncUnit.static.jmvcRoot] 
	 * and [FuncUnit.static.href] to 
	 * translate partial paths.
	<table>
	  <tr>
	  	<th>path</th>
	  	<th>jmvcRoot</th>
	  	<th>href</th>
	  	<th>resulting url</th>
	  </tr>
	  <tr>
	    <td>//myapp/mypage.html</td>
	    <td>null</td>
	    <td>null</td>
	    <td>file:///C:/development/cookbook/public/myapp/mypage.html</td>
	  </tr>
	  <tr>
	    <td>//myapp/mypage.html</td>
	    <td>http://localhost/</td>
	    <td></td>
	    <td>http://localhost/myapp/mypage.html</td>
	  </tr>
	  <tr>
	    <td>http://foo.com</td>
	    <td></td>
	    <td></td>
	    <td>http://foo.com</td>
	  </tr>
	  <tr>
	  	<td>../mypage.html</td>
	    <td></td>
	    <td>http://localhost/myapp/funcunit.html</td>
	    <td>http://localhost/mypage.html</td>
	  </tr>
	</table>
	 * 
	 * @param {String} path a full or partial url to open.  If a partial is given, 
	 * @param {Function} callback
	 * @param {Number} timeout
	 */
	open: function( path, callback, timeout ) {
		var fullPath = FuncUnit.getAbsolutePath(path), 
		temp;
		if(typeof callback != 'function'){
			timeout = callback;
			callback = undefined;
		}
		FuncUnit.add({
			method: function(success, error){ //function that actually does stuff, if this doesn't call success by timeout, error will be called, or can call error itself
				steal.dev.log("Opening " + path)
				FuncUnit._open(fullPath, error);
				FuncUnit._onload(function(){
					FuncUnit._opened();
					success()
				}, error);
			},
			callback: callback,
			error: "Page " + path + " not loaded in time!",
			timeout: timeout || 30000
		});
	},
	_open: function(url){
		hasSteal = false;
		// this will determine if this is supposed to open within a frame
		FuncUnit.frame =  $('#funcunit_app').length? $('#funcunit_app')[0]: null;
	
		
		// if the first time ..
		if (newPage) {
			if(FuncUnit.frame){
				FuncUnit.win = FuncUnit.frame.contentWindow;
				FuncUnit.win.location = url;
			}
			else{
				// giving a large height forces it to not open in a new tab and just opens to the window's height
				var width = $(window).width();
				//opera.postError("window.open")
				FuncUnit.win = window.open(url, "funcunit",  "height=1000,toolbar=yes,status=yes,left="+width/2);
				
				
				if(!FuncUnit.win){
					throw "Could not open a popup window.  Your popup blocker is probably on.  Please turn it off and try again";
				}
			}
		}
		// otherwise, change the frame's url
		else {
			var reloading = isCurrentPage(url);
			lookingForNewDocument = true;
			FuncUnit.win.location = url;
			if(reloading){
				FuncUnit.win.location.reload();
			}
			// setting to null b/c opera uses the same document
			currentDocument = null;
		}
		lookingForNewDocument = true;
	},
	/**
	 * When a browser's native confirm dialog is used, this method is used to repress the dialog and simulate 
	 * clicking OK or Cancel.  Alerts are repressed by default in FuncUnit application windows.
	 * @codestart
	 * S.confirm(true);
	 * @codeend
	 * @param {Boolean} answer true if you want to click OK, false otherwise
	 */
	confirm: function(answer){
		confirms.push(!!answer)
	},
	/**
	 * When a browser's native prompt dialog is used, this method is used to repress the dialog and simulate 
	 * clicking typing something into the dialog.
	 * @codestart
	 * S.prompt("Harry Potter");
	 * @codeend
	 * @param {String} answer Whatever you want to simulate a user typing in the prompt box
	 */
	prompt: function(answer){
		prompts.push(answer)
	},
	_opened: function(){
		if (!this._isOverridden("alert")) {
			FuncUnit.win.alert = function(){}
		}
		
		if (!this._isOverridden("confirm")) {
			FuncUnit.win.confirm = function(){
				var res = confirms.shift();
				return res;
			}
		}
		
		if (!this._isOverridden("prompt")) {
			FuncUnit.win.prompt = function(){
				return prompts.shift();
			}
		}
	},
	_isOverridden:function(type) {
		return !(/(native code)|(source code not available)/.test(FuncUnit.win[type]));
	},
	_onload: function(success, error){
		// saver reference to success
		loadSuccess = function(){
			if(FuncUnit.win.steal){
				hasSteal = true;
			}
			// called when load happens ... here we check for steal
			// console.log("success", (FuncUnit.win.steal && FuncUnit.win.steal.isReady) || !hasSteal, 
				// "isReady", (FuncUnit.win.steal && FuncUnit.win.steal.isReady));
			if((FuncUnit.win.steal && FuncUnit.win.steal.isReady) || !hasSteal){
				success();
			}else{
				setTimeout(arguments.callee, 200)
			}
				
		}
		
		// we only need to do this setup stuff once ...
		if (!newPage) {
			return;
		}
		newPage = false;
		
		if (FuncUnit.support.readystate)
		{
			poller();
		}
		else {
			unloadLoader();
		}
		
	},
	/**
	 * @hide
	 * Gets a path, will use steal if present
	 * @param {String} path
	 */
	getAbsolutePath: function( path ) {
		if(typeof(steal) == "undefined" || steal.root == null){
			return path;
		}
		var fullPath, 
			root = FuncUnit.jmvcRoot || steal.root.path;
		
		if (/^\/\//.test(path)) {
			fullPath = new steal.File(path.substr(2)).joinFrom(root);
		}
		else {
			fullPath = path;
		}
		
		if(/^http/.test(path))
			fullPath = path;
		return fullPath;
	},
	/**
	 * @attribute win
	 * Use this to refer to the window of the application page.  You can also 
	 * reference window.document.
	 * @codestart
	 * S(S.window).innerWidth(function(w){
	 *   ok(w > 1000, "window is more than 1000 px wide")
	 * })
	 * @codeend
	 */
	win: null,
	// for feature detection
	support: {
		readystate: "readyState" in document
	},
	/**
	 * Used to evaluate code in the application page.
	 * @param {String} str the code to evaluate
	 * @return {Object} the result of the evaluated code
	 */
	eval: function(str){
		return FuncUnit.win.eval(str)
	}
});

	//don't do any of this if in rhino
	if (navigator.userAgent.match(/Rhino/)) {
		return;	
	}
	
	
	FuncUnit.win = null;
	var newPage = true, 
		hasSteal = false,
		unloadLoader, 
		loadSuccess, 
		firstLoad = true,
		onload = function(){
			FuncUnit.win.document.documentElement.tabIndex = 0;
			setTimeout(function(){
				FuncUnit.win.focus();
				var ls = loadSuccess
				loadSuccess = null;
				if (ls) {
					ls();
				}
			}, 0);
			Syn.unbind(FuncUnit.win, "load", onload);
		},
		onunload = function(){
			FuncUnit.stop = true;
			removeListeners();
			setTimeout(unloadLoader, 0)
			
		},
		removeListeners = function(){
			Syn.unbind(FuncUnit.win, "unload", onunload);
			Syn.unbind(FuncUnit.win, "load", onload);
		}
	unloadLoader = function(){
		if(!firstLoad) // dont remove the first run, fixes issue in FF 3.6
			removeListeners();
		
		Syn.bind(FuncUnit.win, "load", onload);
		
		//listen for unload to re-attach
		Syn.bind(FuncUnit.win, "unload", onunload)
	}
	
	//check for window location change, documentChange, then readyState complete -> fire load if you have one
	var newDocument = false, 
		poller = function(){
			var ls;
			if(FuncUnit.win.document  == null){
				return
			}
			/*opera.postError("looking "+lookingForNewDocument)
			opera.postError("equal "+( FuncUnit.win.document === currentDocument) )
			opera.postError("rest "+newDocument+" "+
			            FuncUnit.win.document.readyState+" "+
						"fuo"+" "+
						FuncUnit.win.___FUNCUNIT_OPENED );*/
						
			if (lookingForNewDocument){
				if( FuncUnit.win.document !== currentDocument && 
				    FuncUnit.win.document.readyState === "complete" && 
				    FuncUnit.win.location.href != "about:blank" &&
					! FuncUnit.win.___FUNCUNIT_OPENED ) {
				
					// reset flags
					lookingForNewDocument = false;
					currentDocument = FuncUnit.win.document;
					
					// mark it as opened
					FuncUnit.win.___FUNCUNIT_OPENED = true;
					
					ls = loadSuccess;
					
					loadSuccess = null;
					if (ls) {
						FuncUnit.win.focus();
						FuncUnit.win.document.documentElement.tabIndex = 0;
						
						ls();
					}
				}
			}
		
		/*if (FuncUnit.win.document !== currentDocument || newDocument) { //we have a new document
			currentDocument = FuncUnit.win.document;
            newDocument = true;
			if (FuncUnit.win.document.readyState === "complete" && FuncUnit.win.location.href!="about:blank" && !reloading) {
				
				
			}
		}*/
		// TODO need a better way to determine if a reloaded frame is loaded (like clearing the frame), this might be brittle 
		setTimeout(arguments.callee, 500)
	}

	/**$(window).unload(function(){
		// helps with page reloads
		if (FuncUnit.win && FuncUnit.win.steal){
			delete FuncUnit.win.steal.isReady;
			delete FuncUnit.win.document.readyState
		}
	})*/
	
})(window.jQuery || window.FuncUnit.jQuery)
