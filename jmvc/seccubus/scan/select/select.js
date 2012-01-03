steal( 'jquery/controller',
       'jquery/view/ejs',
       'jquery/controller/view',
       'seccubus/models' )
.then( './views/init.ejs', 
       './views/scan.ejs', 
       './views/error.ejs',
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
	defaults : {
		workspace : -1
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.scan').model().destroy();
		}
	},
	"{Seccubus.Models.Scan} destroyed" : function(Scan, ev, scan) {
		this.updateView();
	},
	"{Seccubus.Models.Scan} created" : function(Scan, ev, scan){
		this.updateView();
	},
	"{Seccubus.Models.Scan} updated" : function(Scan, ev, scan){
		scan.elements(this.element)
		      .html(this.view('scan', scan) );
	},
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			this.element.html(
				this.view(
					'error',
					{message : "No workspace selected" }
				)
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Scan.findAll({
						workspaceId : this.options.workspace
					}),
					{selectedWorkspace : this.options.workspace }
				) 
			);
		}
	},
	update : function(options){
		this._super(options);
		this.updateView();
	}
});

});
