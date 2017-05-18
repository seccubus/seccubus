/*
 * Copyright 2017 Frank Breedijk
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
		 * @attribute options.finding
		 * The currently selected finding, -1 = no finding
		 */
		finding		: -1,
		/*
		 * @attribute options.showOpen
		 * Show open issues, default true
		 */
		showOpen 	: true,
		/*
		 * @attribute options.showClosed
		 * Show closed issues, default true
		 */
		showClosed 	: false,
		/*
		 * @attribute options.onIssueEdit
		 * The function that is called when the Edit button for an issue is clicked
		 */
		onIssueEdit		: function(issue) {
			console.log("No onIssueEdit function set, called for issue: " + +issue.id + issue);
		},
		/*
		 * @attribute options.onEdit
		 * The function that is called when the Edit finding button is clicked
		 */
		onFindingEdit 	: function(finding) {
			console.log("No onFunctionEdit function set, called edit for finding id:" + finding.id);
		},
		/*
		 * @attribute options.onEdit
		 * The function that is called when the create issue button is clicked
		 */
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
		issue.elements(this.element).html(
			this.view('issue',
				issue,
				{
					finding : this.options.finding
				}
			)
		);
	},
	/*
	 * This fuction rerenders the entire control with data from findAll
	 */
	updateView : function() {
		if ( this.options.finding > 0 ) {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Issue.findAll({
						workspace	: this.options.workspace,
						finding 	: this.options.finding
					}),
					{
						workspace	: this.options.workspace,
						finding 	: this.options.finding
					}
				)
			);
		} else {
			this.element.html(
					this.view(
					'init',
					Seccubus.Models.Issue.findAll({
						workspace	: this.options.workspace
					}),
					{
						workspace	: this.options.workspace,
						finding 	: this.options.finding
					}
				)
			);
		}
	},

	// Handle expand clicks
	".findings-expander click" : function(el,ev) {
		ev.preventDefault();
		el.toggleClass('expanded');
		el.toggleClass('collapsed');
		var iid = el.parent().attr('issue_id');
		el.parent().children('#count').toggle();
		var target = el.parent().children('#findings');
		target.toggle();
		if ( ! target.hidden ) {
			target.seccubus_issuelink_table({
				workspace 	: this.options.workspace,
				issue 		: iid,
				onEdit 		: this.options.onFindingEdit
			});
		}
	},

	// Handle select clicks
	".openclose click" : function(el,ev) {
		if ( el.attr('checked')) {
			this.element.find('.' + el.attr('value')).show()
		} else {
			this.element.find('.' + el.attr('value')).hide()
		}
	},

	// Handle edit clicks
	".edit_issue click" : function(el,ev) {
		var issue = el.closest('.issue').model();
		this.options.onIssueEdit(issue);
	},

	".set_status click" : function(el,ev) {
		var issue = el.closest('.issue').model();
		var row = el.parent().parent();
		row.removeClass(issue.statusName);
		row.addClass(el.attr("newStatusName"));
		issue.attr("workspace", this.options.workspace);
		issue.attr("status", el.attr("newStatus"));
		issue.attr("statusName", el.attr("newStatusName"));
		issue.save();
	},

	".create_issue click" : function(el,ev) {
		this.options.onCreate(this.options.workspace);
	},

	".unlink click" : function(el,ev) {
		var issue = el.closest('.issue').model();
		issue.attr("workspace",this.options.workspace);
		issue.attr("findings_remove",[this.options.finding]);
		// Don't confuse issues with findings
		issue.removeAttr("findings");
		issue.save();
        this.updateView();
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
