steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/finding.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Finding.Table
 */
$.Controller('Seccubus.Finding.Table',
/** @Static */
{
	defaults : {
		workspace	: -1,
		scans		: null,
		status		: 1,
		host		: "*",
		hostName	: "*",
		port		: "*",
		plugin		: "*",
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
				this.view('error',{message : "Please select a workspace first"})
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('error',{message : "Please select one or more scans"})
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Finding.findAll(), {
						fStatus		: this.options.status,
						fScans		: this.options.scans,
						fHost		: this.options.host,
						fHostName	: this.options.hostName,
						fPort		: this.options.port,
						fPlugin		: this.options.plugin,
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
