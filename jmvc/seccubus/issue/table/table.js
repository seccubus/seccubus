/*
 * Copyright 2013 Frank Breedijk
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
		onEdit      : function(finding_id) {
			console.log("No onEdit function set, called edit for finding id:" + finding_id);
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
		issue.elements(this.element)
		      .html(this.view('issue', issue) );
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
				})
			) 
		);		
	},

	// Handle expand clicks
	".findings-expander click" : function(el,ev) {
		el.toggleClass('expanded');
		el.toggleClass('collapsed');
		fid = el.attr('issue_id');
		$( '#findings_issue_'+fid ).toggle();
	},

	// Handle select clicks
	".openclose click" : function(el,ev) {
		if ( el.attr('checked') ) {
			$( '.' + el.attr('value') ).show();
		} else {
			$( '.' + el.attr('value') ).hide();			
		}

	},
	// Handle  edit clicks
	".edit click" :  function(el,ev) {
		this.options.onEdit(el.attr("finding_id"));
	},

	// Handle unlink event
	".unlink click": function(el,ev) {
		var issue = el.closest('.issue').model();
		console.log(issue);
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
