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
	/* Workspaces have a static fixture */

	/* Scans */
	$.fixture.make("scan", $.fixture.rand(15), function(i, scan){
		var scanners = ["Nessus", "Nessus Legacy", "OpenVAS", "Nikto", "Nmap" ];
		return {
			id 	: i,
			Name	: $.fixture.rand(scanners,1) + " " + $.fixture.rand(["inside", "outside"], 1) + " " + i,
			Scanner	: $.fixture.rand(scanners,1),
			Parameters : "some params will go here",
			Targets	: $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255),
			Findings : $.fixture.rand(255),
			LastScan : $.fixture.rand(["", "2011-11-11 11:11:11" ],1)
		}
	})

	/* Findings */
	$.fixture.make("finding", 5, function(i, finding){
		var severity = ["High", "Medium", "Low", "None"];
		var findings = ["Here is a sample finding decription", "This is a example finding decription"];
		var remarks = ["Fix it", "Disable it", "Remove it"];
		return {
			id: i,
			HostIP: "192.168." + $.fixture.rand(255) + "." + $.fixture.rand(255) ,
			HostName: "FakeHostName_" + i,
			Port:  $.fixture.rand(65535),
			Plugin:  $.fixture.rand(55000),
			Severity: $.fixture.rand( severity , 1) ,
			Finding:  $.fixture.rand( findings , 1) ,
			Remark:  $.fixture.rand( remarks , 1) 
		}
	})
})
