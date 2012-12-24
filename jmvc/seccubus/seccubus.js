steal(
	'./seccubus.css', 			// application CSS file
	//'./fixtures/fixtures.js',		// sets up fixtures for your models
	'./models/models.js',			// steals all your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	'seccubus/workspace/select',
	'seccubus/workspace/create',
	'seccubus/workspace/table',
	'seccubus/workspace/edit',
	'seccubus/scan/select',
	'seccubus/scan/create',
	'seccubus/scan/table',
	'seccubus/scan/edit',
	'seccubus/run/table',
	'seccubus/finding/table',
	'seccubus/finding/status',
	'seccubus/finding/filter',
	'seccubus/finding/bulkedit',
	'seccubus/finding/edit',
	'seccubus/history/table',
	'widgets/modal',
	'seccubus/event/create',
	'seccubus/event/list',
	'seccubus/notification/create',
	'seccubus/notification/list',
	function(){					// configure your application
		/***********************************************************
		 * Initialize gui state and hook into it
		 **********************************************************/

		var gui_state=new Seccubus.GuiState({
			workspace	: -1
		});
		gui_state.bind("workspace", function(ev, ws){
			render_scan_selectors();
			render_scan_table();
			render_scan_lists();
			render_status();
			render_findings();
			render_runs();
			render_create_scan();
			render_bulkedit();
		});
		gui_state.bind("scans", function(ev, scan){
			render_status();
			render_findings();
			render_runs();
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
		gui_state.bind("severity", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("finding", function(ev, scan){
			render_status();
			render_findings();
		});
		gui_state.bind("remark", function(ev, scan){
			render_status();
			render_findings();
		});

		/***********************************************************
		 * Setup the screen
		 **********************************************************/

		// Tabs
		$('#navTab').seccubus_tabs();
		// Up2Date - tab 0
		// Runs - tab 1
		// Findigns - tab 2
		// Issues - tab 3
		$('#navTab').seccubus_tabs("hide", 3);
		// Manage Workspaces - tab 4
		// Manage Scans - tab 5
		// Reports - tab 6
		$('#navTab').seccubus_tabs("hide", 6);

		// Initialize add buttons

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
		$('#workspace_table').seccubus_workspace_table({
			onEdit : function(ws) {
				$('#editWorkspace').seccubus_workspace_edit({
					workspace : ws,
					onClear	: function() {
						$("#widgetsModalMask").click();
					}
				});
				$('#modalDialog').widgets_modal({
					query : "#editWorkspaceDialog",
					close : true
				});
			}
		});

		// Scans
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

		// Setup scan list
		render_scan_lists();

		// Setup create workspace
		$('#createWorkspace').seccubus_workspace_create({
			onClear	: function() {
				$("#widgetsModalMask").click();
			}
		});
		$('.addWorkspace').click(function() {
			$('#modalDialog').widgets_modal({
				query : "#createWorkspaceDialog",
				close : true
			});
		});

		// Setup create scan
		$('.addScan').click(function() {
			if ( gui_state.workspace == -1 ) {
				alert("Pelase select a workspace first");
			} else {
				$('#modalDialog').widgets_modal({
					query: "#createScanDialog",
					close : true
				});
			}
		});

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

		function render_scan_table() {
			$('#scan_table').each( function() {
				$(this).seccubus_scan_table({
					workspace : gui_state.workspace,
					onEdit : function(sc) {
						$('#editScan').seccubus_scan_edit({
							scan : sc,
							onClear	: function() {
								$("#widgetsModalMask").click();
							}
						});
						$('#modalDialog').widgets_modal({
							query : "#editScanDialog",
							close : true
						});
					}
				});
			});
		};

		function render_scan_lists() {
			$('.scanList').each( function() {
				$(this).seccubus_scan_list({
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
				severity	: gui_state.severity,
				finding		: gui_state.finding,
				remark		: gui_state.remark,
				onEdit		: function(find) {
					var findings = $(".finding").models();
					var n = 0;
					while(n < findings.length && findings[n].id != find.id) {
						n++;
					}
					if(n < findings.length) {
						$('#editFinding').seccubus_finding_edit({
							findings : findings,
							index	 : n,
							workspace: gui_state.workspace,
							history	 : '#findingHistory'
						});
						$('#modalDialog').widgets_modal({
							query : "#editFindingDialog",
							close : true
						});
					}
				}
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
				severity	: gui_state.severity,
				finding		: gui_state.finding,
				remark		: gui_state.remark,
				onClick		: function(s){
					gui_state.attr("findStatus",s);
				},
				updateOnClick : false
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
				severity	: gui_state.severity,
				finding		: gui_state.finding,
				remark		: gui_state.remark,
				onChange	: function(f) {
					for(var a in f) {
						gui_state.attr(a,f[a]);
					}
				},
				updateOnChange	: false
			});
		};
		function render_runs() {
			var scan = $('#scan_selector_runs').val();
			if ( scan == null ) {
				scan = -1;
			}
			$('#run_table').seccubus_run_table({
				workspace	: gui_state.workspace,
				scan		: scan,
				download	: true,
				onDownload	: function(wId,sId,rId,aId) {
					var url = "json/getAttachment.pl?workspaceId=" + wId.toString() + "&scanId=" + sId.toString() + "&runId=" + rId.toString() + "&attachmentId=" + aId.toString();
					window.open(url);
				}
			});
		};

		function render_bulkedit() {
			$('#finding_bulkedit').seccubus_finding_bulkedit({
				workspace	: gui_state.workspace,
				status		: gui_state.findStatus
			});
		};

		function render_create_scan() {
			$('#createScan').seccubus_scan_create({
				workspace	: gui_state.workspace,
				onClear		: function() {
					$("#widgetsModalMask").click();
				}
			});
		};
		$('#events').seccubus_event_list();
		$('#create').seccubus_event_create();
	$('#notifications').seccubus_notification_list();
		$('#create').seccubus_notification_create();
}
)
