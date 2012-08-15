steal('jquery/model', function(){

/**
 * @class Seccubus.Models.UpToDate
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend up_to_date services.  
 */
$.Model('Seccubus.Models.UpToDate',
/* @Static */
{
	findAll: "api/UpToDate.json.pl" //,
  	//findOne : "/up_to_dates/{id}.json", 
},
/* @Prototype */
{});

})
