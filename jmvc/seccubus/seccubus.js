/*
 * Copyright 2017 Frank Breedijk, Petr
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
	'seccubus/filter/filter',
	'seccubus/finding/table',
	'seccubus/finding/bulkedit',
	'seccubus/finding/edit',
	'seccubus/history/table',
	'seccubus/issue/table',
	'seccubus/issue/create',
	'seccubus/issue/edit',
	'seccubus/issuelink/create',
	'widgets/modal',
	'seccubus/event/select',
	'seccubus/notification/table',
	'seccubus/notification/create',
	'seccubus/notification/edit',
	'seccubus/status/status',
	'seccubus/asset/table',
	'seccubus/asset/edit',
	'seccubus/asset/create',
	'seccubus/asset/host/create',
	'seccubus/asset/host/edit',
	'seccubus/asset/select',
	'seccubus/custsql/table',
	'seccubus/custsql/create',
	function(){					// configure your application
		/***********************************************************
		 * Initialize gui state and hook into it
		 **********************************************************/
		
		var gui_state=new Seccubus.GuiState({
			workspace	: -1
		});
		gui_state.bind("workspace", function(ev, ws){
			console.log("workspace changed");
			render_scan_selectors();
			render_asset_selectors();
			render_scan_table();
			render_scan_lists();
			render_asset_table();
			render_findings();
			render_runs();
			render_create_scan();
			render_create_asset();
			render_bulkedit();
			render_issues();
		});
		gui_state.bind("scans", function(ev, scan){
			console.log("scan changed");
			render_findings();
			render_runs();
		});
		gui_state.bind("assets", function(ev, asset){
			console.log("Assets changed");
			render_findings();
		});
		gui_state.bind("findStatus", function(ev, scan){
			console.log("Status changed");
			render_findings();
			render_bulkedit();
		});
		gui_state.bind("host", function(ev, scan){
			console.log("host changed");
			render_findings();
		});
		gui_state.bind("hostName", function(ev, scan){
			console.log("hostname changed");
			render_findings();
		});
		gui_state.bind("port", function(ev, scan){
			console.log("port changed");
			render_findings();
		});
		gui_state.bind("plugin", function(ev, scan){
			console.log("port changed")
			render_findings();
		});
		gui_state.bind("severity", function(ev, scan){
			console.log("severity changed")
			render_findings();
		});
		gui_state.bind("issue", function(ev,issue) {
			console.log("issue changed to "+issue);
			render_findings();
		})
		gui_state.bind("finding", function(ev, scan){
			console.log("finding changed")
			render_findings();
		});
		gui_state.bind("remark", function(ev, scan){
			console.log("remark changed")
			render_findings();
		});
		gui_state.bind("limit", function(ev, scan){
			console.log("limit changed")
			render_findings();
		});

		/***********************************************************
		 * Hook into findings model to update findings view that
		 * are not rendered from findings model
		 **********************************************************/
		Seccubus.Models.Finding.bind(
			"updated",
			function(ev,model) {
				if ( ! model.bulk ) {
					render_status();
					render_filters();			
				}
			}
		);

		/***********************************************************
		 * Setup the screen
		 **********************************************************/

		// Tabs
		$('#navTab').seccubus_tabs();
		// Up2Date - tab 0
		// Runs - tab 1
		// Findigns - tab 2
		// Issues - tab 3
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
				if(!$(this).val()) {
					gui_state.attr("scans","");
					return;
				}
				$('.assetSelector').val('');
				var val = $(this).val();
				gui_state.attr("assets",'');
				gui_state.attr("scans",val);
				$('.scanSelector').val(val);
			});
		});

		render_asset_selectors();
		$('.assetSelector').each( function() {
			$(this).change(function() {
				if(!$(this).val()) {
					gui_state.attr("assets","");
					return;
				}
				$('.scanSelector').val('');
				var val = $(this).val();
				gui_state.attr("scans",'');
				gui_state.attr("assets",val);
				
				$('.assetSelector').val(val);
			});
		});

		$('#custSQL_table').each(function(){
			$(this).seccubus_custsql_table({
				saveSQL: function(sql,updateView){
					$("#widgetsModalMask").click();
					$('#saveSQL').seccubus_custsql_create({
						'sql':sql,
						afterSave:updateView,
						onClear:function(){
							$("#widgetsModalMask").click();
						}
					});
					$('#modalDialog').widgets_modal({
						query : '#saveSQLDialog',
						close : true
					});
				}
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

		// Setup issues
		render_issues();

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


		// Setup create asset
		$('.addAsset').click(function(){

			if(gui_state.workspace == -1){
				alert('Please select a workspace first');
			} else{
				$('#modalDialog').widgets_modal({
					query: '#createAssetDialog',
					close : true
				})
			}
		})

		/**********************************************************
		 * Functions
		 *********************************************************/
		function render_findings() {
			render_finding_table();
			render_filters();
			render_status();
		}

		function render_scan_selectors() {
			$('select.scanSelector').each( function() {
				$(this).seccubus_scan_select({
					workspace : gui_state.workspace
				});
			});
		};

		function render_asset_selectors() {
			$('select.assetSelector').each( function() {
				$(this).seccubus_asset_select({
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
							workspace : gui_state.workspace,
							onClear	: function() {
								$("#widgetsModalMask").click();
							},
							onNotificationEdit : function(not) {
								$("#widgetsModalMask").click();
								$('#editNotification').seccubus_notification_edit({
									notification : not,
									onClear : function() {
										$("#widgetsModalMask").click();
										$('#modalDialog').widgets_modal({
											query : "#editScanDialog",
											close : true
										});
									}
								});
								$('#modalDialog').widgets_modal( {
									query : '#editNotificationDialog',
									close : true
								});
							},
							onNotificationCreate : function(ws,sc) {
								$("#widgetsModalMask").click();
								$('#createNotification').seccubus_notification_create({
									workspace : ws,
									scan	: sc,
									onClear : function() {
										$("#widgetsModalMask").click();
										$('#modalDialog').widgets_modal({
											query : "#editScanDialog",
											close : true
										});
									}
								});
								$('#modalDialog').widgets_modal( {
									query : '#createNotificationDialog',
									close : true
								});
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
				assets 		: gui_state.assets,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
				severity	: gui_state.severity,
				issue 		: gui_state.issue,
				finding		: gui_state.finding,
				remark		: gui_state.remark,
				limit       : gui_state.limit,
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
				},
				onIssueEdit : function(issue) {
					console.log(issue);
					$('#editIssue').seccubus_issue_edit({
						workspace 	: gui_state.workspace,
						issue 		: issue,
						onClear		: function() {
							$("#widgetsModalMask").click();
						},
						findings 	: '#issueFindingTable'
					});
					$('#modalDialog').widgets_modal({
						query : "#editIssueDialog",
						close : true
					});					
				},
				onLink		: function (finding) {
					var findings = [];
					findings.push(finding);
					$('#createIssuelink').seccubus_issuelink_create({
						workspace 	: gui_state.workspace,
						findings 	: findings,
						onClear		: function() {
							$("#widgetsModalMask").click();
							render_findings();
						},
						onNewIssue 	: function(findings) {
							$("#widgetsModalMask").click();
							$('#createIssue').seccubus_issue_create({
								workspace 	: gui_state.workspace,
								findings 	: findings,
								onClear		: function() {
									$("#widgetsModalMask").click();
									render_findings();
								}
							});
							$('#modalDialog').widgets_modal({
								query : "#createIssueDialog",
								close : true
							});												
						}

					});
					$('#modalDialog').widgets_modal({
						query : "#createIssuelinkDialog",
						close : true
					});					
				}

			});
		};

		function render_asset_table(){
			$('#asset_table').each(function(){
				$(this).seccubus_asset_table({
					workspace : gui_state.workspace,
					onEdit : function(as){
						$('#editAsset').seccubus_asset_edit({
							asset : as,
							workspace : gui_state.workspace,
							onClear	: function() {
								$("#widgetsModalMask").click();
							},
							onHostCreate : function(ws,as){
								$("#widgetsModalMask").click();
								$('#createHostAsset').seccubus_asset_host_create({
									asset : as,
									workspace : gui_state.workspace,
									onClear : function(){
										$("#widgetsModalMask").click();
										$('#modalDialog').widgets_modal({
											query : "#editAssetDialog",
											close : true
										});
									}
								});
								$('#modalDialog').widgets_modal({
									query : "#createAssetHostDialog",
									close : true
								});

							},
							onHostEdit : function(ash){
								$("#widgetsModalMask").click();
								$('#editHostAsset').seccubus_asset_host_edit({
									'host' : ash,
									onClear:function(){
										$("#widgetsModalMask").click();
										$('#modalDialog').widgets_modal({
											query : "#editAssetDialog",
											close : true
										});
									}
								});
								$('#modalDialog').widgets_modal({
									query : '#editAssetHostDialog',
									close : true
								})
							}
						});
						$('#modalDialog').widgets_modal({
							query : "#editAssetDialog",
							close : true
						});
					}
				});
			});
		};

		function render_status() {
			$('#status_buttons').seccubus_status_status({
				workspace	: gui_state.workspace,
				scans		: gui_state.scans,
				assets 		: gui_state.assets,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
				severity	: gui_state.severity,
				issue 		: gui_state.issue,
				finding		: gui_state.finding,
				remark		: gui_state.remark,
				onClick		: function(s){
					gui_state.attr("findStatus",s);
				},
				updateOnClick : false
			});
		};
		function render_filters() {
			$('#filters').seccubus_filter_filter({
				workspace 	: gui_state.workspace,
				scans		: gui_state.scans,
				assets 		: gui_state.assets,
				status		: gui_state.findStatus,
				host		: gui_state.host,
				hostName	: gui_state.hostName,
				port		: gui_state.port,
				plugin		: gui_state.plugin,
				severity	: gui_state.severity,
				issue 		: gui_state.issue,
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
					//var url = "json/getAttachment.pl?workspaceId=" + wId.toString() + "&scanId=" + sId.toString() + "&runId=" + rId.toString() + "&attachmentId=" + aId.toString();
					var url = base_url + "workspace/" + wId.toString() + "/scan/" + sId.toString() + "/run/" + rId.toString() + "/attachment/" + aId.toString();
					window.open(url);
				}
			});
		};

		function render_bulkedit() {
			$('#finding_bulkedit').seccubus_finding_bulkedit({
				workspace	: gui_state.workspace,
				status		: gui_state.findStatus,
				onDone		: render_findings,
				onLink		: function (findings) {
					$('#createIssuelink').seccubus_issuelink_create({
						workspace 	: gui_state.workspace,
						findings 	: findings,
						onClear		: function() {
							$("#widgetsModalMask").click();
							render_findings();
						},
						onNewIssue 	: function(findings) {
							$("#widgetsModalMask").click();
							$('#createIssue').seccubus_issue_create({
								workspace 	: gui_state.workspace,
								findings 	: findings,
								onClear		: function() {
									$("#widgetsModalMask").click();
									render_findings();
								}
							});
							$('#modalDialog').widgets_modal({
								query : "#createIssueDialog",
								close : true
							});												
						}

					});
					$('#modalDialog').widgets_modal({
						query : "#createIssuelinkDialog",
						close : true
					});					
				}
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

		function render_create_asset(){
			$('#createAsset').seccubus_asset_create({
				workspace 	: gui_state.workspace,
				onClear 	: function(){
					$('#widgetsModalMask').click();
				}
			});
		};

		function render_issues(){
			$('#issue_table').seccubus_issue_table({
				workspace 	: gui_state.workspace,
				onCreate 	: function(ws) {
					$('#createIssue').seccubus_issue_create({
						workspace : ws,
						onClear	: function() {
							$("#widgetsModalMask").click();
						}
					});
					$('#modalDialog').widgets_modal({
						query : "#createIssueDialog",
						close : true
					});					
				},
				onIssueEdit	: function(issue) {
					$('#editIssue').seccubus_issue_edit({
						workspace 	: gui_state.workspace,
						issue 		: issue,
						onClear		: function() {
							$("#widgetsModalMask").click();
						},
						findings 	: '#issueFindingTable'
					});
					$('#modalDialog').widgets_modal({
						query : "#editIssueDialog",
						close : true
					});					
				}
			})
		}

	}
)
