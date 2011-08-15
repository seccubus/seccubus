steal.plugins('jquery/controller', 'jquery/event/default').css('tabs').then(function() {

	/**
	 * A basic tabs controller for showing and hiding content.
	 *
	 * @codestart
	 &lt;ul id='navTabs'&gt;
	 &lt;li&gt;&lt;a href='#workspaces'&gt;Workspaces&lt;/a&gt;&lt;/li&gt;
	 &lt;li&gt;&lt;a href='#scans'&gt;Scans&lt;/a&gt;&lt;/li&gt;
	 &lt;li&gt;&lt;a href='#findings'&gt;Finidings&lt;/a&gt;&lt;/li&gt;
	 &lt;/ul&gt;
	 
	 &lt;div id='workspaces'&gt;&lt;/div&gt;
	 &lt;div id='scans'&gt;&lt;/div&gt;
	 &lt;div id='findings'&gt;&lt;/div&gt;
	 @codeend
	 * 
	 * @codestart
	 $("#navTabs").seccubus_tabs();
	 * @codeend
	 * 
	 * <code>#navTabs</code> Will be transformed into working tabs that the user can click to use.  The <code>href</code>s must correspond the to the jQuery selector of the content element it represents.
	 * 
	 * @tag controllers, home
	 */
	$.Controller.extend("Seccubus.Tabs",
	/* @prototype */
	{

		/**
		 * Initialize a new Tabs controller.
		 * @param {Object} el The UL element to create the tabs controller on
		 */
		init: function( el ) {

			// activate the first tab, which is the last tab since css is floating them right
			this.activate($(el).children("li:last"));

			// hide other tabs
			var tab = this.tab;
			this.element.addClass('ui-helper-clearfix').children(":not(:last)").each(function() {
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
			if ( !(el.hasClass('disable')) ) el.trigger("activate");
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
		},

		/**
		 * Prevents any clicks on a tab
		 * @param {Object} The element index value to disable
		 */
		disable: function( index ) {
			this.element.children(":eq("+index+")").addClass('disable');
		},
		/**
		 * Allow clicks on a tab
		 * @param {Object} The element index value to enable
		 */
		enable: function( index ) {
			this.element.children(":eq("+index+")").removeClass('disable');
		}
	});

});
