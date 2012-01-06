// ----------------------------------------------------------------------------
// $Id$
// ----------------------------------------------------------------------------
// Main program Javascript routines
// ----------------------------------------------------------------------------
// Copyright (C) 2010  Schuberg Philis, Frank Breedijk - Under GPLv3
// ----------------------------------------------------------------------------

var workspaceID = 0;
var workspaceName = "";
var scanID = 0;
var scanName = "";
var statusID = 1;
var statusName = "New";
var current=1;
var max=1;
var xmlstore;

var max_finding_length = 150;

// When the DOM is ready start building the screen
// This means the program was started
$(document).ready( function() {
	// This javascript file is indcluded in multiple documents
	switch (document.title) {
		case "Seccubus 2 - Finding":
			addEventHandlers();
			loadFinding($("#finding_title").attr("finding_id"), $("#finding_title").attr("workspace_id"));
		break;
		case "Seccubus 2":
			// Clear all findings filter data
			$(".fFilter").data("fFilterData", "");

			// Present the Finding Status boxes to the new state
			$("#fSetStatus > option").hide();
			$("#fSetStatus_1, #fSetStatus_3, #fSetStatus_4, #fSetStatus_99").show();
			$("#fSetStatus").val(1);

			// Load a new workspace list.
			//updateWorkspacelist();
			// Show the startup screen
			showScreen("start");
		break;
		default:
			alert("Unknown document title:" + document.title);
		break;
	}
});

// This functions shows and hides sections of the screen based on keywords
function showScreen(screen) {
	// Hide various parts of the screen.
	$("#Scans").hide();
	$("#Help").hide();
	$("#Menu").hide();
	$("#Findings").hide();
	$("#FindingsFilter").hide();
	$("#Issues").hide();
	$("#IssuesFilter").hide();
	$("#WorkspaceForm").hide();
	$("#workspace_change").parent().hide();
	$("#workspace_new").parent().hide();
	$("#workspace_edit").parent().hide();
	$("#workspace_delete").parent().hide();
	switch (screen) {
		case "none":
			// Don't show any screens
		break;
		case "start":
			// Update title
			$("#title").text("Select a workspace to start");
			document.title =  "Seccubus v2";
			
			// Reset the global variables
			workspaceID = 0;
			workspaceName = "";
			
			// Show only the new link on the workspace menu
			$("#workspace_new").parent().show();
			
			// Show the workspace list.
			updateWorkspacelist();
		break;
		case "workspace":
			$("#Menu").show();
			$("#Scans").show();
			$("#workspace_change").parent().show();
			$("#workspace_new").parent().show();
			$("#workspace_edit").parent().show();
			$("#workspace_delete").parent().show();
			// Hide elements in the Workspace menu section
			$("a.workspace").each(function() {
				if ($(this).attr('workspaceID') != workspaceID) {
					$(this).parent().hide();
				}
			});
			$("#Workspaces p:last").hide();			
		break;
		case "findings":
			// Update GUI and document title
			$("#title").text("Workspace: " + workspaceName + " - Scan: " + scanName + " - Findings with status: " + statusName);
			document.title =  "Seccubus v2 - " + $("#title").text();
			
			$("#Menu").show();
			$("#Scans").show();
			$("#Findings").show();
			$("#FindingsFilter").show();
			$("#workspace_change").parent().show();
			$("#workspace_new").parent().show();
			$("#workspace_edit").parent().show();
			$("#workspace_delete").parent().show();
		break;
		case "newWorkspace":
			$("#WorkspaceForm").show();
			$("#WorkspaceForm").html("Workspace name: <input type='text' id='wsName' size=15 maxlength=25>\n" +
			"<button id='wsCreateNew' value='New' class='wsNew' accesskey='n' type='button'><u>N</u>ew</button>" + 
			"<button id='wsCancelNew' value='Cancel' class='wsNew' accesskey='c' type='button'><u>C</u>ancel</button>");
			// Create a new workspace when the New button on the 
			// WorkspaceForm div is clicked
			$("#wsCreateNew").click( function() {
				createWorkspace($("#wsName").val());
				$("#wsName").val("");
			});
			// Cancel creation of a new workspace
			$("#wsCancelNew").click( function() {
				// clear input text box
				$("#wsName").val("");
				
				if (workspaceID == 0) {
					// Show the startup screen
					showScreen("start");
				} else {
					// Show the findings screen
					showScreen("findings");
				}
			});
		break;
		case "deleteWorkspace":
			$("#WorkspaceForm").show();
			$("#WorkspaceForm").html("Confirm the deletion of workspace: <input type='text' id='wsName' size=15 maxlength=25>?\n" +
			"<button id='wsConfirmDel' value='Delete' class='wsDel' accesskey='d' type='button'><u>D</u>elete</button>" + 
			"<button id='wsCancelDel' value='Cancel' class='wsDel' accesskey='c' type='button'><u>C</u>ancel</button>" +
			"<br>(Note: All scans, findings and other associated data will be deleted from the database.)");
			// Fill in the current workspace name
			$("#wsName").val(workspaceName);
			// Delete a workspace when the Delete button on the 
			// WorkspaceForm div is clicked
			$("#wsConfirmDel").click( function() {
				deleteWorkspace($("#wsName").val());
				$("#wsName").val("");
			});
			// Cancel deletion of a workspace
			$("#wsCancelDel").click( function() {
				// clear input text box
				$("#wsName").val("");
				
				// Return the findings screen
				showScreen("findings");
			});
		break;
		case "editWorkspace":
			$("#WorkspaceForm").show();
			$("#WorkspaceForm").html("Change the workspace name: <input type='text' id='wsName' size=15 maxlength=25>\n" +
			"<button id='wsConfirmEdit' value='Edit' class='wsEdit' accesskey='e' type='button'><u>E</u>dit</button>" + 
			"<button id='wsCancelEdit' value='Cancel' class='wsEdit' accesskey='c' type='button'><u>C</u>ancel</button>");
			// Fill in the current workspace name
			$("#wsName").val(workspaceName);
			// Edit a workspace when the Edit button on the 
			// WorkspaceForm div is clicked
			$("#wsConfirmEdit").click( function() {
				editWorkspace($("#wsName").val());
			});
			// Cancel creation of a new workspace
			$("#wsCancelEdit").click( function() {
				// clear input text box
				$("#wsName").val("");
				// Return the findings screen
				showScreen("findings");
			});
		break;
	}
	/*
	if ( screen == "none" ) {
		// Don't show any screens
	} else if ( screen == "workspace" ) {
		$("#Menu").show();
		$("#Scans").show();
	}
	*/
}

