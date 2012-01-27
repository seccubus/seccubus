steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Workspace
 * @parent Workspace
 * @inherits jQuery.Model
 * Wraps backend workspace services.  
 */
$.Model('Seccubus.Models.Workspace',
/* @Static */
// Not implemented:
//destroy : "/workspaces/{id}.json"
{
  	create : "POST json/createWorkspace.pl",
	findAll: "POST json/getWorkspaces.pl",
	//findOne: "POST json/getWorkspace.pl",
	update : "POST json/updateWorkspace.pl",
},
/* @Prototype */
{});

})
