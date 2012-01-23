steal( 	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' 
).then( './views/init.ejs', 
	'./views/help.ejs',
function($){

/**
 * @class Seccubus.Scanner.Select
 * @parent Scanner
 * @inherits jQuery.Controller
 * Renders a control to select a scanner and show some help
 * @param {Object} options
 * Defines the options for this control
 */
$.Controller('Seccubus.Scanner.Select',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.helpHere
		 * jQuery query string that determines where the help text
		 * should be put
		 * Default value: null
		 * Special value: null - Don't render help
		 */
		helpHere : null
	}
},
/** @Prototype */
{
	/* Calls updateView to render the control */
	init : function(){
		this.updateView();
	},
	"Seccubus.Models.Scanner destroyed" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	"Seccubus.Models.Scanner created" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	"Seccubus.Models.Scanner updated" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	"change" : function() {
		this.updateHelp();
	},
	/* Renders the control */
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				Seccubus.Models.Scanner.findAll()
			)
		);
		this.updateHelp();
	},
	/* 
	 * Renders the help text in the jQuery query string options.helpHere
	 * if options.helpHere is set to null it does not render the help text
	 */
	updateHelp : function() {
		if( this.options.helpHere != null ) {
			$(this.options.helpHere).html(
				this.view(
					'help',
					{
						message : this.element.children("option:selected").attr("help")
					}
				)
			)
		}
	}
}); // Controller

}); // Steal