// This function updates the workspacelist 
// This function is loaded whenever a full workspacelist is needed
function updateWorkspacelist() {
	// Get the workspace list via XML and parse it when ready
	$.post("api/getWorkspaces.pl", function(xml, txtStatus){
		// Clean the workspace list
		$("#Workspaces").html("");

		// Add each workspace element to the workspace list
		$("workspace", xml).each(function() {
			var id = $(this).attr('id');
			var name = $("name", this).text();
			$("#Workspaces").append("<p><a class='workspace' title='Last run: " + $(this).attr('lastrun') + " Findings:" + $(this).attr('findings')  +"' workspaceID='" + id + "'>" + name + "</a></p>");
		});
		// Add a counter
		$("#Workspaces").append("<p>" + $("count", xml).text() + " workspace(s) available.</p>");
		
		// Show the startup screen
		//showScreen("none");

		// Add sorting functions to tables
		$("#FindingsTable").tablesorter({
			headers: {
				1: { sorter: 'ip' },
				3: { sorter: 'number' },
				8: { sorter: false },
			}
		});
		$("#FindingsTable").bind("sortStart", pleaseWait);
		$("#FindingsTable").bind("sortEnd", clearWait);

		// Activate links in the entire document.
		addEventHandlers(document);
	}, "xml");
}

// This function adds event handler functions to various parts of the DOM.
// The parameter "context" can be given to avoid that multiple handler functions
// get added to the same element which will eventually crash the DOM handler
function addEventHandlers(context) {
	// Open a workspace when we click a workspace link
	$("a.workspace",context).click( function() {
		openWorkspace($(this).attr('workspaceID'),$(this).text());
	});
	// Open a scan when we click a scan link
	$("a.scan", context).click( function() {
		selectScan($(this).attr('scanID'),$(this).text());
	});
	// Select the findings with a certain status when we click a 
	// finding_status link (like New, Changed, etc)
	$("a.finding_status", context).click( function() {
		findingStatus($(this).attr('status'),$(this).attr('status_name'));
	});
	// Process the workspace_menu commands
	$("#workspace_new", context).click( function() {
		// Update title
		$("#title").text("Fill out the form to create a new workspace");
		document.title =  "Seccubus v2";
		
		showScreen("newWorkspace");
		
	});
	$("#workspace_change", context).click( function() {
		// Reload to load all workspaces
		window.location.reload();
	});
	$("#workspace_edit", context).click( function() {
		// Update title
		$("#title").text("Edit the current workspace name");
		document.title =  "Seccubus v2";
		
		showScreen("editWorkspace");
	});
	$("#workspace_delete", context).click( function() {
		// Update title
		$("#title").text("Confirm deletion of the current workspace");
		document.title =  "Seccubus v2";
		
		showScreen("deleteWorkspace");
	});
	// More/less links
	$("a.moreless", context).click( function() {
		moreless(this);
	});
	// Aplly filters when we click the apply button, or change a filter 
	// field
	$("#fFilterApply", context).click( function() {
		filterFindings();
	});
	$("select.fFilter", context).change( function() {
		filterFindings();
	});
	$("input.fFilter", context).change( function() {
		filterFindings();
	});
	// If we click a filter icon in the findings table we must set the val 
	// of the relevant filter field and trigger the change event manually
	$("a.applyfFilter", context).click( function() {
		$("#" + $(this).attr("filter")).val($(this).attr("filterval"));
		filterFindings();
	});
	// If we click the clear button we must clear the filter fields
	$("#fFilterClear", context).click( function() {
		clearfFilter();
	});
	// If we hit the all checkbox, set all chackboxes like I was set and 
	// preview the effect on all findings.
	$(".fSelectAll", context).click( function() {
		// Make sure all select all boxes are selected
		$(".fSelectAll").attr("checked", $(this).attr("checked"));
		// Make sure all other boxes are selected as well
		$("input.fSelect").attr("checked", ($(this).attr("checked")));
		// Show the effect this has.
		previewfChanges();
	});
	// Also show the effect when we change the status, type in the remark 
	// field,  toggle the overwrite checkbox or select one or more findings
	$(".fSet, .fSelect", context).change( function() {
		previewfChanges();
	});
	$("#fSetRemark", context).keyup( function() {
		previewfChanges();
	});
	// Reset the fSet fields
	$("#fSetClear", context).click( function() {
		clearfSet();
	});
	// Apply the changes.
	$("#fSetApply", context).click( function() {
		updateFindings();
		$(".fSelectAll").attr("checked", false);
	});
	$("#findingSetApply", context).click( function() {
		updateFinding();
		alert("Updated");
	});
	// Open a finding
	$("a.fOpen", context).click( function() {
		findingPopup(workspaceID, $(this).attr('finding_id'));
		
	});
	// Open multiple findings
	$("#fSetOpenSelected", context).click( function() {
		findingPopups();
	});
	// New change selected
	$("a.newchange", context).click( function() {
		showChange($(this).attr("val"));
	});

}

