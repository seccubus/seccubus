steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'seccubus/models' )
.then( './views/init.ejs', 
       './views/up_to_date.ejs', 
       function($){

/**
 * @class Seccubus.UpToDate.List
 * @parent UpToDate
 * @inherits jQuery.Controller
 * c$Renders a list that shows if Seccubus is up to date
 */
$.Controller('Seccubus.UpToDate.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	/**
	 * The init function displays the list by rendern the list/init.ejs view
	 * with data obtained by calling the findAll funciton of the UpToDate 
	 * model
	 */
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.UpToDate.findAll()) )
	}
});

});
