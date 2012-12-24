steal( 'jquery/controller',
       'jquery/view/ejs',
	   'jquery/dom/form_params',
	   'jquery/controller/view',
	   'seccubus/models' )
	.then('./views/init.ejs', function($){

/**
 * @class Seccubus.Notification.Create
 * @parent index
 * @inherits jQuery.Controller
 * Creates notifications
 */
$.Controller('Seccubus.Notification.Create',
/** @Prototype */
{
	init : function(){
		this.element.html(this.view());
	},
	submit : function(el, ev){
		ev.preventDefault();
		this.element.find('[type=submit]').val('Creating...')
		new Seccubus.Models.Notification(el.formParams()).save(this.callback('saved'));
	},
	saved : function(){
		this.element.find('[type=submit]').val('Create');
		this.element[0].reset()
	}
})

});