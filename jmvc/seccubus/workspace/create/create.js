steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models'
).then(	'./views/init.ejs', 
	function($){

/**
 * @class Seccubus.Workspace.Create
 * @parent Workspace
 * @inherits jQuery.Controller
 * Renders the content of a form to create a workspace and handles creation
 */
$.Controller('Seccubus.Workspace.Create',
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
		onClear	: function() { }
	}
},
/** @Prototype */
{
	/*
	 * Redeners the form
	 */
	init : function(){
		this.element.html(this.view());
	},
	/*
	 * This function is triggered when a form is submitted. It prevents the 
	 * default event, and uses the form parameters to create a new Workspace
	 * @param {Object} el 
	 * The element that is submitted
	 * @param {Object} ev
	 * The submit event itself
	 */
	submit : function(el, ev){
		ev.preventDefault();
		this.element.find('[type=submit]').val('Creating...')
		var param = el.formParams();
		param.scanCount = 0;
		param.findCount = 0;
		param.lastScan = null;
		new Seccubus.Models.Workspace(param).save(this.callback('saved'));
	},
	".cancel click" : function() {
		this.clearAll();
	},
	/* 
	 * This function is the callback for the submit function. It is called 
	 * when the object was successfully created through the model
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
		this.element.find('[type=submit]').val('Create');
		this.element[0].reset()
		this.options.onClear();
	}
})

});
