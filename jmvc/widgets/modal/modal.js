steal(	'jquery/controller',
	'jquery/view/ejs' ,
	'./modal.css'
).then( './views/init.ejs', 
	function($){

/**
 * @class Widgets.Modal
 */
$.Controller('Widgets.Modal',
/** @Static */
{
	defaults : {
		query : "",
		message : "Hello World",
	}
},
/** @Prototype */
{
	init : function(){
		this.element.html("//widgets/modal/views/init.ejs",{
			message: this.options.message
		});

		// Find out what to show
		var id;
		if ( this.options.query ) {
			id = this.options.query;
			$(id).addClass('widgetsModalWindow');
		} else {
			id = "#widgetsModalDialog";
		}

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
	},
	".close click" : function() {
		this.close();
	},
	".mask click" : function() {
		this.close();
	},
	close : function() {
		$('#widgetsModalMask').hide();
		if ( this.options.query ) {
			$(this.options.query).removeClass('widgetsModalWindow');
		}
		this.element.html("");
	},
	update : function(options) {
		this._super(options);
		this.init();
	}
})

});