// This function creates a new workspace
function createWorkspace(Name) {
	// if the named passed is blank, prompt user and keep form open
	if (Name === "") {
		alert("No workspace name entered. Please type in a workspace name.");
		return;
	}
	
	$.post("api/createWorkspace.pl", {workspaceName: Name}, function(xml, txtStatus){
		// Present the results
		result = $("status", xml).text();
		
		if (result === "exists") {	// if result exists, prompt user and keep form open
			alert("The name " + Name + " already exists. Please choose a different name.");
		} else if (~isNaN(result)) { // if result is a number, prompt user and restart 
			alert("The workspace " + Name + " was created successfully.");
			// Show the startup screen
			showScreen("start");
		} else {	// Handle unknown results gracefully
			alert ("An unknown result was returned. Please report the following result to the developers: " + result);
			// Show the startup screen
			showScreen("start");
		}
	}, "xml");
}

// This function deletes a workspace
function deleteWorkspace(Name) {
	// if the named passed is not the current workspace then prompt user and keep form open
	if (Name !== workspaceName) {
		alert("Only the current workspace name is allowed to be deleted");
		return;
	}
	
	$.post("api/deleteWorkspace.pl", {workspaceName: Name}, function(xml, txtStatus){
		// Present the results
		result = $("status", xml).text();
		
		if (result === "fail") {	// if fail prompt user.
			alert("Unable to delete " + Name + " workspace!");
			// Show the startup screen
			showScreen("findings");
		} else if (result === "success") {
			alert("The workspace " + Name + " and associated data has been deleted.");
			showScreen("start");
		} else {	// Handle unknown results gracefully
			alert("An unknown result was returned. Please report the following result to the developers: " + result);
			// Show the startup screen
			showScreen("start");
		}
	}, "xml");	
}

// This function renames a workspace
function editWorkspace(newName) {
	// if the named passed is blank, prompt user and keep form open
	if (newName === "") {
		alert("No workspace name entered. Please type in a workspace name or click the cancel button.");
		return;
	} else if (newName === workspaceName) {	// Verify the name has been changed, if not prompt the user
		alert("The workspace name has not been modified. Please change the the workspace name or click the cancel button.")
		return;
	}
	
	$.post("api/editWorkspace.pl", {workspaceName: workspaceName, newWorkspaceName: newName}, function(xml, txtStatus){
		// Present the results
		result = $("status", xml).text();
		
		if (result === "exists") {	// if result exists, prompt user and keep form open
			alert("The name " + newName + " already exists. Please choose a different name.");
		} else if (result === "notfound") {	// The original workspace name was not found
			alert("The workspace " + workspaceName + " was not found in the database!");
			// Show the startup screen
			showScreen("start");
		}
		else if (~isNaN(result)) { // if result is a number, prompt user and restart 
			alert("The workspace " + workspaceName + " was successfully changed to " + newName);
			// Show the startup screen
			showScreen("start");
		} else {	// Handle unknown results gracefully
			alert ("An unknown result was returned. Please report the following result to the developers: " + result);
			// Show the startup screen
			showScreen("start");
		}
	}, "xml");
}

