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
.then( './views/init.ejs',
       './views/issue.ejs',
       function($){

/**
 * @class Seccubus.Issue.Select
 * @parent Issue
 * @inherits jQuery.Controller
 * Builds a dropdown selector of issues
 */
$.Controller('Seccubus.Issue.Select',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.workspace
		 * The currently selected workspace, -1 = no workspace
		 */
		workspace	: -1,
		/*
		 * @attribute options.includeNew
		 * Include creating a new issue in the options
		 */
		includeNew 	: false,
		/*
		 * @attribute options.openOnly
		 * Only include open issues in the options
		 */
		openOnly 	: false
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
		if ( this.options.workspace == -1 ) {
			this.element.html(this.view('error'));
		} else {
			console.log(this.options);
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Issue.findAll({
							workspace	: this.options.workspace
					}),
					{
						includeNew 	: this.options.includeNew,
						openOnly	: this.options.openOnly
					}
				)
			);
		}
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
