
steal.plugins("jquery/model/service/yql").then(function(){
//get the yql service
var flickr = $.Model.service.yql({from: "flickr.photos.search"})

$.Model.extend("Srchr.Models.Flickr",{
	findAll : function(params, success, error){
		// convert our query param for use in the flickr service
		
		flickr.findAll.call(this, //returns instances of Flickr
			
			{ where: ["has_geo='true' AND text='#{query}'",params] }, 
			success, 
			error);

	}
},{})


});

