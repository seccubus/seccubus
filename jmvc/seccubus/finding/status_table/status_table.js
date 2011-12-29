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
		status		: 1,
		onClick 	: function(value) { },
		updateOnClick	: true,
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.setStatus click' : function(el) {
		this.options.status = el.val();
		this.options.onClick(this.options.status);
		if ( this.options.updateOnClick ) {
			this.updateView();
		}
	},
	updateView : function() {
		if ( this.options.workspace < 0  ) {
			this.element.html(
				this.view('error', {sStatus : this.options.status})
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('error', {sStatus : this.options.status})
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Finding.findAll(), {
						fScans : this.options.scans,
						sStatus : this.options.status,
					}
				)
			);
		}
	},
	update : function(options){
		this._super(options);
		this.updateView();
	},
	getStatus : function() {
		return this.options.status;
	}
}) // Controller

}); // Steal
