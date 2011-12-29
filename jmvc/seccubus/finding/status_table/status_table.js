steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Finding.StatusTable
 */
$.Controller('Seccubus.Finding.StatusTable',
/** @Static */
{
	defaults : {
		workspace	: -1,
		scans		: null,
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.setStatus clicked' : function(el) {
		alert("Yes we did it");
	},
	updateView : function() {
		if ( this.options.workspace < 0  ) {
			this.element.html(
				this.view('error', {message : "Please select a workspace to start"})
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('error', {message : "Please select one or more scans"})
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Finding.findAll(), {
						fScans : this.options.scans,
					}
				)
			);
		}
	},
	update : function(options){
		this._super(options);
		this.updateView();
	}
}) // Controller

}); // Steal
