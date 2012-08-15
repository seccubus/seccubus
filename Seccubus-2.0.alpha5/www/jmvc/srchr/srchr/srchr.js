// Load all of the plugin dependencies
steal.plugins('srchr/search',
	'srchr/history',
	'srchr/search_result',
	'srchr/tabs',
	'srchr/disabler')
	.models('flickr','yahoo','upcoming','twitter')
		
.then(function($){
	
	// This is the Srchr application.  It intergrates all of the Srchr modules.
	
	// Create a new Search controller on the #searchArea element
	$("#searchArea").srchr_search();
	
	// Instead of printing out the Model names in their entirety in the history list,
	// just print out the first letter
	var typePrettyNames = {
		"Srchr.Models.Flickr" : "f",
		"Srchr.Models.Yahoo" : "y",
		"Srchr.Models.Upcoming" : "u"
	};
	
	// Create a new History controller on the #history element
	$("#history").srchr_history({
		titleHelper : function(search){
			var text =  search.query,
				types = [];
			for(var i=0; i < search.types.length; i++){
				types.push( typePrettyNames[search.types[i]] );
			}
			return  text+" "+types.join();
		}
	});
	// when a search happens, add to history
	$("#searchArea").bind("search", function(ev, search){
		$("#history").srchr_history("add", search);
	});
	// when a history item is selected, update search
	$("#history").bind("selected", function(ev, search){
		$("#searchArea").srchr_search("val", search);
	});
	
	// Create new Tabs and Disabler controllers on the #resultsTab element 
	$("#resultsTab").srchr_tabs().srchr_disabler();
	
	// Create new Search Results controller on the #flickr element 
	$("#flickr").srchr_search_result({
		modelType : Srchr.Models.Flickr,
		resultView : "//srchr/views/flickr.ejs"
	});
	
	// Create new Search Results controller on the #yahoo element
	$("#yahoo").srchr_search_result({
		modelType : Srchr.Models.Yahoo,
		resultView : "//srchr/views/yahoo.ejs"
	});
	
	// Create new Search Results controller on the #upcoming element
	$("#upcoming").srchr_search_result({
		modelType : Srchr.Models.Upcoming,
		resultView : "//srchr/views/upcoming.ejs"
	});

	
	$("#twitter").srchr_search_result({
		modelType : Srchr.Models.Twitter,
		resultView : "//srchr/views/twitter.ejs"
	});
	
});