// This function loads a new workspace in the GUI.
function openWorkspace(ID, Name) {
	// Set the global variables
	workspaceID = ID;
	workspaceName = Name;

	// Update GUI and document title
	$("#title").text("Workspace: " + Name);
	document.title =  "Seccubus v2 - " + $("#title").text();
	
	// Show the appropriate menu's
	showScreen("workspace");
	
	// Load the scans list
	updateScans(workspaceID);

	// Load all findings for the workspace
	selectScan(0, "ALL");
}


// Load all the scans available for a workspace
function updateScans(workspaceID) {
	// Get the scan list via XML and process it.
	$.post("api/getScans.pl", {workspaceID: workspaceID}, function(xml, txtStatus){
		// Clean the scan list
		$("#ScansList").html("<p><a class='scan' title='all' scanID=0>ALL</a></p>");
		// Add each scan to the scan list.
		$("scan", xml).each(function() {
			// Parse the XML and build the workspacelist
			var id = $(this).attr('id');
			var name = $("name", this).text();
			$("#ScansList").append("<p><a class='scan' title='Last run: " + $(this).attr('lastrun') + " Findings : " + $(this).attr('findings') +"' scanID='" + id + "'>" + name + "</a></p>");
		});
		// Add a counter
		$("#ScansList").append($("count", xml).text() + " scan(s) configured.");
		// Add event handlers to the updated element
		addEventHandlers("#ScansList");
	}, "xml");
}

// Select a scan
function selectScan(ID, name) {
	// Update the global variables
	scanID = ID;
	scanName = name;

	// Make sure the findings list and filter dialogue are visible
	showScreen("findings");

	// Load the findings
	loadFindings(workspaceID, scanID);
	
	// Clear the status set fields
	clearfSet();
}

// Select findings with a different status
function findingStatus(ID, name) {
	// Set globals
	statusID = ID;
	statusName = name;
	
	// Update title
	$("#title").text("Workspace: " + workspaceName + " - Scan: " + scanName + " - Findings with status: " + statusName);
	document.title =  "Seccubus v2 - " + $("#title").text();
	
	// Reload the findings table
	loadFindings(workspaceID, scanID);
	
	// Set the statuses that can be selected
	$("#fSetStatus").val(ID);
	$("#fSetStatus > option").hide();
	$("#fSetStatus_99").show();
	if ( ID == 1 ) {
		$("#fSetStatus_1, #fSetStatus_3, #fSetStatus_4").show();
	} else if ( ID == 2 ) {
		$("#fSetStatus_2, #fSetStatus_3, #fSetStatus_4").show();
	} else if ( ID == 3 || ID == 4 ) {
			$("#fSetStatus_3, #fSetStatus_4").show();
	} else if ( ID == 5 || ID == 6 ) {
		$("#fSetStatus_5, #fSetStatus_6").show();
	} else {
		$("#fSetStatus_1").show();
	}
	
	// Clear the status set fields
	clearfSet();
}

