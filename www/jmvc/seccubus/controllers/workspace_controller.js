/**
 * @parent index
 * Displays a table of workspaces.	 Lets the user 
 * ["Seccubus.Controllers.Workspace.prototype.form submit" create], 
 * ["Seccubus.Controllers.Workspace.prototype.&#46;edit click" edit],
 * or ["Seccubus.Controllers.Workspace.prototype.&#46;destroy click" destroy] workspaces.
 */
$.Controller.extend('Seccubus.Controllers.Workspace',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all workspaces to be displayed.
 */
 "{window} load": function(){
	if(!$("#workspace").length){
	 $(document.body).append($('<div/>').attr('id','workspace'));
		 Seccubus.Models.Workspace.findAll({}, this.callback('list'));
 	}
 },
 /**
 * Displays a list of workspaces and the submit form.
 * @param {Array} workspaces An array of Seccubus.Models.Workspace objects.
 */
 list: function( workspaces ){
	$('#workspace').html(this.view('init', {workspaces:workspaces} ));
 },
 /**
 * Responds to the create form being submitted by creating a new Seccubus.Models.Workspace.
 * @param {jQuery} el A jQuery wrapped element.
 * @param {Event} ev A jQuery event whose default action is prevented.
 */
'form submit': function( el, ev ){
	ev.preventDefault();
	new Seccubus.Models.Workspace(el.formParams()).save();
},
/**
 * Listens for workspaces being created.	 When a workspace is created, displays the new workspace.
 * @param {String} called The open ajax event that was called.
 * @param {Event} workspace The new workspace.
 */
'workspace.created subscribe': function( called, workspace ){
	$("#workspace tbody").append( this.view("list", {workspaces:[workspace]}) );
	$("#workspace form input[type!=submit]").val(""); //clear old vals
},
 /**
 * Creates and places the edit interface.
 * @param {jQuery} el The workspace's edit link element.
 */
'.edit click': function( el ){
	var workspace = el.closest('.workspace').model();
	workspace.elements().html(this.view('edit', workspace));
},
 /**
 * Removes the edit interface.
 * @param {jQuery} el The workspace's cancel link element.
 */
'.cancel click': function( el ){
	this.show(el.closest('.workspace').model());
},
 /**
 * Updates the workspace from the edit values.
 */
'.update click': function( el ){
	var $workspace = el.closest('.workspace'); 
	$workspace.model().update($workspace.formParams());
},
 /**
 * Listens for updated workspaces.	 When a workspace is updated, 
 * update's its display.
 */
'workspace.updated subscribe': function( called, workspace ){
	this.show(workspace);
},
 /**
 * Shows a workspace's information.
 */
show: function( workspace ){
	workspace.elements().html(this.view('show',workspace));
},
 /**
 *	 Handle's clicking on a workspace's destroy link.
 */
'.destroy click': function( el ){
	if(confirm("Are you sure you want to destroy?")){
		el.closest('.workspace').model().destroy();
	}
 },
 /**
 *	 Listens for workspaces being destroyed and removes them from being displayed.
 */
"workspace.destroyed subscribe": function(called, workspace){
	workspace.elements().remove();	 //removes ALL elements
 }
});