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
//findOne : "/workspaces/{id}.json", 
//update : "/workspaces/{id}.json",
//destroy : "/workspaces/{id}.json"
{
	findAll: "json/getWorkspaces.pl",
  	create : "json/createWorkspace.pl",
},
/* @Prototype */
{});

})
