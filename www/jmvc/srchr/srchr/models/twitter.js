steal.plugins("jquery/model/service/twitter").then(function(){
//get the yql service
var twitterSearch = $.Model.service.twitter({from: "search.json",
url: "http://search.twitter.com/"})

$.Model.extend("Srchr.Models.Twitter",{
	findAll : function(params, success, error){

		// convert our query param for use in the flickr service
		twitterSearch.findAll.call( this,
			{where: {q: params.query}}, 
			success, 
			error);
		
	}
},{
	
});


});