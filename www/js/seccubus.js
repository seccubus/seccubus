// ----------------------------------------------------------------------------
// $Id$
// ----------------------------------------------------------------------------
// Main program Javascript routines
// ----------------------------------------------------------------------------
// Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
// ----------------------------------------------------------------------------

var workspaceID = 0;
var workspaceName = "";
var scanObj = new Collection;		// Use a Collection to keep track of scans
var progressTimer = null;			// Used to keep track of a open progress overlay
var countFindingsSel;			// counter for number of findings selected

// Are these still needed?
var statusID = 1;
var statusName = "New";
var current=1;
var max=1;
var xmlstore;

//Create own collection object for scans
function Collection() {
	var collection = {};
	var order = [];

	this.add = function(property, value) {
		if (!this.exists(property)) {
			collection[property] = value;
			order.push(property);
		}
	}
	
	this.remove = function(property) {
		collection[property] = null;
		var xx = order.length;
		while (xx-- > 0) {
			if (order[xx] == property) {
				order.splice(xx,1);
				break;
			}
		}
	}
	
	this.getValuesArr = function() {
		var output = [];
		for (var xx = 0; xx < order.length; ++xx) {
			if (order[xx] != null) {
				output.push(collection[order[xx]]);
			}
		}
		return output;
	}
	
	this.getValuesStr = function() {
		var output = "";
		for (var xx = 0; xx < order.length; ++xx) {
			if (order[xx] != null) {
				output = collection[order[xx]] + " " + output;
			}
		}
		return output;
	}
	
	this.getKeysArr = function() {
		var keys = [];
		for (var xx = 0; xx < order.length; ++xx) {
			if (order[xx] != null) {
				keys.push(order[xx]);
			}
		}
		return keys;
	}
	
	this.getKeysStr = function() {
		var keys = "";
		for (var xx = 0; xx < order.length; ++xx) {
			if (order[xx] != null) {
				keys = order[xx] + " " + keys;
			}
		}
		return keys;
	}
	
	this.update = function(property, value) {
		if (value != null) {
			collection[property] = value;
		}
		var xx = order.length;
		while (xx-- > 0) {
			if (order[xx] == property) {
				order[xx] = null;
				order.push(property);
				break;
			}
		}
	}
	
	this.exists = function(property) {
		return collection[property] != null;
	}	
	
	this.value = function(property) {
		return collection[property];
	}
	
	this.isEmpty = function() {
		if (order[0] == null) {
			return true;
		} else {
			return false;
		}
	}
	this.clear = function() {
		collection = {};
		order = [];
	}
}

// Define Cookie functions
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}


// When the DOM is ready start building the screen
// This is called the 1st time the script is loaded and if the webpage containing this script is refreshed.
$(document).ready( function() {
	// if console is not defined, e.g., Firebug console is not enabled or Non-Firefox browser
	if (!("chrome" in window)) {
		if (!("console" in window) || !("firebug" in console))
		{
	    	var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
	                 "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
	    	
	    	window.console = {};
	    	for (var i = 0; i < names.length; ++i)
	    		window.console[names[i]] = function() {}
		}
	}
	
	// Remove Issues and Reports tab for the Alpha release
	$('#main-nav ul li:eq(3)').hide();
	$('#main-nav ul li:eq(4)').hide();

	// Initialize css-tabs
	$("ul.css-tabs").tabs("div.css-panes > div"/*, {history: true}*/);
	// grab the API with jQuery's data method
	var api = $("ul.css-tabs").data("tabs");
	//console.dir(api);
	api.onBeforeClick(function(event, tabIndex) {
		//if ( !(modalOpen.isEmpty()) ) return false;  // Prevent tab changes while modal active
		
		var tabName = this.getTabs().eq(tabIndex).attr("href");	// Get tab name	
		tabName = tabName.substring(1);	 // Remove 1st char (the '#' char)
		
		if (workspaceID == 0) {		// No workspace is currently selected			
			// only allow the first tab to be selected
			return false;
		} else if (scanObj.isEmpty() && tabIndex > 1) { // No scan has been selected
			// only allow the first two tabs to be selected
			return false;
		} else {
			// Hide all buttons
			$("#btnAddWS").hide();
			$("#btnEditWS").hide();
			$("#btnDeleteWS").hide();
			$("#btnAddScan").hide();
			$("#btnEditFindings").hide();
			$("#btnAddFindingsIssue").hide();
			
			// show the correct buttons
			switch (tabName) {
			case "workspaces":
				// Show the 'Workspaces' tab buttons
				$("#btnAddWS").show();
				$("#btnEditWS").show();
				$("#btnDeleteWS").show();
				break;
			case "scans":
				// Show the 'Scans' tab buttons
				$("#btnAddScan").show();
				break;
			case "findings":
				// Show the 'Findings' tab buttons
				$("#btnEditFindings").show();
				$("#btnAddFindingsIssue").show();
				break;
			case "issues":
				break;
			}	
		}
	});
	
	// Initialize the progress overlay
	$("#progress").overlay({
		mask: {
			color: '#D6D6D6',
			closeSpeed: 0,
			loadSpeed: 0,
			opacity: 0.9
		},
		speed: 0,
		top: 200,
		closeOnClick: false,
		closeOnEsc: false
	});
	
	// Show only the appropriate initial buttons
	$("#btnAddScan").hide();
	$("#btnEditFindings").hide();
	$("#btnAddFindingsIssue").hide();
	$("#btnAddWS").show();
	$("#btnEditWS").show();
	$("#btnDeleteWS").show();
	
	// Setup all the pages, including: table initialization, click handlers, etc.
	workspacesSetup();
	scansSetup();
	findingsSetup();
	
	// Setup the Workspace tab
	updateWorkspacesTable();
	
	// Setup the overlay that displays results from api/up2date.pl
	var olStart = $("#start").overlay({
		mask: {
			color: '#D6D6D6',
			closeSpeed: 0,
			loadSpeed: 0,
			opacity: 0.9
		},
		speed: 0,
		closeOnClick: true,
		closeOnEsc: false,
		api: true,
	});
	displayStartOverlay(olStart);
});

// Error handler for all ajax calls
$(document).ajaxError(function(e, xhr, settings, exception) {
	alert("Error calling '" + settings.url + "' \nXHR status: (" + xhr.status + ") " + xhr.statusText + 
		  " \nXHR message:\n" + xhr.responseText + " \nXHR XML:\n" + xhr.responseXML +
		  "\nException Message:\n" + exception);
});

function displayStartOverlay(ol) {
	var showOL = false;
	
	// Execute api/up2date.pl
	$.post("api/up2date.pl", {}, function(xml, txtStatus){
		// Store status of the result
		result = $("result", xml).text();
		curVer = $("version", xml).text();
		
		if (result === "OK") { // if result is OK (successful),
			// Look for cookie
			var storedVer = readCookie('version');
			// If cookie not present or version changed then
			if (typeof storedVer == "undefined" || storedVer != curVer) {
				// Show the message.
				$('#up2date').html($("message", xml).text());
				// Store the version in a cookie
				createCookie('version', curVer, 365);
				
				showOL = true;
			}
		} else if (result === "NOK")  {	// Handle errors gracefully
			// Set message
			$('#up2date').html($("message", xml).text());
			
			showOL = true;
		} else { // Handle unknown errors gracefully
			console.error("An unknown result was returned.\n"+
				"Please report the following result to the developers:\n" +
				$("seccubusAPI", xml).attr("name") + ": " + result);
		}
		
		// Execute api/testConfig.pl
		$.post("api/testConfig.pl", {}, function(xml, txtStatus){
			// Store status of the result
			result = $("result", xml).text();
			console.log("result = " + result);
			
			if (result === "OK") { // if result is OK (successful),
				
			} else if (result === "NOK")  {	// Handle errors gracefully
				showOL = true;
			} else { // Handle unknown errors gracefully
				console.error("An unknown result was returned.\n"+
					"Please report the following result to the developers:\n" +
					$("seccubusAPI", xml).attr("name") + ": " + result);
			}
			
			// Show the message.
			$('#testConfig').html($("message:last", xml).text());
			
			var msg = "<br>";
			// Process each item returned
			$("item", xml).each(function() {
				msg += "<br>";
				if ($("status", this).text() === "OK") msg += '<img src="img/tick.png"/> ';
				else msg += '<img src="img/cross.png"/> ';
				msg += $("label", this).text() +": "+ $("message", this).text();
			});
			$('#testConfig').append(msg);
			
			// Show the overlay is necessary
			if (showOL) ol.load();
			
		}, function () {
			// If error in post call then
			// close the overlay
			ol.close();
		});
	}, function () {
		// If error in post call then
		// close the overlay
		ol.close();
	});
}

