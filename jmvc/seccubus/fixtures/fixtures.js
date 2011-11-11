// map fixtures for this application

steal("jquery/dom/fixture", function(){
	
	$.fixture.make("up_to_date", 1, function(i, up_to_date){
		var up2date_status = ["OK", "Update available" ];
		var messages = ["You are using the trunk version (2.0.alpha5) of Seccubus", "Your version $version is up to date", "Version $current is available, please upgrade..."];
		return {
			status: $.fixture.rand(up2date_status, 1)[0],
			message: $.fixture.rand( messages , 1)[0]
		}
	})
	$.fixture.make("config_item", 5, function(i, config_item){
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			name: "config_item "+i,
			description: $.fixture.rand( descriptions , 1)[0]
		}
	})
})
