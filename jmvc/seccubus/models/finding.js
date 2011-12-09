steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Finding
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend finding services.  
 */
$.Model('Seccubus.Models.Finding',
/* @Static */
{
	findAll: "/findings.json",
  	findOne : "/findings/{id}.json", 
  	create : "/findings.json",
 	update : "/findings/{id}.json",
  	destroy : "/findings/{id}.json"
},
/* @Prototype */
{});

})