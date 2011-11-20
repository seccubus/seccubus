steal('jquery/model', function(){

/**
 * @class Seccubus.Models.ConfigItem
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend config_item services.  
 */
$.Model('Seccubus.Models.ConfigItem',
/* @Static */
{
	findAll: "api/ConfigTest.json.pl",
  	//findOne : "/config_items/{id}.json", 
  	//create : "/config_items.json",
 	//update : "/config_items/{id}.json",
  	//destroy : "/config_items/{id}.json"
},
/* @Prototype */
{});

})
