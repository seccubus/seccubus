steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'seccubus/models'
).then( './views/init.ejs', 
	function($){

/**
 * @class Seccubus.Finding.Bulkedit
 * @parent Finding
 * @inherits jQuery.Controller
 * Controller that renders a form to edit multiple findings in one go and 
 * updates the findings via Seccubus.Models.Finding.List
 */
$.Controller('Seccubus.Finding.Bulkedit',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options
	 */
	defaults : {
		/*
		 * @attribute options.status
		 * The current status, this prevents status selections that are
		 * invalid from showning up
		 * - Default value: 1
		 */
		status	: 1,
		/*
		 * @attribute: options.workspace
		 * The currently selected workspace. Need to be provides to the 
		 * model for a correct update
		 * - Default value: -1
		 * - Special value: -1 - No workspace selected
		 */
		workspace : -1
	}
},
/** @Prototype */
{
	/*
	 * Init calls updateView to render the view
	 */
	init : function(){
		this.updateView();
	},
	/*
	 * This function is called when the form is submitted. It prevents the
	 * default event and calls bulkUpdate to perform a bulk update
	 */
	submit : function(el, ev) {
		ev.preventDefault();
		var params = this.element.formParams();
		this.bulkUpdate();
	},
	// Handles clicks on the save button
	".bulkSetStatus click" : function(el, ev) {
		ev.preventDefault();
		$(el).val("Saving...");
		var newStatus = $(el).attr("newStatus");
		$('#bulkEditStatus').val(newStatus);
		var params = this.element.formParams();
		this.bulkUpdate();
	},
	/*
	 * This functions get a model list of all findings with a checked
	 * object of class selectFinding and updates them via the model
	 */
	bulkUpdate : function() {
		var findings = $(".selectFinding[checked=checked]").closest(".finding").models();
		var params = this.element.formParams();
		params.workspaceId = this.options.workspace;
		findings.update(params,this.callback('saved'));
	},
	/*
	 * This is the callback function for update on the list
	 */
	saved : function() {
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset();
		this.updateView();
	},
	/*
	 * This function updates the view
	 */
	updateView : function() {
		this.element.html(this.view('init',{
			workspace 	: this.options.workspace,
			status		: this.options.status
		}));
	},
	/*
	 * The update funciton is overloaded to allways call updateView on a 
	 * controller update
	 */
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
