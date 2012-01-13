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
	/*
	 * @function findAll
	 * Finds all UpToDate statusses. Since there can only be one status, 
	 * one row will be returned
	 * @return {Deferred} Deferred with all (1) UpToDate objects in it
	 */
	findAll: "json/UpToDate.pl"
},
/* @Prototype */
{});

})
