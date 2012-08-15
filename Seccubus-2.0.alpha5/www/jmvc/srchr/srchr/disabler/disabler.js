steal.plugins('jquery/controller', 'jquery/event/default').then(function( $ ) {

	/**
	 * Disables tabs and prevents default behavior.
	 * Listens to searches and sets tabs to be disabled / enabled
	 * and also will prevent clicking on it.
	 * @tag controllers, home
	 */
	$.Controller.extend("Srchr.Disabler",
	/* @static */
	{
		defaults: {
			activateSelector: "li",
			listenTo: document.documentElement
		}
	},
	/* @prototype */
	{
		/**
		 * Initialize a new Disabler controller.
		 */
		init: function() {
			this.bind(this.options.listenTo, "search", "checkTypes");
		},

		/**
		 * Binds {activateSelector} to the "activate" event to prevent the default behavior if it has the 'disabled' class.
		 * @param {Object} el The element to prevent the default behavior on.
		 * @param {Object} ev The event to prevent.
		 */
		"{activateSelector} activate": function( el, ev ) {
			if ( el.hasClass('disabled') ) {
				ev.preventDefault();
			}
		},

		// Listen for the search type
		/**
		 * Determines the search types that were allowed and sets the "disabled" class on those that weren't.  Also activates the first that LI that is not disabled.
		 * @param {Object} el The element that the event was called on.
		 * @param {Object} ev The event that was called.
		 * @param {Object} data The data that was passed to the event.
		 */
		checkTypes: function( el, ev, data ) {

			var types = {},
				first = true;

			// Fill the list of types to check against.
			$.each(data.types, function( index, type ) {
				// Model types come in as Srchr.Model.typeName, so just get the last part
				types[type.split('.').pop()] = true;
			});

			this.element.find(this.options.activateSelector).each(function(){
				var el = $(this);

				// If the Model type we are iterating through is in the list, enable it.
				// Otherwise, disable it.
				if ( types[el.text()] ) {
					el.removeClass("disabled");
					if ( first ) {
						el.trigger('activate');
						first = false;
					}
				} else {
					el.addClass("disabled");
				}
			});
		}
	});
});