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
 * @class Seccubus.Workspace.Select
 * @parent Workspace
 * @inherits jQuery.Controller
 * Builds a dropdown selector of workspaces
 */
$.Controller('Seccubus.Workspace.Select',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(el, fn){
		this.updateView();
	},
	"{Seccubus.Models.Workspace} destroyed" : function(Workspace, ev, workspace) {
		this.updateView();
	},
	"{Seccubus.Models.Workspace} created" : function(Workspace, ev, workspace){
		this.updateView();
	},
	"{Seccubus.Models.Workspace} updated" : function(Workspace, ev, workspace){
		workspace.elements(this.element)
		      .html(this.view('workspace', workspace) );
	},
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				Seccubus.Models.Workspace.findAll()
			) 
		);
	}

}); // Controller

}); // Steal
