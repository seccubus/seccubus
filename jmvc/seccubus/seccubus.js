steal(
	'./seccubus.css', 			// application CSS file
	'./seccubus_tables.css',		// Table CSS file
	'./models/models.js',			// steals all your models
	'./fixtures/fixtures.js',		// sets up fixtures for your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	'seccubus/workspace/select',
	'seccubus/scan/select',
	'seccubus/finding/table',
	//'seccubus/workspace/table',
	function(){					// configure your application
		/***********************************************************
		 * Initialize gui state and hook into it
		 **********************************************************/

		var gui_state=new Seccubus.GuiState({
			workspace	: -1
		});
		gui_state.bind("workspace", function(ev, ws){
			render_scan_selectors();
			render_finding_table();
		});
		gui_state.bind("scans", function(ev, scan){
			render_finding_table();
		});

		/***********************************************************
		 * Setup the screen
		 **********************************************************/

		// Tabs
		$('#navTab').seccubus_tabs();
		// Disable the Scans tab on start
		$('#navTab').seccubus_tabs("disable", 3);
		// Hide Issues and Reports tab for now
		//$('#navTab').seccubus_tabs("hide", 2);
		$('#navTab').seccubus_tabs("hide", 3);
		$('#navTab').seccubus_tabs("hide", 4);
		$('#navTab').seccubus_tabs("hide", 5);

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
				// Update the gui state
				gui_state.attr("workspace",newWorkspace);
				// Set all other selectors
				$('.workspaceSelector').attr("value",newWorkspace);

			});
		});

		// Setup all scan selectors
		render_scan_selectors();
		$('.scanSelector').each( function() {
			$(this).change(function() {
				var val = $(this).val();
				gui_state.attr("scans",val);
				$('.scanSelector').val(val);
			});
		});

		// Setup finding table
		render_finding_table();

		/**********************************************************
		 * Functions
		 *********************************************************/

		function render_scan_selectors() {
			$('select.scanSelector').each( function() {
				$(this).seccubus_scan_select({
					workspace : gui_state.workspace
				});
			});
		};

		function render_finding_table() {
			$('#finding_table').seccubus_finding_table({
					workspace : gui_state.workspace,
					scans     : gui_state.scans,
			});
		};
	}
)
