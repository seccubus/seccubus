steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'seccubus/models' )
.then( './views/init.ejs', 
       './views/up_to_date.ejs', 
       function($){

/**
 * @class Seccubus.UpToDate.List
 * @parent index
 * @inherits jQuery.Controller
 * Lists up_to_dates and lets you destroy them.
 */
$.Controller('Seccubus.UpToDate.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.UpToDate.findAll()) )
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.up_to_date').model().destroy();
		}
	},
	"{Seccubus.Models.UpToDate} destroyed" : function(UpToDate, ev, up_to_date) {
		up_to_date.elements(this.element).remove();
	},
	"{Seccubus.Models.UpToDate} created" : function(UpToDate, ev, up_to_date){
		this.element.append(this.view('init', [up_to_date]))
	},
	"{Seccubus.Models.UpToDate} updated" : function(UpToDate, ev, up_to_date){
		up_to_date.elements(this.element)
		      .html(this.view('up_to_date', up_to_date) );
	}
});

});