// Load findings for a certain workspace and scan. If scan = 0 this will mean 
// all scans in the workspace
function loadFindings(workspaceID, scanID) {
	// This is going to take a while
	pleaseWait();
	
	// Update the findings filters
	loadfFilter(workspaceID, scanID);

	// Clear the findings table
	$("#FindingsTable > tbody").html("");

	// Get the scan list via XML and process it. Pass filter data to the 
	// call
	$.post("api/getFindings.pl", { 	workspaceID: workspaceID,
					scanID: scanID,
					host: $("#fFilterHost").data("fFilterData"),
					hostname: $("#fFilterHostname").data("fFilterData"),
					port: $("#fFilterPort").data("fFilterData"),
					plugin: $("#fFilterPlugin").data("fFilterData"),
					severity: $("#fFilterSeverity").data("fFilterData"),
					finding: $("#fFilterFinding").val(),
					remark: $("#fFilterRemark").val(),
				}, function(xml, txtStatus){
		// Start with a clean HTML variable
		var html = "";

		// Process each finding
		$("finding", xml).each(function() {
			// We are only interested in findings of the correct 
			// status
			if ( $("status", this).attr("id") == statusID ) {
				// Parse the XML and build the table

				// We will be using the ID and the severity a 
				// lot. This wil make the code look cleaner
				var id = $(this).attr("id");
				var s = $("severity", this).attr("id");

				// Start the row
				html += "<tr class='s" + s + "'>";
				
				// First field, the ID
				html += "<td class='s" + s + "' align='right'><img class='fChanged' id='fChanged_" + id + "' src='img/changed.gif' alt='changed'><a class='fOpen' finding_id='" + id + "'>" + id + "</a></td>";

				// Host (ip)
				html += "<td class='s" + s + "'>" + $(this).attr("host");
				if ( $("#fFilterHost").val() == "all" ) {
					html += "<a class='applyfFilter' filter='fFilterHost' filterval='" + $(this).attr("host") + "' title='Filter on this value'><img src=img/filter.gif alt='filter'></a>";
				}
				html += "</td>";

				// Hostname
				html += "<td class='s" + s + "'>" + $(this).attr("hostname");
				if ( $("#fFilterHostname").val() == "all" ) {
					html += "<a class='applyfFilter' filter='fFilterHostname' filterval='" + $(this).attr("hostname") + "' title='Filter on this value'><img src=img/filter.gif alt='filter'></a>";
				}
				html += "</td>";

				// Port
				html += "<td class='s" + s + "'>" + $(this).attr("port");
				if ( $("#fFilterPort").val() == "all" ) {
					html += "<a class='applyfFilter' filter='fFilterPort' filterval='" + $(this).attr("port") + "' title='Filter on this value'><img src=img/filter.gif alt='filter'></a>";
				}
				html += "</td>";

				// Plugin
				html += "<td class='s" + s + "'>" + $(this).attr("plugin");
				if ( $("#fFilterPlugin").val() == "all" ) {
					html += "<a class='applyfFilter' filter='fFilterPlugin' filterval='" + $(this).attr("plugin") + "' title='Filter on this value'><img src=img/filter.gif alt='filter'></a>";
				}
				html += "</td>";

				// Severity
				html += "<td class='s" + s + "'>" + s + ". " + $("severity", this).text();
				if ( $("#fFilterSeverity").val() == "all" ) {
					html += "<a class='applyfFilter' filter='fFilterSeverity' filterval='" + $("severity", this).attr("id") + "' title='Filter on this value'><img src=img/filter.gif alt='filter'></a>";
				}
				html += "</td>";

				// The finding text
				var finding = htmlEncode($("output", this).text()).replace(/\\n\\n/g,"<p>").replace(/\\n/g, "<br>");
				html += "<td class='s" + s + "'>";
				if ( $("output", this).text().length > max_finding_length ) {
					// If the finding is large we need to 
					// add a long and short version and a 
					// more/less link
					var sfinding = htmlEncode($("output", this).text().slice(0,100)).replace(/\\n/g,"<br>") + "...";
					html += "<span id='f" + id + "more' style='display: none;'>" + finding + "</span>";
					html += "<span id='f" + id + "less'>" + sfinding + "</span>";
					html += "<div align='right'><a class='moreless' id='f" + id + "'>more</a></div>";
				} else {
					html += finding;
				}
				html += "</td>";

				// Remark
				var remark = htmlEncode($(this).attr("remark")).replace(/\\n/g,"<br>");
				html += "<td id='fRemark_" + id + "' remark='" + remark + "' class='s" + s + "'>" + remark + "</td>";
				html += "<td class='s" + s + "'><input type='checkbox' class='fSelect' id='" + id + "'></td>";

				// Close the table row
				html += "</tr>";
			}
		});
		// Update counters
		$("#fcount").html($("count", xml).text());
		$("#fcount_1").html(0);
		$("#fcount_2").html(0);
		$("#fcount_3").html(0);
		$("#fcount_4").html(0);
		$("#fcount_5").html(0);
		$("#fcount_6").html(0);
		$("#fcount_99").html(0);
		$("#fcount_1").html($("count",xml).attr("status_1"));
		$("#fcount_2").html($("count",xml).attr("status_2"));
		$("#fcount_3").html($("count",xml).attr("status_3"));
		$("#fcount_4").html($("count",xml).attr("status_4"));
		$("#fcount_5").html($("count",xml).attr("status_5"));
		$("#fcount_6").html($("count",xml).attr("status_6"));
		$("#fcount_99").html($("count",xml).attr("status_99"));
		// Debug filters
		// $("#fFilterRaw").html($("filter", xml).text());

		// Update the table and make sure tableSorter plugin knows
		$("#FindingsTable tbody").append(html);
		$("#FindingsTable").trigger("update");

		// Hide all changed indicatiors
		$(".fChanged").hide();

		// Add event handlers to the change text
		addEventHandlers("#FindingsTable > tbody");
		
		// Done
		clearWait();
	}, "xml");
}

