steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Scan
 * @parent Scan
 * @inherits jQuery.Model
 * Wraps backend scan services.  
 */
$.Model('Seccubus.Models.Scan',
/* @Static */
{
	findAll: "/scans.json",
  	findOne : "/scans/{id}.json", 
  	create : "/scans.json",
 	update : "/scans/{id}.json",
  	destroy : "/scans/{id}.json"
},
/* @Prototype */
{});

})
