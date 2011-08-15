
steal.plugins("jquery/model/service/yql").then(function(){

//get a yql service for upcoming events
var upcoming = $.Model.service.yql({from: "upcoming.events"})

$.Model.extend("Srchr.Models.Upcoming",{
	findAll : function(params, success, error){
		var self = this;
		// convert our query param for use in the flickr service
		upcoming.findAll.call(this,
			{ where: ["description LIKE '%#{query}%' OR name LIKE '%#{query}%' OR tags='#{query}'",params] }, 
			success, 
			error);
		
	}
},{})



});