function loadfFilter(workspaceID, scanID) {
	// Get the filter values via XML
	// Clean the filter fields first
	$("#fFilterHost").html("");
	$("#fFilterHostname").html("");
	$("#fFilterPort").html("");
	$("#fFilterPlugin").html("");
	$("#fFilterSeverity").html("");

	// Request an XML with all items that can be filtered on for the current
	// filter criteria
	$.post("api/getfFilter.pl", {
					workspaceID: workspaceID, 
					scanID: scanID,
					host: $("#fFilterHost").data("fFilterData"),
					hostname: $("#fFilterHostname").data("fFilterData"),
					port: $("#fFilterPort").data("fFilterData"),
					plugin: $("#fFilterPlugin").data("fFilterData"),
					severity: $("#fFilterSeverity").data("fFilterData"),
					finding: $("#fFilterFinding").val(),
					remark: $("#fFilterRemark").val(),
				}, function(xml, txtStatus){

		// We want to store the HTML into two variables so we can show
		// items for whcih we do not have findings in the current status
		// at the bottom of the list.
		var active = "";
		var inactive = "";

		// Hosts
		$("host", xml).each(function() {
			var host = $(this).text();
			var count = $(this).attr("count_" + statusID);
			if ( host == "all" ) {
				active = "<option id='fFilterHost" + host + "' value='" + host + "'>" + host + " - " + count + " finding(s)\n" + active;
			} else {
				if ( count > 0 ) {
					active += "<option id='fFilterHost" + host + "' value='" + host + "'>" + host + " - " + count + " finding(s)\n";
				} else {
					inactive += "<option id='fFilterHost" + host + "' value='" + host + "'>" + host + " - no findings\n";
				} 
			}
		});
		$("#fFilterHost").html(active + inactive);

		// Hostname
		var active = "";
		var inactive = "";
		$("hostname", xml).each(function() {
			var hostname = $(this).text();
			var count = $(this).attr("count_" + statusID);
			if ( hostname == "all" ) {
				active = "<option id='fFilterHost" + hostname + "' value='" + hostname + "'>" + hostname + " - " + count + " finding(s)\n" + active;
			} else {
				if ( count > 0 ) {
					active += "<option id='fFilterHost" + hostname + "' value='" + hostname + "'>" + hostname + " - " + count + " finding(s)\n";
				} else {
					inactive += "<option id='fFilterHost" + hostname + "' value='" + hostname + "'>" + hostname + " - no findings\n";
				} 
			}
		});
		$("#fFilterHostname").html(active + inactive);

		// Port
		var active = "";
		var inactive = "";
		$("port", xml).each(function() {
			var port = $(this).text();
			var count = $(this).attr("count_" + statusID);
			if ( port == "all" ) {
				active = "<option id='fFilterHost" + port + "' value='" + port + "'>" + port + " - " + count + " finding(s)\n" + active;
			} else {
				if ( count > 0 ) {
					active += "<option id='fFilterHost" + port + "' value='" + port + "'>" + port + " - " + count + " finding(s)\n";
				} else {
					inactive += "<option id='fFilterHost" + port + "' value='" + port + "'>" + port + " - no findings\n";
				} 
			}
		});
		$("#fFilterPort").html(active + inactive);

		// Plugin
		var active = "";
		var inactive = "";
		$("plugin", xml).each(function() {
			var plugin = $(this).text();
			var count = $(this).attr("count_" + statusID);
			if ( plugin == "all" ) {
				active = "<option id='fFilterHost" + plugin + "' value='" + plugin + "'>" + plugin + " - " + count + " finding(s)\n" + active;
			} else {
				if ( count > 0 ) {
					active += "<option id='fFilterHost" + plugin + "' value='" + plugin + "'>" + plugin + " - " + count + " finding(s)\n";
				} else {
					inactive += "<option id='fFilterHost" + plugin + "' value='" + plugin + "'>" + plugin + " - no findings\n";
				} 
			}
		});
		$("#fFilterPlugin").html(active + inactive);

		// Severity
		var active = "";
		var inactive = "";
		$("severity", xml).each(function() {
			var severity = $(this).text();
			var count = $(this).attr("count_" + statusID);
			if ( severity == "all" ) {
				active = "<option id='fFilterHost" + severity + "' value='" + $(this).attr("id") + "'>" + severity + " - " + count + " finding(s)\n" + active;
			} else {
				if ( count > 0 ) {
					active += "<option id='fFilterHost" + severity + "' value='" + $(this).attr("id") + "'>" + severity + " - " + count + " finding(s)\n";
				} else {
					inactive += "<option id='fFilterHost" + severity + "' value='" + $(this).attr("id") + "'>" + severity + " - no findings\n";
				} 
			}
		});
		$("#fFilterSeverity").html(active + inactive);

		// Restore active filter settings
		$(".fFilter").each(function() {
			$(this).val($(this).data("fFilterData"));
		});
	}, "xml");
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
	if ( $(context).text() == "more" ) {
		$(context).text("less");
		$("#" + id + "more").show();
		$("#" + id + "less").hide();
	} else {
		$(context).text("more");
		$("#" + id + "less").show();
		$("#" + id + "more").hide();
	}
}

// Show please wait overlay
function pleaseWait() {
	$("#overlay").text("Please wait...");
	$("#overlay").show();
}

// Hide please wait overlay
function clearWait() {
	$("#overlay").text("Ready...");
	$("#overlay").hide();
}

// Apply a findings filter
function filterFindings() {
	$(".fFilter").each(function() {
		$(this).data("fFilterData", $(this).val());
	});
	loadFindings(workspaceID, scanID);
}

// Clear the findings filter
function clearfFilter() {
	$("#fFilterHost").val("all");
	$("#fFilterHostname").val("all");
	$("#fFilterPort").val("all");
	$("#fFilterPlugin").val("all");
	$("#fFilterSeverity").val("all");
	$("#fFilterFinding").val("");
	$("#fFilterRemark").val("");
	filterFindings();
}


