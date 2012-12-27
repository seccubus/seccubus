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
	findAll: "POST json/getNotifications.pl",
  	//findOne : "/notifications/{id}.json", 
  	create : "POST json/createNotification.pl",
 	//update : "/notifications/{id}.json",
  	destroy : "POST json/deleteNotification.pl"
},
/* @Prototype */
{});

})
