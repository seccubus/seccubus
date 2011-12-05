steal(
	'./seccubus.css', 			// application CSS file
	'./seccubus_tables.css',		// Table CSS file
	'./models/models.js',			// steals all your models
	//'./fixtures/fixtures.js',		// sets up fixtures for your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	'seccubus/workspace/selector',
	'seccubus/workspace/table',
	//'seccubus/workspace/create',
	function(){					// configure your application
		$('#navTab').seccubus_tabs();
		// Disable the Scans tab on start
		//$('#navTab').seccubus_tabs("disable", 3);
		// Hide Issues and Reports tab for now
		//$('#navTab').seccubus_tabs("hide", 2);
		$('#navTab').seccubus_tabs("hide", 5);

		// UpToDate status
		$('#up_to_dates').seccubus_up_to_date_list();

		// ConfigItem status
		$('#config_items').seccubus_config_item_list();

		// Workspaces
		$('#workspace_selector_scans').seccubus_workspace_selector();
		$('#workspace_selector_findings').seccubus_workspace_selector();
		$('#workspace_selector_issues').seccubus_workspace_selector();

		// Apparently this needs to be called last
		$('#workspace_table').seccubus_workspace_table();
		//$('#create').seccubus_workspace_create();
}
)
