steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Finding.Status
 * @parent Finding
 * Control that renders status selection buttons with find counts
 */
$.Controller('Seccubus.Finding.Status',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options in its attributes
	 */
	defaults : {
		/*
	 	 * @attribute options.workspace
		 * Currently seleced workspace -1 means no workspace
	 	 */
		workspace	: -1,
		/*
	 	 * @attribute options.scan
		 * Array of currently selected scans
	 	 */
		scans		: null,
		/*
	 	 * @attribute options.status
		 * The current findStatus
	 	 */
		status		: 1,
		/*
	 	 * @attribute options.host
		 * The current host filter
	 	 */
		host		: "*",
		/*
	 	 * @attribute options.hostName
		 * The current hostName filter
	 	 */
		hostName	: "*",
		/*
	 	 * @attribute options.port
		 * The current port filter
	 	 */
		port		: "*",
		/*
	 	 * @attribute options.plugin
		 * The current plugin filter
	 	 */
		plugin		: "*",
		/*
	 	 * @attribute options.onClick
		 * Function to be execute on clicking one of the buttons
	 	 */
		onClick 	: function(value) { },
		/*
	 	 * @attribute options.updateOnClick
		 * Boolean that determines if the control should update itself 
		 * when one of the buttons is clicked
	 	 */
		updateOnClick	: true
	}
},
/** @Prototype */
{
	/*
	 * Calls updateView to update itself
	 */
	init : function(){
		this.updateView();
	},
	'.setStatus click' : function(el) {
		$('.setStatus').attr("disabled",false);
		$(el).attr("disabled",true);
		this.options.status = el.val();
		this.options.onClick(this.options.status);
		if ( this.options.updateOnClick ) {
			this.updateView();
		}
	},
	/*
	 * This function renders the controller
	 */
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
						fPlugin		: this.options.plugin
					}
				)
			);
		}
	},
	// (Re-)render the controller on create
	"{Seccubus.Models.Finding} created" : function(Finding, ev, finding) {
		this.updateView();
	},
	// (Re-)render the controller on update
	"{Seccubus.Models.Finding} updated" : function(Finding, ev, finding) {
		this.updateView();
	},
	// (Re-)render the controller on delete
	"{Seccubus.Models.Finding} destroyed" : function(Finding, ev, finding) {
		this.updateView();
	},
	/*
	 * Overloaded to rerender the controller on controller update
	 */
	update : function(options){
		this._super(options);
		this.updateView();
	},
	/*
	 * Function that returns the current status
	 * @return {Integer} Numeric status
	 */
	getStatus : function() {
		return this.options.status;
	}
}) // Controller

}); // Steal
