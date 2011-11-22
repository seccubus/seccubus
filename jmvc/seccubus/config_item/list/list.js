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
	 */
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.ConfigItem.findAll()) )
	}
	//},
	//'.destroy click': function( el ){
	//	if(confirm("Are you sure you want to destroy?")){
	//		el.closest('.config_item').model().destroy();
	//	}
	//},
	//"{Seccubus.Models.ConfigItem} destroyed" : function(ConfigItem, ev, config_item) {
	//	config_item.elements(this.element).remove();
	//},
	//"{Seccubus.Models.ConfigItem} created" : function(ConfigItem, ev, config_item){
	//	this.element.append(this.view('init', [config_item]))
	//},
	//"{Seccubus.Models.ConfigItem} updated" : function(ConfigItem, ev, config_item){
	//	config_item.elements(this.element)
	//	      .html(this.view('config_item', config_item) );
	//}
});

});
