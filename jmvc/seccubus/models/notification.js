steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Notification
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend notification services.  
 */
$.Model('Seccubus.Models.Notification',
/* @Static */
{
	findAll: "/notifications.json",
  	findOne : "/notifications/{id}.json", 
  	create : "/notifications.json",
 	update : "/notifications/{id}.json",
  	destroy : "/notifications/{id}.json"
},
/* @Prototype */
{});

})