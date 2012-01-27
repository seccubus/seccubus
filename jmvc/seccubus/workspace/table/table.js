steal(	
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
     )
.then( './views/init.ejs', 
       './views/workspace.ejs', 
	'plugins/jquery.dataTables.js',
       function($){

/**
 * @class Seccubus.Workspace.Table
 * @parent Workspace
 * @inherits jQuery.Controller
 * Lists workspaces in a table and lets you destroy them.
 *
 * Warning
 * =======
 * This code isn't finished yet
 */
$.Controller('Seccubus.Workspace.Table',
/** @Static */
{
	defaults : {
	/*
	 	* @attribute options.onEdit
	 	* Function that will be called when an edit link is clicked
	 	* The funciton will received the workspace object that belongs 
		* to the edit link as the object
	 	*/
		onEdit : function(ws) { 
			alert("Error: onEdit function not set\nWorkspace id : " + ws.id);
		}
	}
},
/** @Prototype */
{
	init : function(el, fn){
		var dfd = Seccubus.Models.Workspace.findAll();
	    	element = this.element;
		element.html(this.view('init', dfd));
		dfd.success(function() {
	        	element.children("table:first").dataTable();
		});
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.workspace').model().destroy();
		}
	},
	'.edit click' : function( el ) {
		var ws = el.closest('.workspace').model();
		this.options.onEdit(ws);
	},
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
