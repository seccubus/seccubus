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
},
/* @Prototype */
{});

})
