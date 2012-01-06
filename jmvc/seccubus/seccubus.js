steal(
	'./seccubus.css', 			// application CSS file
	'./fixtures/fixtures.js',		// sets up fixtures for your models
	'./models/models.js',			// steals all your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	'seccubus/workspace/select',
	'seccubus/scan/select',
	'seccubus/finding/table',
	'seccubus/finding/status',
	'seccubus/finding/filter',
	'seccubus/finding/bulkedit',
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
			render_status();
			render_findings();
			render_bulkedit();
		});
		gui_state.bind("scans", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("findStatus", function(ev, scan){
			render_findings();
			render_bulkedit();
		});
		gui_state.bind("host", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("hostName", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("port", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("plugin", function(ev, scan){
			render_status();
			render_findings();
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

		// Setup status table
		render_status();

		// Setup filters
		render_filters();

		// Setup Bulk edit
		render_bulkedit();

		/**********************************************************
		 * Functions
		 *********************************************************/
		function render_findings() {
			render_finding_table();
			render_filters();
		}

		function render_scan_selectors() {
			$('select.scanSelector').each( function() {
				$(this).seccubus_scan_select({
					workspace : gui_state.workspace
				});
			});
		};

		function render_finding_table() {
			$('#finding_table').seccubus_finding_table({
				workspace	: gui_state.workspace,
				scans		: gui_state.scans,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
			});
		};

		function render_status() {
			$('#status_buttons').seccubus_finding_status({
				workspace	: gui_state.workspace,
				scans		: gui_state.scans,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
				onClick		: function(s){
					gui_state.attr("findStatus",s);
				},
				updateOnClick : false,
			});
		};
		function render_filters() {
			$('#filters').seccubus_finding_filter({
				workspace 	: gui_state.workspace,
				scans		: gui_state.scans,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
				onChange	: function(f) {
					for(var a in f) {
						gui_state.attr(a,f[a]);
					}
				},
				updateOnChange	: false,
			});
		};
		function render_bulkedit() {
			$('#finding_bulkedit').seccubus_finding_bulkedit({
				workspace	: gui_state.workspace,
				status		: gui_state.findStatus,
			});
		};
	}
)