function previewfChanges() {
	// If we have a change
	if ( $("#fSetStatus").val() != statusID || $("#fSetRemark").val() != "" ) {
		// Set the changed indicator for all checked findings, clear 
		// the others
		$(".fSelect").each( function() {
			if ( $(this).attr("checked") ) {
				$("#fChanged_" + $(this).attr("id")).show();
			} else {
				$("#fChanged_" + $(this).attr("id")).hide();
			}
		});
	} else {
		// Clear all change indicators
		$(".fChanged").hide();
	}
	// If the remark did not change, make sure all remark fields show the 
	// original remarks
	if ( $("#fSetRemark").val() == "" ) {
		$(".fSelect").each( function() {
			$("#fRemark_" + $(this).attr("id")).html($("#fRemark_" + $(this).attr("id")).attr("remark"));
		});
	} else {
		// Unchecked remark fields show the original remark
		$(".fSelect:not(:checked)").each( function() {
			$("#fRemark_" + $(this).attr("id")).html($("#fRemark_" + $(this).attr("id")).attr("remark"));
		});
		// HTML encode the content of the remark field
		var html = htmlEncode($("#fSetRemark").val());
		// If overwrite is on
		if ( $("#fSetOverwrite").attr("checked") ) {
			// Overwrite the remark for all check findings
			$(".fSelect:checked").each( function() {
				$("#fRemark_" + $(this).attr("id")).html(html);
			});
		} else {
			// Append html to the original remark
			$(".fSelect:checked").each( function() {
				$("#fRemark_" + $(this).attr("id")).html($("#fRemark_" + $(this).attr("id")).attr("remark") + "<br>" + html);
			});
		}
	}
}

// Clear the finding set fields and preview the changes.
function clearfSet() {
	$(".fSelectAll").attr("checked", false);
	$("#fSetOverwrite").attr("checked", false);
	$("#fSetStatus").val(statusID);
	$("#fSetRemark").val("");
	previewfChanges();
}

function updateFindings() {
	pleaseWait();
	var IDs = new Array;
	$(".fSelect:checked").each( function() {
		IDs.push($(this).attr("id"));
	});
	$.post("api/updateFindings.pl", { 	"workspaceid"	: workspaceID,
						"ids"		: IDs,
						"status"	: $("#fSetStatus").val(),
						"remark"	: $("#fSetRemark").val(),
						"overwrite"	: $("#fSetOverwrite").attr("checked"),
					 }, function(xml, txtStatus){
		$("finding", xml).each(function() {
			$("#fChanged_" + $(this).attr("id")).hide();
		});
	
		// Clear the selectAll
		$("#fSelectAll").attr("checked", false);

		// Reload the findings table
		loadFindings(workspaceID, scanID);
		pleaseWait();
	}, "xml");
	clearWait();
}

function loadFinding(findingID, workspaceID) {
	//$("#finding_title").text("This is finding <bla>" + id);
	$.post("api/getFinding.pl", { workspaceID: workspaceID, findingID: findingID}, function(xml, txtStatus){
		// Save the XML message
		xmlstore = xml;
		
		// This is the number of the current finding
		max = $("changes", xml).attr("max");

		// Update the current status and remark
		$("#findingSetRemark").val(
			base64_decode($("change[count='" + max + "'] > remark", xml).attr("base64"))
		);

		// Set the current status and disable those that cannot be 
		// selected
		ID = $("change[count='" + max + "'] > status", xml).attr("id");
		$("#findingSetStatus").val(ID);
		
		$("#findingSetStatus > option").hide();
		$("#findingSetStatus_99").show();
		if ( ID == 1 ) {
			$("#findingSetStatus_1, #findingSetStatus_3, #findingSetStatus_4").show();
		} else if ( ID == 2 ) {
			$("#findingSetStatus_2, #findingSetStatus_3, #findingSetStatus_4").show();
		} else if ( ID == 3 || ID == 4 ) {
				$("#findingSetStatus_3, #findingSetStatus_4").show();
		} else if ( ID == 5 || ID == 6 ) {
			$("#findingSetStatus_5, #findingSetStatus_6").show();
		} else {
			$("#findingSetStatus_1").show();
		}
		
		// Add event handlers and load latest change
		showChange(max);
	});
}

