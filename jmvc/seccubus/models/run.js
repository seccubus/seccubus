steal('jquery/model', function(){

/**
 * @class Seccubus.Run
 * @parent Run
 * @inherits jQuery.Model
 * Wraps backend run services.  
 */
$.Model('Seccubus.Models.Run',
/* @Static */
{
	findAll: "POST json/getRuns.pl",
  	//findOne : "/runs/{id}.json", 
  	//create : "/runs.json",
 	//update : "/runs/{id}.json",
  	//destroy : "/runs/{id}.json"
},
/* @Prototype */
{});

})
