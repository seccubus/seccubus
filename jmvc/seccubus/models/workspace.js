steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Workspace
 * @parent Workspace
 * @inherits jQuery.Model
 * Wraps backend workspace services.  
 */
$.Model('Seccubus.Models.Workspace',
/* @Static */
{
	findAll: "json/getWorkspaces.pl",
  	//findOne : "/workspaces/{id}.json", 
  	create : "json/createWorkspace.json",
 	//update : "/workspaces/{id}.json",
  	//destroy : "/workspaces/{id}.json"
},
/* @Prototype */
{});

})
