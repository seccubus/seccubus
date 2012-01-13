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
 * Creates workspaces
 */
$.Controller('Seccubus.Workspace.Create',
/** @ Static */
{
	defaults : {
		onClear	: function() { }
	}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view());
	},
	submit : function(el, ev){
		ev.preventDefault();
		this.element.find('[type=submit]').val('Creating...')
		new Seccubus.Models.Workspace(el.formParams()).save(this.callback('saved'));
	},
	".cancel click" : function() {
		this.clearAll();
	},
	saved : function(){
		this.clearAll();
	},
	clearAll : function() {
		this.element.find('[type=submit]').val('Create');
		this.element[0].reset()
		this.options.onClear();
	}
})

});
