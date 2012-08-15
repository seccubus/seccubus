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
	/* This funciton calls updateView to render the control
	 */
	init : function(el, fn){
		this.updateView();
	},
	// (re-)Render on delete
	"{Seccubus.Models.Workspace} destroyed" : function(Workspace, ev, workspace) {
		this.updateView();
	},
	// (re-)Render on create
	"{Seccubus.Models.Workspace} created" : function(Workspace, ev, workspace){
		this.updateView();
	},
	// Apend on update
	"{Seccubus.Models.Workspace} updated" : function(Workspace, ev, workspace){
		workspace.elements(this.element)
		      .html(this.view('workspace', workspace) );
	},
	/*
	 * This fuction rerenders the entire control with data from findAll
	 */
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
