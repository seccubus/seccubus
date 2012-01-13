steal(	'jquery/controller',
	'jquery/view/ejs' ,
	'./modal.css'
).then( './views/init.ejs', 
	function($){

/**
 * @class Widgets.Modal
 * @parent index
 * Renders a modal window with either a string or a certain element as content
 */
$.Controller('Widgets.Modal',
/** @Static */
{
	defaults : {
		query : "",
		message : "",
		close : false
	}
},
/** @Prototype */
{
	init : function(){
		this.element.append("//widgets/modal/views/init.ejs",{
			message: this.options.message
		});
		this.open();
	},
	".close click" : function() {
		this.close();
	},
	".mask click" : function() {
		this.close();
	},
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
	update_message : function(message) {
		$("#widgetsModalMessage").html(message);		
	},
	update : function(options) {
		this._super(options);
		this.open();
	}
})

});
