steal.plugins('jquery/controller', 'jquery/event/default').css('tabs').then(function() {

	/**
	 * A basic tabs controller for showing and hiding content.
	 *
	 * @codestart
	 &lt;ul id='resultsTab'&gt;
	 &lt;li&gt;&lt;a href='#flickr'&gt;Flickr&lt;/a&gt;&lt;/li&gt;
	 &lt;li&gt;&lt;a href='#yahoo'&gt;Yahoo&lt;/a&gt;&lt;/li&gt;
	 &lt;li&gt;&lt;a href='#upcoming'&gt;Upcoming&lt;/a&gt;&lt;/li&gt;
	 &lt;/ul&gt;
	 
	 &lt;div id='flickr'&gt;&lt;/div&gt;
	 &lt;div id='yahoo'&gt;&lt;/div&gt;
	 &lt;div id='upcoming'&gt;&lt;/div&gt;
	 @codeend
	 * 
	 * @codestart
	 $("#resultsTab").srchr_tabs();
	 * @codeend
	 * 
	 * <code>#resultsTab</code> Will be transformed into working tabs that the user can click to use.  The <code>href</code>s must correspond the to the jQuery selector of the content element it represents.
	 * 
	 * @tag controllers, home
	 */
	$.Controller.extend("Srchr.Tabs",
	/* @prototype */
	{

		/**
		 * Initialize a new Tabs controller.
		 * @param {Object} el The UL element to create the tabs controller on
		 */
		init: function( el ) {

			// activate the first tab
			this.activate($(el).children("li:first"));

			// hide other tabs
			var tab = this.tab;
			this.element.addClass('ui-helper-clearfix').children("li:gt(0)").each(function() {
				tab($(this)).hide();
			});
		},

		// helper function finds the tab for a given li
		/**
		 * Retrieves a tab contents for a given tab
		 * @param {Object} li The LI to retrieve the tab for.
		 */
		tab: function( li ) {
			return $(li.find("a").attr("href"));
		},

		// on an li click, activates new tab 
		/**
		 * Binds on an LI to trigger "activate" on a new tab.
		 * @param {Object} el The element to trigger "activate" on.
		 * @param {Object} ev The event to prevent the default action for.
		 */
		"li click": function( el, ev ) {
			ev.preventDefault();
			el.trigger("activate");
		},

		/**
		 * Default event handler for the "activate" event.
		 * @param {Object} el The element to activate
		 * @param {Object} ev The event that was fired.
		 */
		"li default.activate": function( el, ev ) {
			this.activate(el);
		},

		/**
		 * Hide all tabs, show the new one.
		 * @param {Object} The element to show.
		 */
		activate: function( el ) {
			this.tab(this.find('.active').removeClass('active')).hide();
			this.tab(el.addClass('active')).show().trigger("show");
		}
	});

});