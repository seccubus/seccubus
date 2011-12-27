steal(
	'./seccubus.css', 			// application CSS file
	'./seccubus_tables.css',		// Table CSS file
	'./models/models.js',			// steals all your models
	'./fixtures/fixtures.js',		// sets up fixtures for your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	'seccubus/workspace/select',
	'seccubus/workspace/table',
	'seccubus/scan/select',
	function(){					// configure your application
		/***********************************************************
		 * Initialize gui state and hook into it
		 **********************************************************/

		var gui_state=new Seccubus.GuiState({
			workspace	: -1
		});
		gui_state.bind("workspace", function(ev, ws){
			$('select.scanSelector').each( function() {
				$(this).seccubus_scan_select({workspace : ws});
			});
		});

		/***********************************************************
		 * Setup the screen
		 **********************************************************/

		$('#navTab').seccubus_tabs();
		// Disable the Scans tab on start
		$('#navTab').seccubus_tabs("disable", 3);
		// Hide Issues and Reports tab for now
		//$('#navTab').seccubus_tabs("hide", 2);
		//$('#navTab').seccubus_tabs("hide", 3);
		//$('#navTab').seccubus_tabs("hide", 4);
		//$('#navTab').seccubus_tabs("hide", 5);

		// UpToDate status
		$('#up_to_dates').seccubus_up_to_date_list();

		// ConfigItem status
		$('#config_items').seccubus_config_item_list();

		// Workspaces
		$('.workspaceSelector').each( function() {
			$(this).seccubus_workspace_select();
			// Trap change events
			$(this).change(function() {
				newWorkspace = $(this).attr("value");
				gui_state.attr("workspace",newWorkspace);
				$('.workspaceSelector').attr("value",newWorkspace);

			});
		});
		//$('#workspace_selector_scans').seccubus_workspace_select();
		//$('#workspace_selector_findings').seccubus_workspace_select();
		//$('#workspace_selector_issues').seccubus_workspace_select();

		// Apparently this needs to be called last
		//$('#workspace_table').seccubus_workspace_table();
		//$('#create').seccubus_workspace_create();
		
		// Setup all scan selectors
		$('.scanSelector').each( function() {
			$(this).seccubus_scan_select();
		});
}
)
