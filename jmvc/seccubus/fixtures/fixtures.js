/*
 * Copyright 2015 Frank Breedijk, Petr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
                        result: $.fixture.rand( ['OK','Warn','Error'] , 1)[0]
                }

	})
	/* Workspaces */
	$.fixture.make("workspace", 15, function(i, workspace){
		return {
			id 		: i+1,
			name		: "Client "+i+1,
			findCount	: $.fixture.rand(9999)+1,
			scanCount	: $.fixture.rand(3)+1,
			lastScan	: "2011-11-11 11:11:11"
		}
	})

	
	// Scanners 
	$.fixture.make("scanner", 5, function(i, scanner){
		var name = ["Nessus", "NessusLegacy", "Nikto", "Nmap", "OpenVAS" ];
		var desc = [
			"Nessus vulnerability scanner via XMLrpc", 
			"Nessus vulnerability scanner via port 1241 interface", 
			"Nikto web vulnerability scanner", 
			"Nmap port scanner", 
			"OpenVAS vulnerability scanner" 
		];
		return {
			name: name[i],
			description: desc[i],
			help : "Helptext for " + name[i]
		}
	})
	
	/* Findings */
	var findingFixtures = [];
	var findCount = 2500;
	var finds = [
		"OSVDB-637: GET : Enumeration of users is possible by requesting ~username (responds with 'Forbidden' for users, 'not found' for non-existent users).",
		"OSVDB-3268: GET : /icons/: Directory indexing found.",
		"Port 22/tcp is open.\nService was identified as ssh",
		"Port 80/tcp is open.\nService was identified as www",
		"Remote listeners enumeration\nUsing netstat, it is possible to identify daemons listening on the remote\nport.\n\nPlugin output:\nThe Linux process '/opt/nessus/sbin/nessusd' is listening on this port.\n\nDescription:\nBy logging into the remote host and using the Linux-specific 'netstat\n-anp' command, it was possible to obtain the name of the processe\nlistening on the remote port.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None",
		"Service Detection\nThe remote service could be identified.\n\nPlugin output:\nA web server is running on this port.\n\nDescription:\nIt was possible to identify the remote service by its banner or by looking\nat the error message it sends when it receives an HTTP request.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None"
	];
	var remarks = ["","Fix it", "Disable it", "Remove it","Duh..."];
	var severity = ["Not set","High", "Medium", "Low", "Note"];
	for(var i = 0;i < findCount;i++) {
		var severity_id = $.fixture.rand(5)+1;
		var status_id = $.fixture.rand(7);
		var status_name = ["New","Changed", "Open", "No issue", "Gone", "Closed", "MASKED"][status_id];
		status_id = [1,2,3,4,5,6,99][status_id];
		findingFixtures[i] = {
			id		: i+1,
			host		: "192.168." + $.fixture.rand(20) + "." + $.fixture.rand(255),
			hostName	: $.fixture.rand(["","FakeHostName_" + i],1)[0]+(i+1),
			port		: $.fixture.rand(1024) + "/" + $.fixture.rand(["tcp","udp"],1),
			plugin		: 1000 + $.fixture.rand(100),
			find		: $.fixture.rand(finds, 1)[0],
			remark		: $.fixture.rand( remarks , 1)[0]+1,
			severity	: severity_id,
			severityName	: severity[severity_id]||"No severityName for: "+severity_id,
			status		: status_id,
			statusName	: status_name,
			scanId		: $.fixture.rand(15)+1
		};
	}

	$.fixture("json/getFindings.pl", function(orig, settings, headers) {
		return [findingFixtures];
	});
	$.fixture("json/updateFindings.pl", function(orig, settings, headers) {
		//var txt = "";
		//for(var a in orig.data.attrs) {
		//	txt = txt + a + ": " + orig.data.attrs[a];
		//}
		//alert(txt);
		for(var id in orig.data.ids) {
			findingFixtures[id].status = orig.data.attrs.status;
			if ( orig.data.attrs.overwrite == "on" ) {
				findingFixtures[id].remark = orig.data.attrs.remark;
			} else if (orig.data.attrs.remark != "") { 
				findingFixtures[id].remark = findingFixtures[id].remark + "\n" + orig.data.attrs.remark;
			}
		}
		return {
			status : orig.data.attrs.status,
			remark : orig.data.attrs.remark,
		};
	});

	/* Scans */
	var scanFixtures = [];
	var noScans = $.fixture.rand(15)+8;
	var scanners = ["Nessus", "NessusLegacy", "OpenVAS", "Nikto", "Nmap", "Unlisted scanner" ];
	for(var i = 0;i < noScans;i++) {
		sc = $.fixture.rand(scanners.length);
		scanFixtures[i] = {
			id 	: i,
			workspace : $.fixture.rand(7)+1,
			name	: scanners[sc] + " " + $.fixture.rand(["inside", "outside"], 1) + " " + i,
			scanner	: scanners[sc],
			parameters : "some params will go here",
			targets	: $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255) + "." + $.fixture.rand(255),
			findCount : $.fixture.rand(255),
			lastScan : $.fixture.rand(["", "2011-11-11 11:11:11" ],1),
			noFindings : true
		}
	}

	$.fixture("json/getScans.pl", function(orig, settings, headers) {
		var selected = {};
		for(var i = 0; i < scanFixtures.length;i++) {
			// console.log("scanFixtures:", scanFixtures);
			if ( scanFixtures[i].workspace == orig.data.workspaceId ) {
				if ( typeof selected[0] == "undefined" ) {
					selected = [];
				}
			if(!scanFixtures[i].workspace) scanFixtures[i].workspace = $.fixture.rand(7)+1;
			selected.push(scanFixtures[i]);
			}
		}
		return [selected];
	});
	
	// History
	var historyFixtures = [];
	var finds = [
		"OSVDB-637: GET : Enumeration of users is possible by requesting ~username (responds with 'Forbidden' for users, 'not found' for non-existent users).",
		"OSVDB-3268: GET : /icons/: Directory indexing found.",
		"Port 22/tcp is open.\nService was identified as ssh",
		"Port 22/tcp is open.\nService was identified as telnet",
		"Port 80/tcp is open.\nService was identified as www",
		"Port 80/tcp is open.\nService was identified as gopher",
		"Remote listeners enumeration\nUsing netstat, it is possible to identify daemons listening on the remote\nport.\n\nPlugin output:\nThe Linux process '/opt/nessus/sbin/nessusd' is listening on this port.\n\nDescription:\nBy logging into the remote host and using the Linux-specific 'netstat\n-anp' command, it was possible to obtain the name of the processe\nlistening on the remote port.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None",
		"Service Detection\nThe remote service could be identified.\n\nPlugin output:\nA web server is running on this port.\n\nDescription:\nIt was possible to identify the remote service by its banner or by looking\nat the error message it sends when it receives an HTTP request.\n\nSolution:\nn/a\n\nSeverity: 1\n\nRisk factor: None"
	];
	var remarks = ["Fix it", "forget about it", "Disable it", "Enable it", "Remove it","","","Duh...", "Duh...\nNow do something about it"];
	var severity_id = $.fixture.rand(5);
	var severity = ["Not set","High", "Medium", "Low", "Note"];
	var status_id = $.fixture.rand(7);
	var status_name = ["New","Changed", "Open", "No issue", "Gone", "Closed", "MASKED"][status_id];
	status_id = [1,2,3,4,5,6,99][status_id];
	for(var i=0;i<10;i++) {
		historyFixtures[i] = {
			id: i+1,
			name: i+1,
			description:"Description of history "+(i+1),
			finding: $.fixture.rand( finds, 1)[0],
			remark: $.fixture.rand( remarks, 1)[0],
			severity: severity_id,
			severityName: severity[severity_id],
			status: status_id,
			statusName: status_name,
			user_id: 0,
			run_id: 0,
			time: "2012-03-" + i + " 00:00:00"
		}
	}

	$.fixture("json/getFindingHistory.pl", function(orig, settings, headers) {
		return [historyFixtures];
	});

	// Runs
	$.fixture("json/getRuns.pl",function(orig, settings, headers){
		var runs = [];
		for(var i=0; i<8; i++){
			runs.push({
				id: i,
				name:"testRun"+i,
				description: "Test run "+i+" description",
				time: "201201"+ ( "0" + i).substr(-2)
			});
		}
		return [runs];
	});
	$.fixture.make("runs", 15, function(i, attachment){
		return {
			id: i,
			time: "201201"+ ( "0" + i).substr(-2)
		}
	})
	// Events
	$.fixture.make("event", 5, function(i, event){
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			name: "event "+i,
			description: $.fixture.rand( descriptions , 1)[0]
		}
	})

	// Notifications
	$.fixture.make("notification", 5, function(i, notification){
		var subject = ["grill fish", "make ice", "cut onions"]
		var user = ["frank", "dan", "steven" ]
		var domain = [ "seccubus.com", "autonessus.com" ]
		var event_id =  $.fixture.rand(1)
		var events = [ "Before scan", "After scan" ]
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			id: i,
			subject: "notification "+i,
			name:"Notification"+i,
			description:"Description of notification "+i,
			recipients: $.fixture.rand( user , 1)[0] + "@" + $.fixture.rand( domain, 1)[0],
			message: $.fixture.rand( descriptions , 1)[0],
			event_id: event_id + 1,
			event_name: events[event_id]

		}
	})

	// Asset

	var assets = [];
	for(var i=1; i<10; i++){
		assets.push({
			id : i,
			name : "Asset name of: "+i,
			hosts : "192.168.0."+i,
			recipients : "test"+i+"@recipient",
			recipientsHtml : "<a href='test"+i+"@recipient'>test"+i+"@recipient</a>",
			workspace : "1"
		});
	}

	$.fixture("json/createAsset.pl",function(orig,settings,headers){
		var data = orig.data;
		data['id'] = 1;
		console.log("Data: ",data);
		data['recipientsHtml'] = "<a href='mailto:"+data['recipients']+"'>"+data['recipients']+"</a>";
		assets.push(data);
		return data;
	});

	$.fixture("json/deleteAsset.pl",function(orig,settings,headers){
		var id = orig.data.id;
		var foundNum;
		for(var i=0;i<assets.length;i++){
			if(assets[i].id == id) foundNum = i;
		}

		if(foundNum) assets.splice(foundNum,1)
		return [{'id':id}];
	});

	$.fixture("json/updateAsset.pl",function(orig,settings,headers){
		return [settings.data];
	});

	$.fixture("json/getAssets.pl",function(orig,settings,headers){
		return [assets];
	});

	// Schedules

	var schedules = [];
	for(var i=1; i<9; i++){
		schedules.push({
			id: i,
			enabled : 1,
			launch : 'd'
			month : i,
			week : 'w',
			wday : i>6 ? 8 - i : i,
			day : i+10,
			hour : i+5,
			min : i+30 
		});
	}

	$.fixture("json/getSchedules.pl", function(orig, settings, headers){
		return [schedules];
	});

	$.fixture("json/updateSchedule.pl", function(orig, settings, headers){
		return [settings.data];
	});

	$.fixture("json/createSchedule.pl", function(orig, settings, headers){
		var data = orig.data;
		data['id'] = 1;
		schedules.push(data);
		return data;
	});

	$.fixture("json/deleteSchedule.pl", function(orig, setting, headers){
		var id = orig.data.id;
		var foundNum;
		for(var i=0;i<schedules.length;i++){
			if(schedules[i].id == id) foundNum = i;
		}

		if(foundNum) schedules.splice(foundNum,1)
		return [{'id':id}];
	});
	$.fixture.make("issue", 5, function(i, issue){
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			name: "issue "+i,
			description: $.fixture.rand( descriptions , 1)[0]
		}
	});
});
