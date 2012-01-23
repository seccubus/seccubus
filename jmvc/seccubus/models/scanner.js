steal('jquery/model', function(){

/**
 * @class Seccubus.Scanner
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend scanner services.  
 */
$.Model('Seccubus.Models.Scanner',
/* @Static */
{
	findAll: "/scanners.json",
  	//findOne : "/scanners/{id}.json", 
  	//create : "/scanners.json",
 	//update : "/scanners/{id}.json",
  	//destroy : "/scanners/{id}.json"
},
/* @Prototype */
{});

})