// This function sets the workspace buttons up 
function workspacesSetup() {
	// Disable text selection by default
	$("#btnAddWS").disableTextSelect();
	$("#btnEditWS").disableTextSelect();
	$("#btnDeleteWS").disableTextSelect();
	
	// Initialize workspace table
	var oTable = $('#workspaces_table').dataTable( {
		"bPaginate": false,
		"bLengthChange": false,
		"bFilter": false,
		"bInfo": false,
		"bAutoWidth": false,
		"aaSorting": [[ 0, "asc" ]],
		"aoColumns": [ null,
		               { "sClass": "center", "bSortable": false }
		  			 ]
	});
	
	// Initialize Add overlay and validator
	var add_trigger = $("#btnAddWS").overlay({
		mask: {
			color: '#e6efc2',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onBeforeLoad: function (event) {
			
			// return false if the button is disabled
			return !($("#btnAddWS").is(".disabled"));
		},
		onLoad: function (event) { $("input:text:visible:first").focus(); },	// Set focus to the first input field
		onBeforeClose: function (event) {
			$("#add_ws_name").val("");		// Clear the workspace name field
			$(".error").hide();				// Hide all error messages
		}
	});
	$("#addWS form").validator().submit(function(e) {
		if (!e.isDefaultPrevented()) {	// client-side validation passed
			// get user inputted workspace name
			var name = $("#add_ws_name").val();

			// Create the workspace
			$.post("api/createWorkspace.pl", {workspaceName: name}, function(xml, txtStatus){
				// Store status of the result
				result = $("result", xml).text();
				
				if (result === "OK") { // if result is OK (successful), log it and refresh table 
					console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					add_trigger.eq(0).overlay().close();
					// Refresh the workspace names list
					updateWorkspacesTable();
				} else if (result === "NOK")  {	// Handle errors gracefully
					console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					add_trigger.eq(0).overlay().close();
				} else { // Handle unknown errors gracefully
					console.error("An unknown result was returned.\n"+
						"Please report the following result to the developers:\n" +
						$("seccubusAPI", xml).attr("name") + ": " + result);
					// close the overlay
					add_trigger.eq(0).overlay().close();
				}
			}, "xml");
		}
		
		// do not perform default submittion of the form
		return e.preventDefault();
	});
	
	// Initialize Edit overlay and validator 
	var edit_trigger = $("#btnEditWS").overlay({
		mask: {
			color: '#dff4ff',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onBeforeLoad: function (event) {
			// Fill in the workspace name field with the currently selected workspace name
			$("#edit_ws_name").val(workspaceName);
			
			// return false if the button is disabled
			return !($("#btnEditWS").is(".disabled"));
		},
		onLoad: function (event) { $("input:text:visible:first").focus(); },	// Set focus to the first input field
		onBeforeClose: function (event) {
			$("#edit_ws_name").val("");		// Clear the workspace name field
			$(".error").hide();				// Hide all error messages
		}
	});
	$("#editWS form").validator().submit(function(e) {
		if (!e.isDefaultPrevented()) {	// client-side validation passed
			// get user inputted workspace name
			var newName = $("#edit_ws_name").val();
			
			if (newName === workspaceName) {
				$("#editWS form").data("validator").invalidate( { 
					"name": "Name has not been modified" 
				});
				return e.preventDefault();
			}
			// Change the workspace name
			$.post("api/editWorkspace.pl", {workspaceName: workspaceName, newWorkspaceName: newName}, function(xml, txtStatus){
				// Store status of the result
				result = $("result", xml).text();
				
				if (result === "OK") { // if result is OK (successful), log it and refresh table 
					console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					edit_trigger.eq(0).overlay().close();
					// Change the current workspace name
					workspaceName = newName;
					// Refresh the workspace names list
					updateWorkspacesTable();
				} else if (result === "NOK")  {	// Handle errors gracefully
					console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					edit_trigger.eq(0).overlay().close();
				} else { // Handle unknown errors gracefully
					console.error("An unknown result was returned.\n"+
						"Please report the following result to the developers:\n" +
						$("seccubusAPI", xml).attr("name") + ": " + result);
					// close the overlay
					edit_trigger.eq(0).overlay().close();
				}
			}, "xml");
		}

		// do not perform default submittion of the form
		return e.preventDefault();
	});
	$("#editWS button:reset").click(function(e) {
		$("#edit_ws_name").val(workspaceName);
		
		return e.preventDefault();
	});
	
	// Initialize Delete form and overlay
	var delete_trigger = $("#btnDeleteWS").overlay({
		mask: {
			color: '#fbe3e4',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onBeforeLoad: function (event) {
			$("#deleteWS h3 span").html(workspaceName);
			
			return !($("#btnDeleteWS").is(".disabled"));
		},
		onBeforeClose: function (event) {
			$("#deleteWS h3 span").html("<None>");	// Clear the workspace name
			$(".error").hide();				// Hide all error messages
		}
	});
	$("#yesDelWS").click(function(e) {
		// Delete the current workspace
		$.post("api/deleteWorkspace.pl", {workspaceName: workspaceName}, function(xml, txtStatus){
			// Store status of the result
			result = $("result", xml).text();
			
			if (result === "OK") { // if result is OK (successful), log it and refresh table 
				console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
				// close the overlay
				delete_trigger.eq(0).overlay().close();
				// Clear the global variables
				workspaceID = 0;
				workspaceName = "";
				// Refresh the workspace names list
				updateWorkspacesTable();
			} else if (result === "NOK")  {	// Handle errors gracefully
				console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
				// close the overlay
				delete_trigger.eq(0).overlay().close();
			} else { // Handle unknown errors gracefully
				console.error("An unknown result was returned.\n"+
					"Please report the following result to the developers:\n" +
					$("seccubusAPI", xml).attr("name") + ": " + result);
				// close the overlay
				delete_trigger.eq(0).overlay().close();
			}
		}, "xml");
	});
	$("#noDelWS").click(function(e) {
		$("#deleteWS h3 span").html("<None>");	// Clear the workspace name
		// close the overlay
		delete_trigger.eq(0).overlay().close();
	});
}

// This function updates the workspacelist 
function updateWorkspacesTable() {
	// Get the workspace list via XML
	$.post("api/getWorkspaces.pl", {}, function(xml, txtStatus){
		// Store status of the result
		result = $("result", xml).text();
		
		if (result === "OK") { // if result is OK (successful), fill table with data and add handlers
			console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
			// Clear the table contents
			$('#workspaces_table').dataTable().fnClearTable();

			// Prepare each workspace XML element as a table row to be inserted into the workspace table
			$("workspace", xml).each(function() {
				var ai = $('#workspaces_table').dataTable().fnAddData([ $("name", this).text(), $("scans", this).text() ]);
				var selTR = $('#workspaces_table').dataTable().fnSettings().aoData[ ai[0] ].nTr;
				$(selTR).data('id', $("id", this).text())
						.attr('title', "Click to select a workspace");
			});
		
			if (workspaceID != 0) {		// If a workspace is already selected
				// Set workspace status and highlight the correct row
				$("#workspace_status").text(workspaceName);
				$("#workspaces_table tbody tr[id="+workspaceID+"]").addClass('select');
			} else {	// If a workspace is not selected
				// Make sure the workspace status is set to "None"
				$("#workspace_status").text("None");
				
				// Set edit and delete buttons to disabled, if not already
				if (!($("#btnEditWS").is(".disabled"))) {
					$("#btnEditWS").toggleClass("disabled");
				}
				if (!($("#btnDeleteWS").is(".disabled"))) {
					$("#btnDeleteWS").toggleClass("disabled");
				}
			}
	
			// Deny text selection in table where click and double click can have unintentional text selection 
			$("#workspaces_table").disableTextSelect();
			
			// Assign a click handler for workspace rows
			$("#workspaces_table tbody tr").single_double_click(function() {
				if (workspaceID == 0) { // No workspaces have been selected
					// Enable the appropriate buttons
					$("#btnEditWS").toggleClass('disabled');
					$("#btnDeleteWS").toggleClass('disabled');
					//Set the current Workspace 
					workspaceID = $(this).data('id');
					workspaceName = $("td:first", this).text();
					//Change the workspace status
					$("#workspace_status").text(workspaceName);
					// load the correct scans for the current workpace into the table
					updateScansTable();
				} else if (workspaceID == $(this).data('id')) {	// This workspace is already selected
					workspaceID = 0;	// Change to indicate that no workpace is selected
					workspaceName = "";
					$("#btnEditWS").toggleClass('disabled');
					$("#btnDeleteWS").toggleClass('disabled');
					// clear the  status
					$("#workspace_status").text("None");
					$("#filter_status").text("None");
					// Remove any loaded scans
					fnUnloadAllFindings();
				} else {	// Another workspace is already selected
					// Toggle the already selected workspace off
					$("#workspaces_table tbody tr[id="+workspaceID+"]").toggleClass('select');
					// Remove any loaded scans
					fnUnloadAllFindings();
					
					//Set the current Workspace 
					workspaceID = $(this).data('id');
					workspaceName = $("td:first", this).text();
					//Change the workspace status
					$("#workspace_status").text(workspaceName);
					// load the correct scans for the current workpace into the table
					updateScansTable();
				}
				
				// Always toggle the clicked on workspace
				$(this).toggleClass('select');
				
			}, function() {		// Assign a double click handler for workspace rows
				if (workspaceID == $(this).data('id')) {  // The currently selected workspace was double-clicked
					return;
				} else if (workspaceID == 0) { // No workspaces have been selected
					// Enable the appropriate buttons
					$("#btnEditWS").toggleClass('disabled');
					$("#btnDeleteWS").toggleClass('disabled');
					// Toggle the clicked on workspace
					$(this).toggleClass('select');
				} else if (workspaceID != $(this).data('id')) {	// Another workspace is already selected
					// Toggle the already selected workspace off
					$("#workspaces_table tbody tr[id="+workspaceID+"]").toggleClass('select');
					// Remove any loaded scans
					fnUnloadAllFindings();
				
					// Toggle the clicked on workspace
					$(this).toggleClass('select');
				}
				//Set the current Workspace 
				workspaceID = $(this).data('id');
				workspaceName = $("td:first", this).text();
			
				//Change the workspace status
				$("#workspace_status").text(workspaceName);
				
				// load the correct scans for the current workpace into the table
				updateScansTable();
			
				// double click behavior goes here
				$("ul.css-tabs").data("tabs").click("scans");
			});
		} else if (result === "NOK")  {	// Handle errors gracefully
			console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
		} else { // Handle unknown errors gracefully
			console.error("An unknown result was returned.\n"+
				"Please report the following result to the developers:\n" +
				$("seccubusAPI", xml).attr("name") + ": " + result);
		}
	}, "xml");
}

//This function sets the scans buttons up 
function scansSetup() {
	// Disable text selection by default
	$("#btnAddScan").disableTextSelect();
	
	// SelectAll checkbox default is unchecked.
	$('#SelectAll', '#scans_table').attr('checked', false);
	
	// Initialize table
	var oTable = $('#scans_table').dataTable( {
		"bPaginate": false,
		"bLengthChange": false,
		"bFilter": false,
		"bInfo": false,
		"bAutoWidth": false,
		"aaSorting": [[ 1, "asc" ]],
		"aoColumns": [ { "sClass": "center", "bSortable": false },
		               null,
		               { "sClass": "center" },
		               { "sClass": "center" },
		               { "sClass": "center", "bSortable": false }
		  			 ]
	});
	
	// Initialize Add overlay and validator
	var add_trigger = $("#btnAddScan").overlay({
		mask: {
			color: '#e6efc2',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onBeforeLoad: function (event) {
			
			// return false if the button is disabled
			return !($("#btnAddScan").is(".disabled"));
		},
		onLoad: function (event) { $("input:text:visible:first").focus(); },	// Set focus to the first input field
		onBeforeClose: function (event) {
			// Clear the add scan fields
			$("#add_scan_name").val("");
			$("#add_scan_scanner").val("");
			$("#add_scan_parameters").val("");
			$("#add_scan_targets").val("");
			
			$(".error").hide();				// Hide all error messages
		}
	});
	$("#addScan form").validator().submit(function(e) {
		if (!e.isDefaultPrevented()) {	// client-side validation passed
			e.preventDefault();
			
			// get user inputs
			var nameOfScan = $("#add_scan_name").val();
			var scanner = $("#add_scan_scanner").val();
			var params = $("#add_scan_parameters").val();
			var targets = $("#add_scan_targets").val();

			// Create the scan
			$.post("api/createScan.pl", {workspaceID: workspaceID, scanName: nameOfScan,
										 scannerName: scanner, scannerParam: params,
										 Targets: targets}, function(xml, txtStatus){
				// Store status of the result
				result = $("result", xml).text();
				
				if (result === "OK") { // if result is OK (successful), log it, close overlay and refresh table
					console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					add_trigger.eq(0).overlay().close();
					// Refresh the scan names list
					updateScansTable();
				} else if (result === "NOK")  {	// Handle errors gracefully
					console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					add_trigger.eq(0).overlay().close();
				} else { // Handle unknown errors gracefully
					console.error("An unknown result was returned.\n"+
						"Please report the following result to the developers:\n" +
						$("seccubusAPI", xml).attr("name") + ": " + result);
					// close the overlay
					add_trigger.eq(0).overlay().close();
				}
			}, "xml");
		}
		
		// do not perform default submittion of the form
		return false;
	});
	
	// set Edit scan overlay button click handlers
	$("form", "#editScan").validator().submit(function(e) {
			if (!e.isDefaultPrevented()) {	// client-side validation passed
				e.preventDefault();
				
				// get user inputs
				var nameOfScan = $("#edit_scan_name").val();
				var scanner = $("#edit_scan_scanner").val();
				var params = $("#edit_scan_parameters").val();
				var targets = $("#edit_scan_targets").val();

				var scanID = $("#orig_scan_id", "#editScan").val();
				
				// Change the scan name
				$.post("api/editScan.pl", {workspaceID: workspaceID, scanID: scanID, 
					scanName: nameOfScan, scannerName: scanner, scannerParam: params,
					Targets: targets}, function(xml, txtStatus){
					// Store status of the result
					result = $("result", xml).text();
					
					if (result === "OK") { // if result is OK (successful), log it, close overlay and refresh table
						console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
						// close the overlay
						$(".close", "#editScan").click();
						// Update the scan name in the collection in case it changed
						scanObj.update(scanID, scanner);
						// Refresh the scan names list
						updateScansTable();
					} else if (result === "NOK")  {	// Handle errors gracefully
						console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
						// close the overlay
						$(".close").click();
					} else { // Handle unknown errors gracefully
						console.error("An unknown result was returned.\n"+
							"Please report the following result to the developers:\n" +
							$("seccubusAPI", xml).attr("name") + ": " + result);
						// close the overlay
						$(".close").click();
					}
				}, "xml");
			}
			
			// do not perform default submittion of the form
			return false;
		});
		$("button:reset", "#editScan").click(function(e) {
			e.preventDefault();
			
			$("#edit_scan_name", "#editScan").val($("#orig_scan_name", "#editScan").val());
			$("#edit_scan_scanner", "#editScan").val($("#orig_scan_scanner", "#editScan").val());
			$("#edit_scan_parameters", "#editScan").val($("#orig_scan_parameters", "#editScan").val());
			$("#edit_scan_targets", "#editScan").val($("#orig_scan_targets", "#editScan").val());
			//return false;
			//$(".error").hide();	// Hide all error messages
		});
	
	// Set delete scan button click handlers
	$("#yesDelScan", "#deleteScan").click(function(e) {
		e.preventDefault();
		
		var name =  $("h3 span", "#deleteScan").text();
		var id = $("#scan_id", "#deleteScan").val();
		
		// Delete the current scan
		$.post("api/deleteScan.pl", {scanID: id}, function(xml, txtStatus){
			// Store status of the result
			result = $("result", xml).text();
			
			if (result === "OK") { // if result is OK (successful), log it, close overlay and refresh table
				console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
				// close the overlay
				$(".close", "#deleteScan").click();
				//remove from status if it exists
				scanObj.remove(id);
				// Refresh the scan names list
				updateScansTable();
			} else if (result === "NOK")  {	// Handle errors gracefully
				console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
				// close the overlay
				$(".close").click();
			} else { // Handle unknown errors gracefully
				console.error("An unknown result was returned.\n"+
					"Please report the following result to the developers:\n" +
					$("seccubusAPI", xml).attr("name") + ": " + result);
				// close the overlay
				$(".close").click();
			}
		}, "xml");
		
		return false;
	});
	
	// Assign a click handler for the select all check box
	$("thead tr th:first input:checkbox", "#scans_table").click(function(e) {
		var checkedStatus = this.checked;
		
		if (checkedStatus) {
			$("tbody tr td:first-child", "#scans_table").each(function() {
				if ( !($("input:checkbox", this).attr('checked')) ) $(this).trigger('click');//$(this).click();
			});
		} else {
			fnUnloadAllFindings();
		}
	});
	
	var loadTimer = null;
	
	// Assign a click handler for the scans_table cells
	$("#scans_table").delegate('td', 'click', function(e) {
		var selRow = $(this).parent();
		var scanID = selRow.data('id');
		var scanName = $('td:eq(1)', selRow).text();
		//alert("scanID = " + scanID +"\nscanName = "+ scanName);
		var selTarget = $(e.target);
		//alert("Target element = "+ selTarget.get(0).tagName +"\nthis element = " + $(this).get(0).tagName);
		
		// Test if an image was clicked, if yes exit
		if (selTarget.is('img')) return;
		
		// if not already selected then
		if ( !scanObj.exists(scanID) ) {
			// Add the clicked on scan name and id to the list and update the status
			scanObj.add(scanID,scanName);
			$("#scan_status").text(scanObj.getValuesStr());
			
			// Check the selection checkbox
			$('td:first input:checkbox', selRow).attr('checked', true);
			
			// Toggle the clicked on workspace
			selRow.toggleClass('select');
			
			// Get the progress overlay
			var apiOverlay = $("#progress").data("overlay");
			//if (loadTimer) clearTimeout(loadTimer);
			//loadTimer = setTimeout(function () {
			//	loadTimer = null;
				apiOverlay.load();
			//},5);
			
			//setTimeout(function(){loadFindings(scanID)}, 500);
			loadFindings(scanID);
		} else {	// if already selected then
			// Remove Select All check when removing a scan
			$("thead tr th:first input:checkbox", "#scans_table").attr('checked', false);
			
			// Uncheck the selection checkbox
			$('td:first input:checkbox', selRow).attr('checked', false);
			
			// Remove the 'select' class from the row
			selRow.toggleClass('select');
			
			fnUnloadFindings(scanID);
		}
	});
}

function fnUnloadAllFindings() {
	// Make sure select all is unchecked
	$("thead tr th:first input:checkbox", "#scans_table").attr('checked', false);
	
	// for each row in the scans table
	$("tbody tr", "#scans_table").each(function() {
		$(this).removeClass('select');	// remove the 'select' class from the row
		$("td:first-child input:checkbox", this).attr('checked', false)  // clear the checkbox 
	});
	scanObj.clear();	// clear the scans object
	$("#scan_status").text('None');	// clear the status
	$("span", "#centerCat").each( function () {
		$(".count", this).text("0"); 	// clear the counts from all the status types
	});
	$('#findings_table').dataTable().fnClearTable();  // clear the findings from the table
}

/*
 * Unloads findings for a particular scan id
 */
function fnUnloadFindings(id) {
	// Remove the clicked on scan name and id from the list and update the status
	scanObj.remove(id);
	if (scanObj.isEmpty()) {
		$("#scan_status").text("None");
	} else {
		$("#scan_status").text(scanObj.getValuesStr());
	}

	// Unload the findings for this scan. Use a timing delay to show progress overlay
	var apiOverlay = $("#progress").data("overlay");
	apiOverlay.load();
	
	setTimeout(function () {
		try {
			removeFindings(id);
		}
		finally {
			apiOverlay.close();
		}
	}, 5);
}

// Load all the scans available for the current workspace
function updateScansTable() {
	// Clear the table contents
	$('#scans_table').dataTable().fnClearTable();

	// Get the scan list via XML and process it.
	$.post("api/getScans.pl", { workspaceID: workspaceID}, function(xml, txtStatus){
		// Present the results
		result = $("result", xml).text();
		
		if (result === "OK") { // if result is OK (successful), fill table and add handlers
			console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
			// Prepare each workspace XML element as a table row to be inserted into the workspace table
			$("scan", xml).each(function() {
				var checkbox = "<input type='checkbox' title='Select' />";
				var scanName = $("name", this).text();
				var options = "<img name='"+ scanName +"' class='EditScan' rel='#editScan' "+
					"src='img/pencil.png' title='Edit scan' alt='[edit]'/>"+
					//"<img name='"+ scanName + "' class='DeleteScan' rel='#deleteScan' "+
					//"src='img/delete.png' title='Delete scan' alt='[delete]'/>"+
					"<img name='"+ scanName +"' class='ExecuteScan' rel='#executeScan' "+
					"src='img/lightning.png' title='Execute scan' alt='[execute]'/>";
				
				var ai = $('#scans_table').dataTable()
							.fnAddData([ checkbox, scanName, $("scanner", this).text(), $(this)
							             .attr('findings'), options ]);
				var selTR = $('#scans_table').dataTable().fnSettings().aoData[ ai[0] ].nTr;
				$(selTR).data('id', $("id", this).text())
						.data('name', scanName)
						.data('scanner', $("scanner", this).text())
						.data('scannerparam', $("scannerparam", this).text())
						.data('targets', $("targets", this).text())
					 	.attr('title', $(this).attr('lastrun'));
			});
			
			if (!scanObj.isEmpty()) {		// If a scan is already selected
				// highlight selected rows
				$("tbody tr", "#scans_table").each(function () {
					if (scanObj.exists($(this).data('id'))) {
						$(this).addClass('select');
						// Check the selection checkbox
						$('td:first input:checkbox', this).attr('checked', true);
					}
				}); 
				// Set scan status
				$("#scan_status").text(scanObj.getValuesStr());
			} else {	// If a scan is not selected
				// Make sure the scan status is set to "None"
				$("#scan_status").text("None");
			}
			// Deny text selection in table where click and double click can have unintentional text selection 
			$("#scans_table").disableTextSelect();
				
			$(".EditScan", "#scans_table").overlay({
				mask: {
					color: '#dff4ff',
					loadSpeed: 'normal',
					opacity: 0.9
				},
				closeOnClick: false,
				onBeforeLoad: function (event) {
					var scanRow = this.getTrigger().parent().parent();
					// Fill in the scan name and id
					$("#orig_scan_id", "#editScan").val($(scanRow).data('id'));
					$("#orig_scan_name", "#editScan").val($(scanRow).data('name'));
					$("#orig_scan_scanner", "#editScan").val($(scanRow).data('scanner'));
					$("#orig_scan_parameters", "#editScan").val($(scanRow).data('scannerparam'));
					$("#orig_scan_targets", "#editScan").val($(scanRow).data('targets'));
					$("#edit_scan_name", "#editScan").val($(scanRow).data('name'));
					$("#edit_scan_scanner", "#editScan").val($(scanRow).data('scanner'));
					$("#edit_scan_parameters", "#editScan").val($(scanRow).data('scannerparam'));
					$("#edit_scan_targets", "#editScan").val($(scanRow).data('targets'));
				},
				onLoad: function (event) { $("input:text:visible:first", "#editScan").focus(); },	// Set focus to the first input field
				onBeforeClose: function (event) {
					$("#edit_scan_name", "#editScan").val("");		// Clear the fields
					$("#edit_scan_scanner", "#editScan").val("");
					$("#edit_scan_parameters", "#editScan").val("");
					$("#edit_scan_targets", "#editScan").val("");
					$(".error").hide();				// Hide all error messages
				}
			});
				
			$(".ExecuteScan", "#scans_table").overlay({
				mask: {
					color: '#E6EFC2',
					loadSpeed: 'normal',
					opacity: 0.9
				},
				closeOnClick: true,
				onBeforeLoad: function (event) {
					//var selTrigger = this.getTrigger();
					// fill in the scan name and id
					//$("h3 span", "#deleteScan").html(selTrigger.attr('name'));
					//$("#scan_id", "#deleteScan").val(selTrigger.parent().parent().data('id'));
				},
				onBeforeClose: function (event) {
					$(".error").hide();				// Hide all error messages
				}
			});
				
			$(".DeleteScan", "#scans_table").overlay({
				mask: {
					color: '#fbe3e4',
					loadSpeed: 'normal',
					opacity: 0.9
				},
				closeOnClick: false,
				onBeforeLoad: function (event) {
					var selTrigger = this.getTrigger();
					// fill in the scan name and id
					$("h3 span", "#deleteScan").html(selTrigger.attr('name'));
					$("#scan_id", "#deleteScan").val(selTrigger.parent().parent().data('id'));
				},
				onBeforeClose: function (event) {
					$(".error", "#deleteScan").hide();				// Hide all error messages
				}
			});
		} else if (result === "NOK")  {	// Handle errors gracefully
			console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
		} else { // Handle unknown errors gracefully
			console.error("An unknown result was returned.\n"+
				"Please report the following result to the developers:\n" +
				$("seccubusAPI", xml).attr("name") + ": " + result);
		}
	}, "xml");
}

function findingsSetup() {
	var bPanelOpen = false;	// detects if panel is open
	countFindingsSel = 0;	// Set global counter for slected findings to zero
	
	// Initialize table
	var oTable = $('#findings_table').dataTable( {
		"bPaginate": true,
		"sPaginationType": "four_button",	//"full_numbers",
		"bAutoWidth": false,
		"bSortClasses": false,
		"sDom": '<"ft_top"l<"findings_sel">pi>rt<"ft_bottom"l<"findings_sel">pi>',
		"aaSorting": [[ 3, "asc" ]],
		"aoColumns": [ { "sClass": "center", "bSortable": false },  /* checkbox */
		               { "bSearchable": false, "bVisible": false }, /* ID */
		               { "bSearchable": false, "bVisible": false }, /* ScanID */
		               null,	/* IP Address */
		               null,	/* Hostname */
		               null,	/* Port */
		               null,	/* Plugin */
		               null,	/* Severity */
		               null,	/* Finding */
		               null,	/* Remark */
		               { "bSearchable": false, "bVisible": false } /* Status */
		  			 ],
		"fnDrawCallback": function() {	/* Close any open panels */
			var nTr = $("#panelCloseButton").data('nTr');
			this.fnClose( nTr );
			bPanelOpen = false;
		}
	});
	
	// display finding count
	$('.findings_sel').html("<span>"+countFindingsSel+"</span> findings selected");
	
	// Set the handler for status category clicks
	$("span", "#centerCat").click( function () {
		if (!($(this).attr('status'))) return;	// If the label is clicked exit
		
		// change any selected category to not selected (should only be one, but why chance it :-)
		$("span:not(:first)", "#centerCat").each( function () {
			 if ($(this).hasClass("cat-selected")) {
				 $(this).removeClass("cat-selected")
				 		.addClass("cat-not-selected");
			 }
		});
		
		// Set the clicked on span as selected 
		$(this).removeClass("cat-not-selected")
			   .addClass("cat-selected");
		
		// Clear any selections
		$('#FindingSelectAll')[0].checked = false;
		$('#FindingSelectAll').triggerHandler('click');
		
		// Change the filter for the 10th column (status)
		oTable.fnFilter( $(this).attr('status'), 10 );
	});
	
	// Store the initial value of the inputs to be reused	
	$('input', '#findingFilter').each( function () {
		$(this).data( 'display_text', $(this).val() );
	});
	
	// selector for the Select All checkbox
	var sChkbx = $("#FindingSelectAll", "#findings_table");
	// Select All default is unchecked
	sChkbx.attr('checked', false);
	
	// Assign a click handler for the select all check box
	sChkbx.click(function() {
		var checkedStatus = this.checked;
		var aTrs = oTable.fnGetFilteredNodes();
		
		for ( var i=0 ; i<aTrs.length ; i++ )
		{	
			// Change the checkbox state
			$("input", aTrs[i])[0].checked = checkedStatus;
			// Change the selection class
			if (checkedStatus)
				$(aTrs[i]).addClass('select');
			else  
				$(aTrs[i]).removeClass('select');
		}
		checkedStatus ? countFindingsSel =  aTrs.length : countFindingsSel = 0;
		$('span', '.findings_sel').html(countFindingsSel);
	});
	
	// Assign a click handler for the table rows
	$('#findings_table tbody').delegate('tr','click', function (e) {
		if ($(e.target).is('a')) return;	// Allow links to be clicked without selecting row
		if ($(e.target).closest('.rowPanel').length == 1) return;	// Clicks .rowPanel should not select a row 
		
		if (!$(e.target).is('input'))
			$('td:first-child input', this)[0].checked = !$('td:first-child input', this)[0].checked;
		$(this).toggleClass('select');
		// Clear the Select All check box if clicked
		if ( $(sChkbx)[0].checked )
			$(sChkbx)[0].checked = false;
		// display finding count
		$('td:first-child input', this)[0].checked ? countFindingsSel += 1 : countFindingsSel -= 1;
		$('span', '.findings_sel').html(countFindingsSel);
	});

	// Handle clicks on the filter header
	$("#filterFheader").click(function () {
		sDiv = $(":first-child", this);
		
		if ( sDiv.hasClass("filterExpand")) {
			sDiv.text("Clear Filter");
			sDiv.removeClass("filterExpand");
			sDiv.addClass("filterCollapse");
		} else {
			sDiv.text("Filter");
			sDiv.removeClass("filterCollapse");
			sDiv.addClass("filterExpand");
			clearFilter();
		}
		
		$("#filterFcontent").slideToggle(500);
	});
	
	// Hide the Filter content initially
	$("#filterFcontent").hide();
	
	// Filter handlers
	// assign handler for select input filters
	$('#findingFilter').delegate('select', 'change', function () {
		var colNum = parseInt($(this).parent().attr('col'));
		if (colNum < 3 && colNum > 8) {
			console.error("Invalid column number for select filters");
			return;
		}
		// Clear any selections
		$("input", oTable.fnGetFilteredNodes()).attr('checked', false);
		$("#FindingSelectAll", "#findings_table").attr('checked', false);
		
		if (colNum == 3) oTable.fnDraw();
		else oTable.fnFilter( this.value, colNum );
	});

	$('#findingFilter').delegate('input', 'keyup', function () {
		var colNum = parseInt($(this).parent().attr('col'));
		if (colNum < 8 && colNum > 9) {
			console.error("Invalid column number for input filters");
			return;
		}
		// Clear any selections
		$("input", oTable.fnGetFilteredNodes()).attr('checked', false);
		$("#FindingSelectAll", "#findings_table").attr('checked', false);
		
		oTable.fnFilter( this.value, colNum );
	});
	
	// filter helper functions
	$('#findingFilter').delegate('select', 'focus', function () {
		if ($(this).hasClass("filterInit")) $(this).removeClass("filterInit");
	});
	
	$('#findingFilter').delegate('input', 'focus', function () {
		if ($(this).hasClass("filterInit")) {
			$(this).removeClass("filterInit");
			this.value = "";
		}
	});
	
	$('#findingFilter').delegate('select', 'blur', function () {
		if (this.value == "") $(this).addClass("filterInit");
	});
	
	$('#findingFilter').delegate('input', 'blur', function () {
		if (this.value == "") {
			$(this).addClass("filterInit");
			this.value = jQuery.data(this, "display_text");
		}
	});
	
	// More/Less click handler
	$("#findings_table").delegate('a.moreless', 'click', function() {
		moreless(this);
	});
	
	// initially hide the tab that will be attached to rows during mouseover in the findings table
	$("#panelButtons").hide();
	$("#panelCloseButton").hide();
	
	// Timer for panelButtons show/hide
	var timer = null;
	
	// handler for mouse over rows
	$('tbody', "#findings_table").delegate ('tr', 'mouseover mouseleave', function(e) {
		if (bPanelOpen) return false;	// if a panel is already displayed, don't do anything else
		
		if (e.type == 'mouseover') {
			// Clear the timer so the next row can be displayed
			if (timer) clearTimeout(timer);
			
			// Get the top left position of the row on the screen
			var rowOffset = $(this).offset();
			
			// Get the inner height of the row (no border or margin)
			var rowHeight = $(this).innerHeight();
			
			// Get the outer width of the row & panel
			var rowWidth = $(this).outerWidth();
			var panelWidth = $("#panelButtons").outerWidth();
			
			var posX = rowOffset.left + rowWidth/2 - panelWidth/2;
			var posY = rowOffset.top + rowHeight;
			
			// set rowTab position to be at the center and bottom of the row
			$('#panelButtons').css({top: posY, left: posX});
			
			// Set the current row
			$("#panelButtons").data('nTr', this);
			
			//show the rowTab
			$('#panelButtons').show();
		} else {
			// reset the timer if it gets fired again - avoids double animations
		    if (timer) clearTimeout(timer);
		      
			// store the timer so that it can be cleared in the mouseover if required
			timer = setTimeout(function () {
		        timer = null;
		        $('#panelButtons').hide();			// hide the panelButtons
		    }, 100);   // Set timer for 1/10 sec
		}
	});
	
	$("#panelButtons").hover( function () {
		// if mouse come from current row into this div then clear timer which cancels the hide
		if (timer) clearTimeout(timer);		
	}, function () {
		if (timer) clearTimeout(timer);
		// store the timer so that it can be cleared in the mouseover if required
		timer = setTimeout(function () {
	        timer = null;
	        $('#panelButtons').hide();			// hide the panelButtons
	    }, 100);   // Set timer for 1/10 sec
	});
	
	// Set the click handlers panelButtons buttons for the expandable row
	$("#btnEditRow").click( function (e) {
		if (!bPanelOpen) {
			var nTr = $("#panelButtons").data('nTr');
			var iCurStatus = parseInt($('#catFstatus .cat-selected').attr('status'));
			
			//  Display an edit form in a new row below the current row
			var newRow = oTable.fnOpen( nTr, fnFormatFindingEdit(iCurStatus), 'rowPanel' );
			
			// Set the current rows values in the form
			var aData = oTable.fnGetData( nTr );
			var curRemark = aData[9];
			curRemark = curRemark.replace(/<br>/g, "\n");
			$('#panelFindingRemark', newRow).val(curRemark);

			$('#panelButtons').hide();
			$("#panelCloseButton").data('nTr', nTr);
			bPanelOpen = true;
			
			$(".myform", ".rowPanel").unbind();
			// set Edit findings overlay button click handlers
			$(".myform", ".rowPanel").validator().submit(function(e) {
				if (!e.isDefaultPrevented()) {	// client-side validation passed
					e.preventDefault();
					
					// get user input
					var iStatus = $("#panelFindingStatus", this).val();
					var sRemark = $("#panelFindingRemark", this).val();
					sRemark = sRemark.replace(/<br>/g, "\n");
					var bOverwrite = $("#panelOverwriteRemark", this)[0].checked;
					var previousStatus = $('.cat-selected', '#centerCat').attr('status');
					var nTr = $("#panelCloseButton").data('nTr');
					var aTD = oTable.fnGetTd(nTr,1);
					var ID = [$(aTD).text()];
					
					// Change the scan name
					$.post("api/updateFindings.pl", {workspaceid: workspaceID, ids: ID,
							status: iStatus, remark: sRemark, overwrite: bOverwrite}, function(xml, txtStatus){
						// Store status of the result
						result = $("result", xml).text();
								
						if (result === "OK") { // if result is OK (successful)
							sRemark = sRemark.replace(/\n/g, "<br>");  // format for display
							if (bOverwrite) {	// if true overwrite remark 
								console.log("Overwriting remark for Finding ID "+ ID[0]);
								// Update the remark column 
								oTable.fnUpdate(sRemark, nTr, 9);
							} else {	// otherwise append to the remark
								console.log("Appending remark for Finding ID "+ ID[0]);
								var td = oTable.fnGetTd(nTr,9);  // get the cell with the ID in it
								oTable.fnUpdate($(td).html() + "<br>" + sRemark, nTr, 9);
							}
							if (iStatus != previousStatus) {	// if status changed	
								console.log("Changing Finding ID "+ ID[0] +" status from "+ previousStatus +" to "+ iStatus);
								// decrement the original status by one
								$("span[status="+previousStatus+"] span", "#centerCat").text( function (index, text) {
									return parseInt(text) - 1;
								});
								// increment the changed to status by one
								$("span[status="+iStatus+"] span", "#centerCat").text( function (index, text) {
									return parseInt(text) + 1;
								});
								// Update the status column
								oTable.fnUpdate(iStatus, nTr, 10);
							}
							
							// if finding is selected Update selected findings status
							if ($('td:first-child input', nTr)[0].checked) {
								countFindingsSel -= 1
								// clear the check mark and class selection
								$('td:first-child input', nTr)[0].checked = false;
								$(nTr).removeClass('select');
								$('span', '.findings_sel').html(countFindingsSel);
							}
						} else if (result === "NOK")  {	// Handle errors gracefully
							console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
						} else { // Handle unknown errors gracefully
							console.error("An unknown result was returned.\n"+
								"Please report the following result to the developers:\n" +
								$("seccubusAPI", xml).attr("name") + ": " + result);
						}
					}, "xml");
				}
				// never perform default submit on form
				return false;
			});
		}
	});
	$('tbody', '#findings_table').delegate('#panelOverwriteRemark', 'click', function() {
		if ($(this)[0].checked) 
			$("label[for=panelOverwriteRemark]").text("Overwrite this remark");
		else
			$("label[for=panelOverwriteRemark]").text("Append to this remark");
	});
	$("#btnIssueRow").click( function () {
		if (!bPanelOpen) {
			var nTr = $("#panelButtons").data('nTr');
			oTable.fnOpen( nTr, fnFormatFindingIssue(oTable, nTr), 'rowPanel' );
			$('#panelButtons').hide();
			$("#panelCloseButton").data('nTr', nTr);
			bPanelOpen = true;
		}
	});
	$("#btnHistoryRow").click( function () {
		if (!bPanelOpen) {
			var nTr = $("#panelButtons").data('nTr');	
			var aData = oTable.fnGetData( nTr );	// get the current row data
			var findingID = aData[1];	// get the current finding ID
			
			// Open a new row below the current row, formatted with the History table template
			var newRow = oTable.fnOpen( nTr, fnFormatFindingHistory(), 'rowPanel' );
			
			// Perform ajax call or post and insert data rows
			$.post("api/getFinding.pl", { workspaceID: workspaceID, findingID: findingID}, function(xml, txtStatus){
				// Store status of the result
				result = $("result", xml).text();
						
				if (result === "OK") { // if result is OK (successful)
					// This is the number of changes for this finding
					var max = $("changes", xml).attr("max");
					
					$("change", xml).each(function() {
						var dataRow = '<tr>';
						
						// insert Changed On
						dataRow += '<td>' + $("changetime", this).text() + '</td>';
						
						// insert Changed By
						dataRow += '<td>' + $("user", this).text() + '</td>';
						
						// insert Scan Time
						dataRow += '<td>' + $("scantime", this).text() + '</td>';
						
						// insert Finding 
						var max_finding_length = 50;
						var finding = htmlEncode($("finding", this).text()).replace(/\\n/g, "<br>");
						if ( finding.length > max_finding_length ) {
							// If the finding is large we need to add a long and short version and a more/less link
							var lfinding = $("finding", this).text();
							var sfinding = lfinding.slice(0,max_finding_length)	// get only a part of the finding
													.slice(0,-1) +	// Slice last char, in case sliced at newline char (\n) 
													" ...";		// Add etc.
							
							lfinding = htmlEncode(lfinding).replace(/\\n/g, "<br>");
							sfinding = htmlEncode(sfinding).replace(/\\n/g, "<br>");
							
							finding = "";
							finding += "<span id='fh" + findingID + "less'>" + sfinding + "</span>";
							finding += "<span id='fh" + findingID + "more' style='display: none;'>" + lfinding + "</span>";
							finding += "<div align='right'><a class='moreless' id='fh" + findingID + "'>[more]</a></div>";
						}
						dataRow += '<td>' + finding + '</td>';
						
						// insert Remark 
						dataRow += '<td>' + 
									htmlEncode($("remark", this).text()).replace(/\\n/g, "<br>") +
									'</td>';
						
						// insert Severity
						dataRow += '<td>' + $("severity", this).text() + '</td>';
						
						// insert Status
						dataRow += '<td>' + $("status", this).text() + '</td>';
						
						dataRow += '</tr>';
						$('#history_table > tbody:last', newRow).append(dataRow);
					});
					
					// Change table into Datatable
					$('#history_table', newRow).dataTable({
						"bAutoWidth": true,
						"bFilter": false,
						"bInfo": false,
						"bPaginate": false,
						"bProcessing": true,
						"bSortClasses": false,
						"sScrollY": "200px",
						"sScrollX": "100%",
						"aaSorting": [[ 0, "desc" ]]
					});
				} else if (result === "NOK")  {	// Handle errors gracefully
					console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
				} else { // Handle unknown errors gracefully
					console.error("An unknown result was returned.\n"+
						"Please report the following result to the developers:\n" +
						$("seccubusAPI", xml).attr("name") + ": " + result);
				}
			});

			$('#panelButtons').hide();
			$("#panelCloseButton").data('nTr', nTr);
			bPanelOpen = true;
		}
	});
	$('tbody', '#findings_table').delegate('#btnCloseRow', 'click', function () {
		var nTr = $("#panelCloseButton").data('nTr');
		oTable.fnClose( nTr );
		bPanelOpen = false;
	});
	
	//Initialize edit findings overlay
	$("#btnEditFindings").overlay({
		mask: {
			color: '#dff4ff',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onLoad: function (event) { $("input:text:visible:first", "#editFindings").focus(); },	// Set focus to the first input field
		onBeforeLoad: function (event) {
			//$("#findingsStatus", "#editFindings").val($('.cat-selected', '#centerCat').attr('status'));
			intCurStatus = parseInt($('.cat-selected', '#centerCat').attr('status'));
			$("#findingsStatus", "#editFindings").html(fnSetEditFindingStatus(intCurStatus));
			$("#overwriteRemark", "#editFindings")[0].checked = true;
			$("label[for=overwriteRemark]").text("Overwrite the current remark(s)");
		},
		onBeforeClose: function (event) {
			$("#findingsRemark", "#editFindings").val("");
			$("#overwriteRemark", "#editFindings").attr('checked', false);
			$(".error", "#editFindings").hide();				// Hide all error messages
		}
	});
	$("#overwriteRemark", "#editFindings").click( function() {
		if ($(this)[0].checked) 
			$("label[for=overwriteRemark]").text("Overwrite the current remark(s)");
		else
			$("label[for=overwriteRemark]").text("Append to current remark(s)");
	});
	// set Edit findings overlay button click handlers
	$("form", "#editFindings").validator().submit(function(e) {
		if (!e.isDefaultPrevented()) {	// client-side validation passed
			e.preventDefault();
			
			// get user input
			var iStatus = $("#findingsStatus", "#editFindings").val();
			var sRemark = $("#findingsRemark", "#editFindings").val();
			sRemark = sRemark.replace(/<br>/g, "\n");
			var bOverwrite = $("#overwriteRemark", "#editFindings")[0].checked;
			
			var previousStatus = $('.cat-selected', '#centerCat').attr('status');
			
			var aIDs = fnGetSelectedFindingIDs(oTable);
			
			if (aIDs.length <= 0) {
				alert("No findings are selected. Please select at least one finding before editing.");
				// close the overlay
				$(".close").click();
				return false;
			}
				
			// Change the scan name
			$.post("api/updateFindings.pl", {workspaceid: workspaceID, ids: aIDs,
					status: iStatus, remark: sRemark, overwrite: bOverwrite}, function(xml, txtStatus){
				// Store status of the result
				result = $("result", xml).text();
								
				if (result === "OK") { // if result is OK (successful)  
					console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					$(".close", "#editFindings").click();
					
					sRemark = sRemark.replace(/\n/g, "<br>");
					// Modify the rows in the table?
					var aTrs = oTable.fnGetFilteredNodes();
					
					for ( var i=0 ; i<aTrs.length ; i++ )
					{	
						if ( $('td:first-child input', aTrs[i])[0].checked )
						{
							var aTD;
							if (bOverwrite) {	// if true overwrite remark 
								// Update the remark column 
								oTable.fnUpdate(sRemark, aTrs[i], 9);
							} else {	// otherwise append to the remark
								var aTD = oTable.fnGetTd(aTrs[i],9);  // get the cell with the ID in it
								oTable.fnUpdate($(aTD).html() + "<br>" + sRemark, aTrs[i], 9);
							}
							if (iStatus != previousStatus) {	// if status changed
								
								// decrement the original status by one
								$("span[status="+previousStatus+"] span", "#centerCat").text( function (index, text) {
									return parseInt(text) - 1;
								});
								// increment the changed to status by one
								$("span[status="+iStatus+"] span", "#centerCat").text( function (index, text) {
									return parseInt(text) + 1;
								});
								
								// Update the status column
								oTable.fnUpdate(iStatus, aTrs[i], 10);
							}
							
							// clear the check mark and class selection after changes have been applied
							$('td:first-child input', aTrs[i])[0].checked = false;
							$(aTrs[i]).removeClass('select');
							
						}
						// Update selected findings #
						countFindingsSel = 0;
						$('span', '.findings_sel').html(countFindingsSel);
					}
					// Clear the Select All check box if clicked
					if ( $(sChkbx)[0].checked )
						$(sChkbx)[0].checked = false;
				} else if (result === "NOK")  {	// Handle errors gracefully
					console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
					// close the overlay
					$(".close").click();
				} else { // Handle unknown errors gracefully
					console.error("An unknown result was returned.\n"+
						"Please report the following result to the developers:\n" +
						$("seccubusAPI", xml).attr("name") + ": " + result);
					// close the overlay
					$(".close").click();
				}
			}, "xml");
		}
			
		// do not perform default submittion of the form
		return false;
	});

	//Initialize add findings to issue overlay
	$("#btnAddFindingsIssue").overlay({
		mask: {
			color: '#e6efc2',
			loadSpeed: 'normal',
			opacity: 0.9
		},
		closeOnClick: false,
		onBeforeLoad: function (event) {
			// Fill in the values for adding to an existing issue 
			//$(selectIssue).
		},
		onLoad: function (event) { $("input:text:visible:first", "#addFindingsIssue").focus(); },	// Set focus to the first input field
		onBeforeClose: function (event) {
			//$("#edit_scan_name", "#editScan").val("");		// Clear the scan name field
			$(".error").hide();				// Hide all error messages
		}
	});
	// Initial settings for the addFindingsIssue form
	$('.elemNewIssue').attr('disabled',true);
	$('.elemAddIssue').attr('disabled',true);
	// Click handlers for the addFindinsIssue form
	$("button:reset", "#addFindingsIssue").click(function(e) {
		$('.elemNewIssue').attr('disabled',true);
		$('.elemAddIssue').attr('disabled',true);
	});
	$("#addToIssue", "#addFindingsIssue").click(function() {
		 $('.elemNewIssue').attr('disabled',true);
		 $('.elemAddIssue').removeAttr('disabled');
		 $("#newIssue", "#addFindingsIssue").attr('checked', false);
	});
	$("#newIssue", "#addFindingsIssue").click(function() {
		$('.elemAddIssue').attr('disabled',true);
		$('.elemNewIssue').removeAttr('disabled');
		$("#addToIssue", "#addFindingsIssue").attr('checked', false);
	});
	// set Edit findings overlay button click handlers
	$("form", "#addFindingsIssue").validator().submit(function(e) {
		if (!e.isDefaultPrevented()) {	// client-side validation passed
			e.preventDefault();
		}
	});
}

/*
 * Returns an array of all the IDs in a row of datatable that have the class row_selected set
 * 
 * Supports filtered tables
 */
function fnGetSelectedFindingIDs( oTableLocal )
{
	var aReturn = new Array();
	var aTrs = oTableLocal.fnGetFilteredNodes();
	
	for ( var i=0 ; i<aTrs.length ; i++ )
	{	
		if ( $('td:first-child input', aTrs[i])[0].checked )
		{
			var aTD = oTableLocal.fnGetTd(aTrs[i],1);  // get the cell with the ID in it
			aReturn.push( $(aTD).text() );
		}
	}
	return aReturn;
}

/* Formating functions for individual findings edits and issues */
function fnFormatFindingEdit(currentStatus)
{
	sOut = '<form class="myform">'+
	  		'<fieldset>'+
	  		 '<table>'+
	  		  '<tr><td colspan="4">'+
	  		   '<h3>Edit this finding</h3><br>'+
	  		  '</td></tr>'+
	  		  '<tr><td>'+
	  		   '<label for="panelFindingStatus">Status:</label>'+
	  		  '</td><td>'+
	  		   '<select id="panelFindingStatus">';
	sOut += fnSetEditFindingStatus(currentStatus);
	sOut +=   '</select>'+
	  		  '</td><td>'+
	  		   '<label for="panelFindingRemark">&nbsp;&nbsp;&nbsp;Remark:</label>'+
	  		  '</td><td>'+
	  		   '<textarea id="panelFindingRemark" cols="40" rows="5" wrap="hard"></textarea>'+
	  		  '</td></tr>'+
	  		  '<tr><td></td><td></td><td></td><td>'+
	  		   '<input type="checkbox" id="panelOverwriteRemark" checked/><label for="panelOverwriteRemark">'+
	  		   'Overwrite this remark</label>'+
	  		  '</td></tr><tr><td colspan="4">'+
	  		   '<div class="buttons" style="padding: 10px 0;">'+
	  		    '<button type="submit" class="positive">Update</button>'+
	  		    '<button type="reset" class="negative">Reset</button>'+
	  		   '</div>'+
	  		  '</td></tr>'+
	  		 '</table>'+
	  		'</fieldset>'+
	  	   '</form>';
	
	sOut += '<div id="panelCloseButton">' + $('#panelCloseButton').html() + '</div>';
	
	return sOut;
}

function fnSetEditFindingStatus( intStatus ){
	var options = "";
	
	if (!intStatus) return options;
	
	switch (intStatus) {
	case 1:
		options = '<option value="1">New</option>'+
	    	'<option value="3">Open</option>'+
	    	'<option value="4">No Issue</option>'+
	    	'<option value="99">MASKED</option>';
		break;
	case 2:
		options = '<option value="2">Changed</option>'+
	    	'<option value="3">Open</option>'+
	    	'<option value="4">No Issue</option>'+
	    	'<option value="99">MASKED</option>';
		break;
	case 3:
		options = '<option value="3">Open</option>'+
			'<option value="4">No Issue</option>'+
	    	'<option value="6">Closed</option>'+
	    	'<option value="99">MASKED</option>';
		break;
	case 4:
		options = '<option value="4">No Issue</option>'+
			'<option value="3">Open</option>'+
	    	'<option value="99">MASKED</option>';
		break;
	case 5:
		options = '<option value="5">Gone</option>'+
			'<option value="3">Open</option>'+
			'<option value="4">No Issue</option>'+ 
			'<option value="99">MASKED</option>';
		break;
	case 6:
		options = '<option value="6">Closed</option>'+
			'<option value="3">Open</option>'+
			'<option value="4">No Issue</option>'+
	    	'<option value="99">MASKED</option>';
		break;
	case 99:
		options = '<option value="99">MASKED</option>'+
			'<option value="1">New</option>';
		break;
	}
	
	return options;
}

function fnFormatFindingIssue ( oTable, nTr )
{
	var aData = oTable.fnGetData( nTr );
	var sOut = '<span>Issue form goes here</span>';
	
	sOut += '<div id="panelCloseButton">' + $('#panelCloseButton').html() + '</div>';
	
	return sOut;
}

function fnFormatFindingHistory( )
{
	var sOut = '<h3>Finding History</h3>'+
    	   '<table cellspacing="1" id="history_table">'+
    	    '<thead>'+
    	     '<tr>'+
    	      '<th>Changed On</th>'+
    	      '<th>Changed By</th>'+
    	      '<th>Scan Time</th>'+
    	      '<th>Finding</th>'+
    	      '<th>Remark</th>'+ 
    	      '<th>Severity</th>'+
    	      '<th>Status</th>'+
    	     '</tr>'+
    	    '</thead>'+
    	    '<tbody>'+
    	    '</tbody>'+
    	   '</table>';
	sOut += '<div style="clear: both;"><br></div>';
	sOut += '<div id="panelCloseButton">' + $('#panelCloseButton').html() + '</div>';
	
	return sOut;
}

// Clears the select dropdowns and text input filters for the findings table
function clearFilter() {
	$("#findingFilter div").each (function () {
		if (!$('select', this).hasClass('filterInit')) {
		$('select', this).val("")
						 .change()
						 .blur();
		}
		if (!$('input', this).hasClass('filterInit')) {
		$('input', this).val("")
						.keyup()
						.blur();
		}
	});
}

function removeFindings(scanID) {
	var oTable;
	var oStatus = new Object();
	var aReturn = new Array();
	
	clearFilter();	// clear any filter
	// clear any selected findings
	$('#FindingSelectAll')[0].checked = false;
	$('#FindingSelectAll').triggerHandler('click');
	
	oTable = $('#findings_table').dataTable();  // grab the table object
	var aTrs = oTable.fnGetNodes();				// grab the rows
	
	// Find rows that have a scanID that matches
	for ( var i=0 ; i<aTrs.length ; i++ )
	{
		var n2Td = oTable.fnGetTd(aTrs[i],2); // grab the 2nd colum of this row
		if ( $(n2Td).text() == scanID )		// if it matches the scanID, remove it
		{
			var n10Td = oTable.fnGetTd(aTrs[i],10);	// grab the 10th column to get the status
			var statusNum = $(n10Td).text();
			
			// Keep track of the number of findings removed for each status
			if (!oStatus[statusNum]) oStatus[statusNum] = 0; 
			oStatus[statusNum] = oStatus[statusNum] + 1; 
			
			/* Remove row */
			oTable.fnDeleteRow( aTrs[i] );
		}
	}
	
	// Decrement the status counters
	for (var i in oStatus) {
		$("span[status="+i+"] span", "#centerCat").text( function (index, text) {
			return parseInt(text) - oStatus[i];
		});
	}
	
	// Reload the filters
	fnLoadFilters();
}

var filterTimer = null;

// Load findings for a certain scan of the current workspace.
//function loadFindings(beforeFunc, scanID, afterFunc) {
function loadFindings(scanID) {
	clearFilter();	// clear any filter
	// clear any selected findings
	$('#FindingSelectAll')[0].checked = false;
	$('#FindingSelectAll').triggerHandler('click');
	
	// Get the findings list via XML and process it.
	$.post("api/getFindings.pl", { 	workspaceID: workspaceID,
					scanID: scanID,
					host: "all",
					hostname: "all",
					port: "all",
					plugin: "all",
					severity: "all",
					finding: "",
					remark: "",
				}, function(xml, txtStatus){
		// Store status of the result
		result = $("result", xml).text();
									
		if (result === "OK") { // if result is OK (successful)	
			console.log($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
			var all_rows = [];	// Store row in memory for formatting and quick loading

			// Process each finding returned
			$("finding", xml).each(function() {
				var max_finding_length = 150;
				var row = [];
			
				var id = $(this).attr("id");
				var sevText = $("severity", this).text();
				var sevNum = $("severity", this).attr("id");
				var checkbox = "<input type='checkbox' id='" + id + "'>";
				var remark = htmlEncode($(this).attr("remark")).replace(/\\n/g,"<br>");
				if (remark.length > max_finding_length) max_finding_length = remark.length;
				// The finding text
				var finding = htmlEncode($("output", this).text()).replace(/\\n/g, "<br>");
				if ( finding.length > max_finding_length ) {
					// If the finding is large we need to add a long and short version and a more/less link
					var lfinding = $("output", this).text();
					var sfinding = lfinding.slice(0,max_finding_length)	// get only a part of the finding
											.slice(0,-1) +	// Slice last char, in case sliced at newline char (\n) 
											" ...";		// Add etc.
				
					lfinding = htmlEncode(lfinding).replace(/\\n/g, "<br>");
					sfinding = htmlEncode(sfinding).replace(/\\n/g, "<br>");
				
					finding = "";
					finding += "<span id='f" + id + "less'>" + sfinding + "</span>";
					finding += "<span id='f" + id + "more' style='display: none;'>" + lfinding + "</span>";
					finding += "<div align='right'><a class='moreless' id='f" + id + "'>[more]</a></div>";
				}
			
				row.push( checkbox, id, scanID, $(this).attr("host"), $(this).attr("hostname"), $(this).attr("port"),
							$(this).attr("plugin"), sevNum+". "+sevText, finding, remark, $("status", this).attr("id") );
			
				all_rows.push(row);
			});
		
			var oTable = $('#findings_table').dataTable();
		
			// Add the data
			var ai = oTable.fnAddData(all_rows);
		
			// Add row attributes
			for (var i=0; i < all_rows.length; i++) {
				var selTR = oTable.fnSettings().aoData[ ai[i] ].nTr;
				var sev = $("td:nth-child(6)", selTR).text();
				$(selTR)//.attr('title', "Click to select finding") 
					.addClass('s'+ sev.substring(0,1));
			}

			// increment count on all status categories
			$("span", "#centerCat").each( function () {
				if (!($(this).attr('status'))) return;
			
				var count  = $(".count", this).text();
				var scount = $("count",xml).attr("status_"+ $(this).attr('status'));
			
				if (!scount) scount = "0";
				count = parseInt(count) + parseInt(scount);
				$(".count", this).text(count);
			});
		
			// Set the default category to New when a scan is loaded
			$("#cat-none").trigger('click');
		
			// clear timer if is already set, so this function is only called once
			if (filterTimer) clearTimeout(filterTimer);
			// store the timer so that it can be cleared, if needed
			filterTimer = setTimeout(function () {
				filterTimer = null;
				// load the filters with appropriate values
				fnLoadFilters();
			}, 50);
		
			// get the progress overlay
			var apiOverlay = $("#progress").data("overlay");
		
			// clear timer if is already set, keeps overlay visible during multiple loadFindings calls
			if (progressTimer) clearTimeout(progressTimer);
			// store the timer so that it can be cleared, if needed
			progressTimer = setTimeout(function () {
				progressTimer = null;
				apiOverlay.close();	
			}, 50);
		} else if (result === "NOK")  {	// Handle errors gracefully
			console.error($("seccubusAPI", xml).attr("name") + ": " + $("message", xml).text());
		} else { // Handle unknown errors gracefully
			console.error("An unknown result was returned.\n"+
				"Please report the following result to the developers:\n" +
				$("seccubusAPI", xml).attr("name") + ": " + result);
		}
	}, "xml");
}

function fnLoadFilters() {
	var oTable = $('#findings_table').dataTable(); 
		
	// configure filters after data has been loaded  
	$("#findingFilter div").each( function ( i ) {
		// Get column number to sort on
		var colNum = $(this).attr('col');
		// Get the header cell for the column
		var nTh = oTable.fnSettings().aoColumns[ colNum ].nTh;
		
		var aData = oTable.fnGetColumnData(colNum,true,false,true);
		if (colNum == 3) {  // if column is IP addresses then
			var aOctets = [];
			var aStrSubnet = [];
			
			aData.sort( ipSortAsc );	// sort ascending
			
			var aOctet = aData[0].split(".");	// get all octets of first IP
			aOctet.pop();	// don't need last octet
			aStrSubnet.push( aOctet[0] );
			aStrSubnet.push( aOctet[0]+"."+aOctet[1] );
			aStrSubnet.push( aOctet[0]+"."+aOctet[1]+"."+aOctet[2] );
			var aDataLen = aData.length;
			for ( var y=1; y<aDataLen; y++ ) {
				var bStrSubnet = [];
				var bOctet = aData[y].split(".");	// get all octets of subsequent IPs
				bOctet.pop();	// don't need last octet
				bStrSubnet.push( bOctet[0] );
				bStrSubnet.push( bOctet[0]+"."+bOctet[1] );
				bStrSubnet.push( bOctet[0]+"."+bOctet[1]+"."+bOctet[2] );
				var b0Found = b1Found = b2Found = false;
				var aStrSubnetLen = aStrSubnet.length;
				for ( var z=0; z<aStrSubnetLen; z++ ) {
					if ( bStrSubnet[2] == aStrSubnet[z] ) b2Found = true;
					else if ( bStrSubnet[1] == aStrSubnet[z] ) b1Found = true;
					else if ( bStrSubnet[0] == aStrSubnet[z] ) b0Found = true;
				}
				if (!b0Found) aStrSubnet.push(bStrSubnet[0]);
				if (!b1Found) aStrSubnet.push(bStrSubnet[1]);
				if (!b2Found) aStrSubnet.push(bStrSubnet[2]);
			}
			aStrSubnet.sort( ipSortDesc );
			for ( var c in aStrSubnet )
				aData.unshift( aStrSubnet[c] );
		}
		else if (colNum == 4) {	// if column is hostname
		}
		else if (colNum == 5) {		// if column is ports
			var aText = [];
			var seperator = aData[0].match(/[\/_]/);
			for (var i=0; i<aData.length; i++) { // remove any text only values from the first part
				if ( isNaN(aData[i].charAt(0)) ) {
					aText.push(aData[i]);
					aData.splice(i,1);
					i--;
				}
			}
			aData.sort(function(a,b) {
				var m = a.split(seperator);
				var n = b.split(seperator);
				
				if (parseInt(m[0]) < parseInt(n[0])) return -1
				else if (parseInt(m[0]) > parseInt(n[0])) return 1
				else {
					if (m[1] < n[1]) return -1
					else if (m[1] > n[1]) return 1
					else return 0;
				}
			});
			if (aText[0] != null) {	// add sorted text only values back to beginning 
				aText.sort();
				aText.reverse();
				for (var x in aText) aData.unshift(aText[x]);
			}
		}
		else if (colNum == 6) {
			var aText = [];
			for (var i in aData) {  // remove any text only values
				if ( isNaN(aData[i].charAt(0)) ) {
					aText.push(aData[i]);
					aData.splice(i,1);
				}
			}
			aData.sort(function (a, b) {
				return (a - b)
			});
			if (aText[0] != null) {	// add sorted text only values back to beginning 
				aText.sort();
				aText.reverse();
				for (var x in aText) aData.unshift(aText[x]);
			}
		} else if (colNum == 7) aData.sort();
		
		// add select input filters
		if (colNum < 8) {
			$(this).html( fnCreateSelect(aData, "Filter by "+ $(nTh).html()) );
			
			// assign a id name to the filter for the 3rd column 
			// (this will be used for a custom filter)
			if (colNum == 3) {
				$('select', this).attr('id', 'ip');
			}
		}
			
		// Have to make sure the initial value is displayed (for some reason)
		$('input', this).val($('input', this).data( 'display_text'));
	});
}

				
// This helper function takes some text and translates it to HTML by creating a
// DIV and returning the HTML value of the text assigned to it.
function htmlEncode(value){ 
	return $('<div/>').text(value).html(); 
} 

// THis helper function takes some HTML and translates it to txt by creating a 
// DIV abd returning the text value of the HTML assigned to it.
function htmlDecode(value){ 
    return $('<div/>').html(value).text(); 
}

// The moreless function toggles the visiblity of two divs based on the text 
// of the element
function moreless(context) {
	var id = $(context).attr("id");
	if ( $(context).text() == "[more]" ) {
		$(context).text("[less]");
		$("#" + id + "more").show();
		$("#" + id + "less").hide();
	} else {
		$(context).text("[more]");
		$("#" + id + "less").show();
		$("#" + id + "more").hide();
	}
}

// Show please wait overlay
function pleaseWait() {
	$("#loading").text("Please wait...");
	$("#loading").show();
}

// Hide please wait overlay
function clearWait() {
	$("#loading").text("Ready...");
	$("#loading").hide();
}

// These two ase 64 routines have been taken from 
// http://www.webtoolkit.info/javascript-base64.html and are licensed as 
// specified here: http://www.webtoolkit.info/licence.html
function base64_decode(input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
	
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
	while (i < input.length) {
		enc1 = _keyStr.indexOf(input.charAt(i++));
		enc2 = _keyStr.indexOf(input.charAt(i++));
		enc3 = _keyStr.indexOf(input.charAt(i++));
		enc4 = _keyStr.indexOf(input.charAt(i++));
		
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		
		output = output + String.fromCharCode(chr1);
		
		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
	}
	
	return output;
}

function base64_encode(input) {
	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;

	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	while (i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
 
		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}
 
		output = output +
		this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
		this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
	}
 
	return output;
}

/******************************************************************************
 * DataTables plugins, additions, modifications, etc...
 *****************************************************************************/
$.fn.dataTableExt.oPagination.four_button = {
	/*
	 * Function: oPagination.four_button.fnInit
	 * Purpose:  Initalise dom elements required for pagination with a list of the pages
	 * Returns:  -
	 * Inputs:   object:oSettings - dataTables settings object
	 *           node:nPaging - the DIV which contains this pagination control
	 *           function:fnCallbackDraw - draw function which must be called on update
	 */
	"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
	{
		nFirst = document.createElement( 'span' );
		nPrevious = document.createElement( 'span' );
		nNext = document.createElement( 'span' );
		nLast = document.createElement( 'span' );
			
		nFirst.appendChild( document.createTextNode( " " ) );
		nPrevious.appendChild( document.createTextNode( " " ) );
		nNext.appendChild( document.createTextNode( " " ) );
		nLast.appendChild( document.createTextNode( " " ) );
					
		nFirst.className = "paginate_button first";
		nPrevious.className = "paginate_button previous";
		nNext.className="paginate_button next";
		nLast.className = "paginate_button last";
		
		nPaging.appendChild( nFirst );
		nPaging.appendChild( nPrevious );
		nPaging.appendChild( nNext );
		nPaging.appendChild( nLast );
		
		$(nFirst).click( function () {
			oSettings.oApi._fnPageChange( oSettings, "first" );
			fnCallbackDraw( oSettings );
		} );
		
		$(nPrevious).click( function() {
			oSettings.oApi._fnPageChange( oSettings, "previous" );
			fnCallbackDraw( oSettings );
		} );
			
		$(nNext).click( function() {
			oSettings.oApi._fnPageChange( oSettings, "next" );
			fnCallbackDraw( oSettings );
		} );
		
		$(nLast).click( function() {
			oSettings.oApi._fnPageChange( oSettings, "last" );
			fnCallbackDraw( oSettings );
		} );
		
		/* Disallow text selection */
		$(nFirst).bind( 'selectstart', function () { return false; } );
		$(nPrevious).bind( 'selectstart', function () { return false; } );
		$(nNext).bind( 'selectstart', function () { return false; } );
		$(nLast).bind( 'selectstart', function () { return false; } );
	},
	
	/*
	 * Function: oPagination.four_button.fnUpdate
	 * Purpose:  Update the list of page buttons shows
	 * Returns:  -
	 * Inputs:   object:oSettings - dataTables settings object
	 *           function:fnCallbackDraw - draw function which must be called on update
	 */
	"fnUpdate": function ( oSettings, fnCallbackDraw )
	{
		if ( !oSettings.aanFeatures.p )
		{
			return;
		}
	
		/* Loop over each instance of the pager */
		var an = oSettings.aanFeatures.p;
		for ( var i=0, iLen=an.length ; i<iLen ; i++ )
		{
			var buttons = an[i].getElementsByTagName('span');
			if ( oSettings._iDisplayStart === 0 )
			{
				buttons[0].className = "paginate_disabled_first";
				buttons[1].className = "paginate_disabled_previous";
			}
			else
			{
				buttons[0].className = "paginate_enabled_first";
				buttons[1].className = "paginate_enabled_previous";
			}
		
			if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
			{
				buttons[2].className = "paginate_disabled_next";
				buttons[3].className = "paginate_disabled_last";
			}
			else
			{
				buttons[2].className = "paginate_enabled_next";
				buttons[3].className = "paginate_enabled_last";
			}
		}
	}
};

(function($) {
	/*
	 * Function: fnGetColumnData
	 * Purpose:  Return an array of table values from a particular column.
	 * Returns:  array string: 1d data array 
	 * Inputs:   object:oSettings - dataTable settings object. This is always the last argument past to the function
	 *           int:iColumn - the id of the column to extract the data from
	 *           bool:bUnique - optional - if set to false duplicated values are not filtered out
	 *           bool:bFiltered - optional - if set to false all the table data is used (not only the filtered)
	 *           bool:bIgnoreEmpty - optional - if set to false empty values are not filtered from the result array
	 * Author:   Benedikt Forchhammer <b.forchhammer /AT\ mind2.de>
	 */
	$.fn.dataTableExt.oApi.fnGetColumnData = function ( oSettings, iColumn, bUnique, bFiltered, bIgnoreEmpty ) {
		// check that we have a column id
		if ( typeof iColumn == "undefined" ) return new Array();
		
		// by default we only wany unique data
		if ( typeof bUnique == "undefined" ) bUnique = true;
		
		// by default we do want to only look at filtered data
		if ( typeof bFiltered == "undefined" ) bFiltered = true;
		
		// by default we do not wany to include empty values
		if ( typeof bIgnoreEmpty == "undefined" ) bIgnoreEmpty = true;
		
		// list of rows which we're going to loop through
		var aiRows;
		
		// use only filtered rows
		if (bFiltered == true) aiRows = oSettings.aiDisplay; 
		// use all rows
		else aiRows = oSettings.aiDisplayMaster; // all row numbers

		// set up data array	
		var asResultData = new Array();
		
		for (var i=0,c=aiRows.length; i<c; i++) {
			iRow = aiRows[i];
			var aData = this.fnGetData(iRow);
			var sValue = aData[iColumn];
			
			// ignore empty values?
			if (bIgnoreEmpty == true && sValue.length == 0) continue;

			// ignore unique values?
			else if (bUnique == true && jQuery.inArray(sValue, asResultData) > -1) continue;
			
			// else push the value onto the result data array
			else asResultData.push(sValue);
		}
		
		return asResultData;
	}
}(jQuery));

function fnCreateSelect( aData, sTitle )
{
	var r='<select class="filterInit"><option value="">'+sTitle+'</option>';
	for ( var i=0 ; i<aData.length ; i++ )
	{
		r += '<option value="'+aData[i]+'">'+aData[i]+'</option>';
	}
	return r+'</select>';
}

$.fn.dataTableExt.oApi.fnGetFilteredNodes = function ( oSettings )
{
	var anRows = [];
	for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
	{
		var nRow = oSettings.aoData[ oSettings.aiDisplay[i] ].nTr;
		anRows.push( nRow );
	}
	return anRows;
};

/*
 * Function: fnGetDisplayNodes
 * Purpose:  Return an array with the TR nodes used for displaying the table
 * Returns:  array node: TR elements
 *           or
 *           node (if iRow specified)
 * Inputs:   object:oSettings - automatically added by DataTables
 *           int:iRow - optional - if present then the array returned will be the node for
 *             the row with the index 'iRow'
 */
$.fn.dataTableExt.oApi.fnGetDisplayNodes = function ( oSettings, iRow )
{
	var anRows = [];
	if ( oSettings.aiDisplay.length !== 0 )
	{
		if ( typeof iRow != 'undefined' )
		{
			return oSettings.aoData[ oSettings.aiDisplay[iRow] ].nTr;
		}
		else
		{
			for ( var j=oSettings._iDisplayStart ; j<oSettings._iDisplayEnd ; j++ )
			{
				var nRow = oSettings.aoData[ oSettings.aiDisplay[j] ].nTr;
				anRows.push( nRow );
			}
		}
	}
	return anRows;
};

var ipSortAsc =jQuery.fn.dataTableExt.oSort['ip-address-asc']  = function(a,b) {
	var m = a.split("."), x = "";
	var n = b.split("."), y = "";
	for(var i = 0; i < m.length; i++) {
		var item = m[i];
		if(item.length == 1) {
			x += "00" + item;
		} else if(item.length == 2) {
			x += "0" + item;
		} else {
			x += item;
		}
	}
	for(var i = 0; i < n.length; i++) {
		var item = n[i];
		if(item.length == 1) {
			y += "00" + item;
		} else if(item.length == 2) {
			y += "0" + item;
		} else {
			y += item;
		}
	}
	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};

var ipSortDesc = jQuery.fn.dataTableExt.oSort['ip-address-desc'] = function(a,b) {
	var m = a.split("."), x = "";
	var n = b.split("."), y = "";
	for(var i = 0; i < m.length; i++) {
		var item = m[i];
		if(item.length == 1) {
			x += "00" + item;
		} else if (item.length == 2) {
			x += "0" + item;
		} else {
			x += item;
		}
	}
	for(var i = 0; i < n.length; i++) {
		var item = n[i];
		if(item.length == 1) {
			y += "00" + item;
		} else if (item.length == 2) {
			y += "0" + item;
		} else {
			y += item;
		}
	}
	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};

/* Custom filtering function which will filter data in column four by ip address v4 */
$.fn.dataTableExt.afnFiltering.push(
	function( oSettings, aData, iDataIndex ) {
		if (!document.getElementById("ip")) return true
		var x = document.getElementById("ip").selectedIndex;
		var SearchIP = document.getElementById("ip").options[x].value;
		if (SearchIP == "") return true;
		var SearchOctets = SearchIP.split(".");
		var ColOctets = aData[3].split(".");
		
		if (SearchOctets[3] != null) {
			if (SearchOctets[0] == ColOctets[0])
				if (SearchOctets[1] == ColOctets[1])
					if (SearchOctets[2] == ColOctets[2])
						if (SearchOctets[3] == ColOctets[3])
							return true;
		} else if (SearchOctets[2] != null) {
			if (SearchOctets[0] == ColOctets[0])
				if (SearchOctets[1] == ColOctets[1])
					if (SearchOctets[2] == ColOctets[2])
						return true;
		} else if (SearchOctets[1] != null) {
			if (SearchOctets[0] == ColOctets[0])
				if (SearchOctets[1] == ColOctets[1])
					return true;
		} else if (SearchOctets[0] != null) {
			if (SearchOctets[0] == ColOctets[0])
				return true;
		}
		
		return false;
	}
);

jQuery.fn.dataTableExt.aTypes.push(
		function ( sData )
		{
			if (/^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/.test(sData)) {
				return 'ip-address';
			}
			return null;
		}
	);

/*
 * Function: $().dataTable().fnGetTd
 * Purpose:  Get a TD node from a row, taking into account column visibility
 * Returns:  node: - TD element
 * Inputs:   mixed:mTr - 
 *             node: - TR element to get the TD child from
 *             int: - aoData index
 *           int:iTd - TD node index to get
 *           bool:bVisOnly - optional - if true then only visible columns are counted for the iTd
 *             parameter. If not given or false then both hidden and visible columns will be used
 */
$.fn.dataTableExt.oApi.fnGetTd  = function ( oSettings, mTr, iTd, bVisOnly )
{
	/* Take either a TR node or aoData index as the mTr property */
	var iRow = (typeof mTr == 'object') ? 
		oSettings.oApi._fnNodeToDataIndex(oSettings, mTr) : mTr;
	
	if ( typeof bVisOnly == 'undefined' && !bVisOnly )
	{
		/* Looking at both visible and hidden TD elements - convert to visible index, if not present
		 * then it must be hidden. Return as appropriate
		 */
		var iCalcVis = oSettings.oApi._fnColumnIndexToVisible( oSettings, iTd );
		if ( iCalcVis !== null )
		{
			return oSettings.aoData[ iRow ].nTr.getElementsByTagName('td')[ iCalcVis ];
		}
		else
		{
			return oSettings.aoData[ iRow ]._anHidden[ iTd ];
		}
	}
	else
	{
		/* Only looking at visible TD elements, so just use getElements... */
		return oSettings.aoData[ iRow ].nTr.getElementsByTagName('td')[ iTd ];
	}
}