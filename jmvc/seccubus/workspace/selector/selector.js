steal(	
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
     )
.then( './views/init.ejs', 
       './views/workspace.ejs', 
       function($){

/**
 * @class Seccubus.Workspace.Table
 * @parent Workspace
 * @inherits jQuery.Controller
 * Builds a dropdown selector of workspaces
 */
$.Controller('Seccubus.Workspace.Selector',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(el, fn){
		var dfd = Seccubus.Models.Workspace.findAll();
		element = this.element;
		element.html(this.view('init', dfd));
		dfd.success(function() {
			//element.children("table:first").dataTable();
		});
		//this.element.html(this.view('init',Seccubus.Models.Workspace.findAll()) );
	},
	/* Not supported here *
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.workspace').model().destroy();
		}
	},
	**********************/
	"{Seccubus.Models.Workspace} destroyed" : function(Workspace, ev, workspace) {
		workspace.elements(this.element).remove();
	},
	"{Seccubus.Models.Workspace} created" : function(Workspace, ev, workspace){
		this.element.append(this.view('init', [workspace]))
	},
	"{Seccubus.Models.Workspace} updated" : function(Workspace, ev, workspace){
		workspace.elements(this.element)
		      .html(this.view('workspace', workspace) );
	}
});

});
