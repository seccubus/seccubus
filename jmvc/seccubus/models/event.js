steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Event
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend event services.  
 */
$.Model('Seccubus.Models.Event',
/* @Static */
{
	findAll: "POST json/getEvents.pl"
  	//findOne : "/events/{id}.json", 
  	//create : "/events.json",
 	//update : "/events/{id}.json",
  	//destroy : "/events/{id}.json"
},
/* @Prototype */
{});

})
