
steal.plugins("jquery/model/service/yql").then(function(){
//get the yql service
var yahoo = $.Model.service.yql({from: "search.images"})

$.Model.extend("Srchr.Models.Yahoo",{
	findAll : function(params, success, error){

		// convert our query param for use in the flickr service
		yahoo.findAll.call( this,
			{where: ["query='#{query}' and appid='YahooDemo'",params]}, 
			success, 
			error);
		
	}
},{
	
});



});