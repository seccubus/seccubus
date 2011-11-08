steal(function(){

	if(steal.options.browser === "phantomjs"){
		var ifrm = document.createElement("IFRAME"); 
		ifrm.setAttribute("id", "funcunit_app");
		document.body.appendChild(ifrm);
	}

	var evts = ['begin', 'testStart', 'testDone', 'moduleStart', 'moduleDone', 'done', 'log'], type;
	
	for (var i = 0; i < evts.length; i++) {
		type = evts[i];
		(function(type){
			QUnit[type] = function(data){
				steal.client.trigger(type, data);
			};
		})(type);
	}
})
