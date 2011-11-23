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
	findAll: "/workspaces.json",
  	findOne : "/workspaces/{id}.json", 
  	create : "/workspaces.json",
 	update : "/workspaces/{id}.json",
  	destroy : "/workspaces/{id}.json"
},
/* @Prototype */
{});

})
