steal.plugins('//srchr/tabs', '//srchr/disabler')

.then(function( $ ) {

	/**
	 * This plugin generates tabs HTML that is compliant with the Srchr Tabs controller.
	 * It accepts the Srchr.Models object and dynamically creates the tabs HTML inside of the
	 * UL that it was called on.  It also creates the content areas that the tabs will operate
	 * on.  Finally, it calls srchr_tabs() and srchr_disabler() to return tabs that are ready 
	 * for use by other areas of the application.
	 * 
	 * @codestart
	 &lt;ul id='resultTabs'&gt;&lt;/ul&gt;
	 @codeend
	 * 
	 * @codestart
	 $("#resultTabs").search_tabs(Srchr.Models);
	 * @codeend
	 * 
	 * All this plugin needs to work is HTML and JS as above.  Individual tabs are created for each model except for "Search," since it is the superclass.
	 * 
	 * @return jQuery
	 * @tag plugins, home
	 */

	$.fn.srchr_search_tabs = function( models ) {

		var model, modelsArr = [],
			lastModel;

		for ( model in models ) {

			// Don't include the parent "Search" class
			if ( model !== 'Search' ) {
				modelsArr.push(model);
			}
		}

		// Go through each model in the array and make a tab for it, then append it to 'this'
		for ( var i = 0; i < modelsArr.length; i++ ) {
			this.append($('<li>').html(
			$('<a>', {
				href: '#' + modelsArr[i]
			}).html(modelsArr[i])));
		}

		// Create the content containers for each respective tab.
		// Looping through again so that the tabs' content divs show up in the same order as the tabs.
		// Note:  Added an extra set of parens in the conditional to make JSLint happy.
		while ((lastModel = modelsArr.pop())) {
			this.after($('<div>', {
				id: lastModel
			}));
		}

		return this.srchr_tabs().srchr_disabler();
	};

});