steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Scan
 * @parent Scan
 * @inherits jQuery.Model
 * Wraps backend scan services.  
 */
$.Model('Seccubus.Models.Scan',
/* @Static */
{
	//findAll : "json/getScans.pl",
	findAll : function(params,success,error){
		return $.ajax({
			url	: "json/getScans.pl",
			type	: "get",
			dataType: "json scan.models",
			data	: params,
			success	: success,
			error	: error
		});
	},
  	findOne	: "/scans/{id}.json", 
  	create	: "/scans.json",
 	update	: "/scans/{id}.json",
  	destroy	: "/scans/{id}.json"
},
/* @Prototype */
{});

})