// Show the actual change
function showChange(changenum) {
	changenum=parseInt(changenum);
	// Clean the changes screen list
	$("#changes").html("");
	html = "";

	html += "<table><tr><td></td><td><center>Current</center>";
	if (changenum < max ) {
		html += "<a class='newchange' val='" + max + "'>Newest</a>&nbsp&nbsp&nbsp";
		html += "<a class='newchange' val='" + (1+changenum) + "'>Newer</a>";
	} else {
		html += "&nbsp;";
	}
	html += "</td><td align='right'><center>Older</center>";
	if (changenum > 1 ) {
		html += "<a class='newchange' val='" + (changenum-1) + "'>Older</a>&nbsp&nbsp&nbsp";
		html += "<a class='newchange' val='1'>Oldest</a>&nbsp;";
	} else {
		html += "<br>&nbsp;";
	}
	html += "</td></tr>";

	html+= "<tr><td>Host:</td><td colspan=3 id='host'></td></tr>";
	html+= "<tr><td>Port:</td><td colspan=3 id='port'></td></tr>";
	html+= "<tr><td>Plugin:</td><td colspan=3 id='plugin'></td></tr>";
	html+= "<tr><td>Time:</td><td id='scantime'></td><td id='prev_scantime'></td></tr>";
	html+= "<tr><td>Finding:</td><td id='finding'></td><td id='prev_finding'></td></tr>";
	html+= "<tr><td>Remark:</td><td id='remark'></td><td id='prev_remark'></td></tr>";
	html+= "<tr><td>Severity:</td><td id='severity'></td><td id='prev_severity'></td></td></tr>";
	html+= "<tr><td>Status:</td><td id='status'></td><td id='prev_status'></td></tr>";
	html+= "<tr><td>Changed by:</td><td id='user'></td><td id='prev_user'></td></tr>";
	html+= "<tr><td>Changed on:</td><td id='changetime'></td><td id='prev_changetime'></td></tr>";

	html += "</table>";
	$("#changes").html(html);

	// Display values
	$("change", xmlstore).each(function() {
		if ( $(this).attr("count") == changenum ) {
			if ( $("host", this).attr("name") ) {
				$("#host").text($("host", this).text() + " ( " + $("host", this).attr("name") + " ) ");
			} else {
				$("#host").text($("host", this).text());
			}
			$("#port").text($("port", this).text());
			$("#plugin").text($("plugin", this).text());
			var finding = htmlEncode($("finding", this).text()).replace(/\\n\\n/g,"<p>").replace(/\\n/g, "<br>");
			$("#finding").html(finding);
			var remark = htmlEncode($("remark", this).text()).replace(/\\n\\n/g,"<p>").replace(/\\n/g, "<br>");
			$("#remark").html(remark);
			$("#findingSetRemark").val(remark);
			$("#severity").text($("severity", this).text());
			$("#status").text($("status", this).text());
			$("#user").text($("user", this).text());
			$("#changetime").text($("changetime", this).text());
			$("#scantime").text($("scantime", this).text());
		};
		if ( changenum > 1 && parseInt($(this).attr("count"))+1 == changenum ) {
			var finding = htmlEncode($("finding", this).text()).replace(/\\n\\n/g,"<p>").replace(/\\n/g, "<br>");
			$("#prev_finding").html(finding);
			var remark = htmlEncode($("remark", this).text()).replace(/\\n\\n/g,"<p>").replace(/\\n/g, "<br>");
			$("#prev_remark").html(remark);
			$("#prev_severity").text($("severity", this).text());
			$("#prev_status").text($("status", this).text());
			$("#prev_user").text($("user", this).text());
			$("#prev_changetime").text($("changetime", this).text());
			$("#prev_scantime").text($("scantime", this).text());
		}
	});


	if ( changenum > 1 ) {
		// Highlight any changes between the current and previous 
		// finding. This does not make sense for the first finding
		if ( $("#finding").html() != $("#prev_finding").html() ) {
			$("#finding").addClass("changed");
		}
		if ( $("#remark").html() != $("#prev_remark").html() ) {
			$("#remark").addClass("changed");
		}
		if ( $("#severity").html() != $("#prev_severity").html() ) {
			$("#severity").addClass("changed");
		}
		if ( $("#status").html() != $("#prev_status").html() ) {
			$("#status").addClass("changed");
		}
		if ( $("#user").html() != $("#prev_user").html() ) {
			$("#user").addClass("changed");
		}
	}
	
	addEventHandlers("#changes");
}


// Open a popup displaying a finding
function findingPopup(workspaceID, findingID) {
	win = window.open("finding.pl?finding_id=" + findingID + "&workspace_id=" + workspaceID, "_blank");
}

function findingPopups() {
	pleaseWait();
	$(".fSelect:checked").each( function() {
		findingPopup(workspaceID, $(this).attr("id"));
	});
	clearWait();
}

function updateFinding() {
	ID = $("#finding_title").attr("finding_id");
	workspaceID = $("#finding_title").attr("workspace_id")
	$.post("api/updateFindings.pl", { 	"workspaceid"	: workspaceID,
						"ids"		: ID,
						"status"	: $("#findingSetStatus").val(),
						"remark"	: $("#findingSetRemark").val(),
						"overwrite"	: true,
					}, function(xml, txtStatus){
		loadFinding($("#finding_title").attr("finding_id"), $("#finding_title").attr("workspace_id"));
	});
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
