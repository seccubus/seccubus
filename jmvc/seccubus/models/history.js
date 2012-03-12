steal('jquery/model', function(){

/**
 * @class Seccubus.Models.History
 * @parent History
 * @inherits jQuery.Model
 * Wraps backend history services.  
 */
$.Model('Seccubus.Models.History',
/* @Static */
{
	findAll: "POST json/getFindingHistory.pl"
  	//findOne : "/histories/{id}.json", 
  	//create : "/histories.json",
 	//update : "/histories/{id}.json",
  	//destroy : "/histories/{id}.json"
},
/* @Prototype */
{});

})
