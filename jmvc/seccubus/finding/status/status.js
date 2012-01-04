steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Finding.Status
 */
$.Controller('Seccubus.Finding.Status',
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
					Seccubus.Models.Finding.findAll({
						workspaceId	: this.options.workspace
					}),
					{
						fScans		: this.options.scans,
						sStatus		: this.options.status,
						fHost		: this.options.host,
						fHostName	: this.options.hostName,
						fPort		: this.options.port,
						fPlugin		: this.options.plugin,
					}
				)
			);
		}
	},
	"{Seccubus.Models.Finding} created" : function(Finding, ev, finding) {
		this.updateView();
	},
	"{Seccubus.Models.Finding} updated" : function(Finding, ev, finding) {
		this.updateView();
	},
	"{Seccubus.Models.Finding} destroyed" : function(Finding, ev, finding) {
		this.updateView();
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
