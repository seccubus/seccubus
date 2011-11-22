// map fixtures for this application

steal("jquery/dom/fixture", function(){
	
        /* UpToDate fixture */
        $.fixture.make("up_to_date", 1, function(i, up_to_date){
                var up2date_status = ["OK", "Update available" ];
                var messages = ["You are using the trunk version (2.0.alpha5) of Seccubus", "Your version $version is up to date", "Version $current is available, please upgrade..."];
                var links = ["","","http://seccubus.com"];
                return {
                        status: $.fixture.rand(up2date_status, 1)[0],
                        message: $.fixture.rand( messages , 1)[0],
                        link: $.fixture.rand( links, 1)[0]
                }
        })

        /* Config Item fixture */
        $.fixture.make("config_item", $.fixture.rand(50), function(i, config_item){
                return {
                        name: "config_item "+i,
                        message: "Message "+i,
                        result: $.fixture.rand( ['OK','Error'] , 1)[0]
                }

	})
	//$.fixture.make("workspace", 5, function(i, workspace){
//		var descriptions = ["grill fish", "make ice", "cut onions"]
//		return {
//			name: "workspace "+i,
//			description: $.fixture.rand( descriptions , 1)[0]
//		}
//	})
})
