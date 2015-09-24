/*
 * Copyright 2015 Frank Breedijk
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
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models',
	'seccubus/issuelink/table'
     )
.then( './views/init.ejs', 
       './views/issue.ejs',
       function($){

/**
 * @class Seccubus.Issue.Table
 * @parent Issue
 * @inherits jQuery.Controller
 * Builds a table of issues
 */
$.Controller('Seccubus.Issue.Table',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.workspace
		 * The currently selected workspace, -1 = no workspace
		 */
		workspace	: -1,
		/*
		 * @attribute options.onEdit
		 * The function that is called when the Edit finding button is called
		 */
		onIssueEdit		: function(issue) {
			console.log("No onIssueEdit function set, called for issue: " + +issue.id + issue);
		},
		onFindingEdit 	: function(finding) {
			console.log("No onFunctionEdit function set, called edit for finding id:" + finding.id);
		},
		onCreate : function(workspaceId) {
			console.log("No onCreate function set to create issue in workspace: " + workspaceId);
		}
	}
},
/** @Prototype */
{
	/* This funciton calls updateView to render the control
	 */
	init : function(el, fn){
		this.updateView();
	},
	// (re-)Render on delete
	"{Seccubus.Models.Issue} destroyed" : function(Issue, ev, issue) {
		this.updateView();
	},
	// (re-)Render on create
	"{Seccubus.Models.Issue} created" : function(Issue, ev, issue){
		this.updateView();
	},
	// Apend on update
	"{Seccubus.Models.Issue} updated" : function(Issue, ev, issue){
		this.updateView();
	},
	/*
	 * This fuction rerenders the entire control with data from findAll
	 */
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				Seccubus.Models.Issue.findAll({
					workspaceId	: this.options.workspace	
				}),
				{ 
					workspace	: this.options.workspace	
				}
			) 
		);		
	},

	// Handle expand clicks
	".findings-expander click" : function(el,ev) {
		el.toggleClass('expanded');
		el.toggleClass('collapsed');
		fid = el.attr('issue_id');
		$( '#issue_finding_count_'+fid).toggle();
		var target = $( '#findings_issue_'+fid );
		console.log(target);
		target.toggle();
		target.seccubus_issuelink_table({
			workspace 	: this.options.workspace,
			issue 		: target.attr("issue_id"),
			onEdit 		: this.options.onFindingEdit
		});
	},

	// Handle select clicks
	".openclose click" : function(el,ev) {
		if ( el.attr('checked') ) {
			$( '.' + el.attr('value') ).show();
		} else {
			$( '.' + el.attr('value') ).hide();			
		}
	},

	// Handle edit clicks
	".edit_issue click" : function(el,ev) {
		var issue = el.closest('.issue').model();
		this.options.onIssueEdit(issue);
	},

	".set_status click" : function(el,ev) {
		var issue = el.closest('.issue').model();
		issue.attr("workspaceId", this.options.workspace);
		issue.attr("issueId", issue.id);
		issue.attr("status", el.attr("newStatus"));
		issue.attr("statusName", el.attr("newStatusName"));
		issue.save();
	},

	".create_issue click" : function(el,ev) {
		this.options.onCreate(this.options.workspace);
	},

	/*
	 * Update, overloaded to rerender the control after an update event
	 */
	update : function(options){
		this._super(options);
		this.updateView();
	}
}); // Controller

}); // Steal
