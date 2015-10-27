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
	'seccubus/models'
     )
.then( 
	'./views/init.ejs', 
    './views/link.ejs', 
    './views/error.ejs', 
    function($){

/**
 * @class Seccubus.Issue.Table
 * @parent Issue
 * @inherits jQuery.Controller
 * Builds a table of findings for an issues
 */
$.Controller('Seccubus.Issuelink.Table',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.workspace
		 * The currently selected workspace, -1 = no workspace
		 */
		workspace	: -1,
		/*
		 * @attribute options.issue
		 * The currently selected issue, -1 = no issue
		 */
		issue	: -1,
		/*
		 * @attribute options.onEdit
		 * The function that is called when the Edit finding button is called
		 */
		onEdit      : function(finding) {
			console.log("No onEdit function set, called edit for finding id:" + finding.id);
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
	// (re-)Render on update
	"{Seccubus.Models.Issuelink} updated" : function(Issue, ev, issuelink) {
		this.updateView();
	},
	// (re-)Render on create
	"{Seccubus.Models.Issuelink} created" : function(Issue, ev, issuelink){
		this.updateView();
	},
	// Apend on update
	//"{Seccubus.Models.Issuelink} updated" : function(Issue, ev, issuelink){
	//	issuelink.elements(this.element)
	//	      .html(this.view('issuelink', issuelink) );
	//},
	/*
	 * This fuction rerenders the entire control with data from findAll
	 */
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			this.element.html(
				this.view(
					'error',
					{
						error: "No workspace selected",
						head: true
					}
				)
			);
		} else 	if ( this.options.issue == -1 ) {
			this.element.html(
				this.view(
					'error',
					{
						error: "No issue selected",
						head: true
					}
				)
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Issuelink.findAll({
							workspaceId	: this.options.workspace,
							findingId   : this.options.finding,
							Issue 		: this.options.issue
					})
				) 
			);		
		}
	},

	// Handle  edit clicks
	".edit click" :  function(el,ev) {
		var issuelink = el.closest('.issuelink').model();
		this.options.onEdit(issuelink);
	},

	// Handle unlink event
	".unlink click": function(el,ev) {
		var issuelink = el.closest('.issuelink').model();
		issuelink.attr("workspaceId",this.options.workspace);
		issuelink.attr("findingIdsRemove[]",issuelink.id);
		issuelink.attr("issueId",this.options.issue);
		// Don't confuse issues with findings
		issuelink.removeAttr("severity");
		issuelink.removeAttr("status");
		issuelink.save();
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
