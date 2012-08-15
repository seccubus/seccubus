steal(	'jquery/controller',
	'jquery/view/ejs' 
).then( './views/init.ejs', 
	function($){

/**
 * @class Widgets.Modal
 * @parent index
 * @inherits jQuery.Controller
 * Renders a modal window with either a string or a certain element as content
 * If options.close is set, a close button is rendered using an image with 
 * img/closebox.png as source
 * That if a jQuery query is provided as part of the options this element will 
 * be displayed as modal window and hidden after the modal window closes.
 */
$.Controller('Widgets.Modal',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options for this controller
	 */
	defaults : {
		/*
		 * @attribute options.query
		 * jQuery query string for the element you want to render as a 
		 * modal popup
		 */
		query : "",
		/*
		 * @attribute options.message
		 * Message that you want to be displayed as a modal popup
		 */
		message : "",
		/*
		 * @attribute options.close
		 * Boolean that indicates if a close button should be rendered
		 * Close button is represented by image with source
		 * img/closebox.png
		 */
		close : false
	}
},
/** @Prototype */
{
	/*
	 * Renders the controller and displays the modal window
	 */
	init : function(){
		this.element.append("//widgets/modal/views/init.ejs",{
			message: this.options.message
		});
		this.open();
	},
	// Close on .close click
	".close click" : function() {
		this.close();
	},
	// Close on .mask click
	".mask click" : function() {
		this.close();
	},
	/*
	 * Closes the popup and resets the options to default values.
	 */
	close : function() {
		$('#widgetsModalMask').hide();
		var id;
		if(this.options.message ) {
			this.update_message(this.options.message);
			id = "#widgetsModalMessage";
		} else {
			id = this.options.query;
		}
		$(id).removeClass('widgetsModalWindow');
		$(id).hide();

		if ( this.options.close ) {
			$('#widgetsModalClose').hide();
		}

		this.options.message = "";
		this.options.query = "";
		this.options.close = false;
	},
	/*
	 * This function actually opens the modal popup.
	 * @param options object containing the options for this render session.
	 * The attributes of options will be transferred to this.options
	 */
	open : function(options) {
		for(var a in options) {
			this.options[a] = options[a];
		}

		// Default text
		if ( this.options.message == "" && this.options.query == "" ) {
			this.options.message = "Hello world";
		}

		// Find out what to show, and render message if needed
		var id;
		if(this.options.message ) {
			this.update_message(this.options.message);
			id = "#widgetsModalMessage";
		} else {
			id = this.options.query;
		}
		$(id).addClass('widgetsModalWindow');

		// Cover whole document
		var maskHeight = $(document).height();
		var maskWidth = $(document).width();
		$('#widgetsModalMask').css({'width' : maskWidth,'height' : maskHeight});
		// Transition effect
		$('#widgetsModalMask').fadeIn(1000);
		$('#widgetsModalMask').fadeTo("slow",0.8);

		// Position 
		var winH = $(window).height();
		var winW = $(window).width();
		$(id).css('top', winH/2-$(id).height()/2);
		$(id).css('left', winW/2-$(id).width()/2);

		// Transition effect
		$(id).fadeIn(2000);

		if ( this.options.close ) {
			var position = $(id).position();
			$('#widgetsModalClose').css({
				position	: 'absolute'
			});
			$('#widgetsModalClose').css('top', position.top-$('#widgetsModalClose').height());
			$('#widgetsModalClose').css('left', position.left+$(id).width());
			$('#widgetsModalClose').fadeIn(1500);
		}
	},
	/*
	 * Updates the model popup message
	 */
	update_message : function(message) {
		$("#widgetsModalMessage").html(message);		
	},
	/*
	 * Update, overloaded to allways open the popup
	 */
	update : function(options) {
		this._super(options);
		this.open();
	}
})

});
