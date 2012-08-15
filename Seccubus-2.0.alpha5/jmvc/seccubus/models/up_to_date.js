steal('jquery/model', function(){

/**
 * @class Seccubus.Models.UpToDate
 * @parent UpToDate
 * @inherits jQuery.Model
 * Wraps backend up_to_date services.  
 */
$.Model('Seccubus.Models.UpToDate',
/* @Static */
{
	/**
	 * Finds all UpToDate statusses. Since there can only be one status, 
	 * one row will be returned
	 */
	findAll: "api/UpToDate.json.pl"
},
/* @Prototype */
{});

})
