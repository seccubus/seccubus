steal('jquery/model', function(){

/**
 * @class Seccubus.Scanner
 * @parent Scanner
 * @inherits jQuery.Model
 * Wraps backend scanner services.  
 * Only has a findAll api
 */
$.Model('Seccubus.Models.Scanner',
/* @Static */
{
	findAll: "json/getScanners.pl"
  	//findOne : "/scanners/{id}.json", 
  	//create : "/scanners.json",
 	//update : "/scanners/{id}.json",
  	//destroy : "/scanners/{id}.json"
},
/* @Prototype */
{});

})
