steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/finding.ejs',
	'./views/no_workspace.ejs',
function($){

/**
 * @class Seccubus.Finding.Table
 */
$.Controller('Seccubus.Finding.Table',
/** @Static */
{
	defaults : {
		workspace	: -1,
		scans		: null
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	updateView : function() {
		if ( this.options.workspace < 0  ) {
			this.element.html(
				this.view('no_workspace')
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('no_scan')
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
