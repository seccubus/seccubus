steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models'
).then(	'./views/init.ejs', 
	function($){

/**
 * @class Seccubus.Workspace.Edit
 * @parent Workspace
 * @inherits jQuery.Controller
 * Renders the content of a form to edit a workspace and handles creation
 */
$.Controller('Seccubus.Workspace.Edit',
/** @Static */
{
	/*
	 * @attribute options 
	 * Object that contains all options
	 */
	defaults : {
		/*
		 * @attribute options.onClear
		 * Function that is called when the form is cleared, e.g. to 
		 * disable a modal display
		 */
		onClear	: function() { },
		workspace : { id : -1}
	}
},
/** @Prototype */
{
	/*
	 * Redeners the form
	 */
	init : function(){
		this.updateView();
	},
	updateView : function() {
		if ( this.options.workspace.id == -1 ) {
			alert("Error: no workspace provided to Seccubus.Workspace.Edit");
		} else {
			this.element.html(this.view('init',this.options.workspace));
		}
	},
	/*
	 * This function is triggered when a form is submitted. It prevents the 
	 * default event, and uses the form parameters to edit a Workspace 
	 * object
	 * @param {Object} el 
	 * The element that is submitted
	 * @param {Object} ev
	 * The submit event itself
	 */
	submit : function(el, ev){
		ev.preventDefault();
		this.element.find('[type=submit]').val('Updating...')
		this.options.workspace.attr("name",el.formParams().name);
		this.options.workspace.save(this.callback('saved'));
	},
	".cancel click" : function() {
		this.clearAll();
	},
	/* 
	 * This function is the callback for the submit function. It is called 
	 * when the object was successfully edit through the model
	 * It calls clearAll to clear the form
	 */
	saved : function(){
		this.clearAll();
	},
	/*
	 * This function clears the form and calls the onClear function defined
	 * in options.onClear
	 */
	clearAll : function() {
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset()
		this.options.onClear();
	},
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
