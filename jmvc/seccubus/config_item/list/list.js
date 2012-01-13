steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'seccubus/models' )
.then( './views/init.ejs', 
       './views/config_item.ejs', 
       function($){

/**
 * @class Seccubus.ConfigItem.List
 * @parent ConfigItem
 * @inherits jQuery.Controller
 * Lists config_items
 */
$.Controller('Seccubus.ConfigItem.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	/**
	 * The init function renders the ConfigItem list by calling the findAll
	 * function on the model and rendering the list/init.ejs view
	 * @return undefined
	 */
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.ConfigItem.findAll()) )
	}
});

});
