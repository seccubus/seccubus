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
	var scanFixtures = [];
	var noScans = $.fixture.rand(15)+8;
	var scanners = ["Nessus", "Nessus Legacy", "OpenVAS", "Nikto", "Nmap" ];
	for(var i = 0;i < noScans;i++) {
		scanFixtures[i] = {
			id 	: i,
			workspace : $.fixture.rand(7)+1,
			name	: $.fixture.rand(scanners,1) + " " + $.fixture.rand(["inside", "outside"], 1) + " " + i,
			scanner	: $.fixture.rand(scanners,1),
			parameters : "some params will go here",
			targets	: $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255),
			noFindings : $.fixture.rand(255),
			lastScan : $.fixture.rand(["", "2011-11-11 11:11:11" ],1)
		}
	}

	$.fixture("json/getScans.pl", function(orig, settings, headers) {
		var selected = {};
		for(var i = 0; i < scanFixtures.length;i++) {
			if ( scanFixtures[i].workspace == orig.data.workspaceId ) {
				if ( typeof selected[0] == "undefined" ) {
					selected = [];
				}
				selected.push(scanFixtures[i]);
			}
		}
		return [selected];
	});

	/* Findings */
	var findingFixtures = [];
	var noFindings = 2500;
	var finds = [
		"OSVDB-637: GET : Enumeration of users is possible by requesting ~username (responds with 'Forbidden' for users, 'not found' for non-existent users).",
		"OSVDB-3268: GET : /icons/: Directory indexing found.",
		"Port 22/tcp is open.\nService was identified as ssh",
		"Port 80/tcp is open.\nService was identified as www",
		"Remote listeners enumeration\nUsing netstat, it is possible to identify daemons listening on the remote\nport.\n\nPlugin output:\nThe Linux process '/opt/nessus/sbin/nessusd' is listening on this port.\n\nDescription:\nBy logging into the remote host and using the Linux-specific 'netstat\n-anp' command, it was possible to obtain the name of the processe\nlistening on the remote port.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None",
		"Service Detection\nThe remote service could be identified.\n\nPlugin output:\nA web server is running on this port.\n\nDescription:\nIt was possible to identify the remote service by its banner or by looking\nat the error message it sends when it receives an HTTP request.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None"
	];
	var remarks = ["Fix it", "Disable it", "Remove it","","","Duh..."];
	var severity = ["Not set","High", "Medium", "Low", "Note"];
	var status = ["New","Changed", "Open", "No issue", "Gone", "Closed", "MASKED"][status_id];
	for(var i = 0;i < noFindings;i++) {
		var severity_id = $.fixture.rand(5);
		var status_id = $.fixture.rand(7);
		status_id = [1,2,3,4,5,6,99][status_id];
		findingFixtures[i] = {
			id		: i+1,
			host		: "192.168." + $.fixture.rand(20) + "." + $.fixture.rand(255),
			hostName	: $.fixture.rand(["","FakeHostName_" + i],1)[0],
			port		: $.fixture.rand(1024) + "/" + $.fixture.rand(["tcp","udp"],1),
			plugin		: 1000 + $.fixture.rand(100),
			find		: $.fixture.rand(finds, 1)[0],
			remark		: $.fixture.rand( remarks , 1)[0],
			severity	: severity_id,
			severityName	: severity[severity_id],
			status		: status_id,
			statusName	: status,
			scanId		: $.fixture.rand(15)
		};
	}

	$.fixture("json/getFindings.pl", function(orig, settings, headers) {
		return [findingFixtures];
	});
	$.fixture("json/updateFindings.pl", function(orig, settings, headers) {
		var txt = "";
		for(var a in orig.data) {
			txt = txt + a + " - " + orig.data[a] + "\n";
			//findingFixtures[orig.data.id-1][a] = orig.data[a];
		}
		alert("update:\n" + txt);
		var txt = "";
		for(var a in orig.data.attrs) {
			txt = txt + a + " - " + orig.data.attrs[a] + "\n";
		}
		return {};
	});
});
