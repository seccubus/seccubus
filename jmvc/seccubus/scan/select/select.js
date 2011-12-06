steal( 'jquery/controller',
       'jquery/view/ejs',
       'jquery/controller/view',
       'seccubus/models' )
.then( './views/init.ejs', 
       './views/scan.ejs', 
       function($){

/**
 * @class Seccubus.Scan.Select
 * @parent Scan
 * @inherits jQuery.Controller
 * Selects scans 
 */
$.Controller('Seccubus.Scan.Select',
/** @Static */
{
	defaults : {}
	// The count of the previous number of elements
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.Scan.findAll()) )
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.scan').model().destroy();
		}
	},
	"{Seccubus.Models.Scan} destroyed" : function(Scan, ev, scan) {
		scan.elements(this.element).remove();
	},
	"{Seccubus.Models.Scan} created" : function(Scan, ev, scan){
		// Append the append view (init view without select tags) to 
		// the select element inside the element
		this.element.children('select').append(this.view('append', [scan]))
	},
	"{Seccubus.Models.Scan} updated" : function(Scan, ev, scan){
		scan.elements(this.element)
		      .html(this.view('scan', scan) );
	}
});

});
