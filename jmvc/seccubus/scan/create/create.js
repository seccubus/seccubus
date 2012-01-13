steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Scan.Create
 * @parent Scan
 * @inherits jQuery.Controller
 * Generates a dialog to create scans
 *
 * Warning
 * =======
 * This code is unfished
 *
 * Story
 * -----
 * As a user I would like to be able tot create scans from the GUI
 */
$.Controller('Seccubus.Scan.Create',
/** @Prototype */
{
	init : function(){
		this.element.html(this.view());
	},
	submit : function(el, ev){
		ev.preventDefault();
		this.element.find('[type=submit]').val('Creating...')
		new Seccubus.Models.Scan(el.formParams()).save(this.callback('saved'));
	},
	saved : function(){
		this.element.find('[type=submit]').val('Create');
		this.element[0].reset()
	}
})

});
