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
steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'jquery/dom/form_params',
	'seccubus/models',
	'seccubus/history/table'
).then( './views/init.ejs', 
function($){

/**
 * @class Seccubus.Finding.Edit
 * @parent Finding
 * @inherits jQuery.Controller
 * Generates an dialog to show/edit one or more findings
 *
 * Story
 * -----
 *  As a user I would like to be able to have a detailed view and edit 
 *  posibility for findings
 */
$.Controller('Seccubus.Finding.Edit',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that contains the options
	 */
	defaults : {
		/* @attribute options.findings
		 * Array of findings to edit
		 */
		findings : [],
		/* @attribute options.index
		 * Index of which finding in the array to edit
		 * Default: 0
		 */
		index : 0,
		/* @attribute options.hostory
		 * jQuery query that defines where the history will be displayed
		 * Default : null
		 * If this attribute is null there will be no history displayed
		 */
		history : null,
		/* @attribute options.workspace
		 * Id of the current workspace
		 */
		workspace : -1

	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	updateView : function() {
		if ( this.options.findings.length == 0 ) {
			alert("Seccubus.Findings.Edit : No findings to edit");
		} else if ( this.options.workspace == -1 ) {
			alert("Seccubus.Findings.Edit : Workspace not set");
		} else {
			this.element.html(
				this.view(
					'init',
					this.options.findings[this.options.index],
					{
						index : this.options.index,
						length: this.options.findings.length
					}
				)
			)
		}
		if ( this.options.history != null ) {
			/* Display the finding history */
			$(this.options.history).seccubus_history_table({
				workspace	: this.options.workspace,
				findingId	: this.options.findings[this.options.index].id
			});
		}
	},
	".editSetStatus click" : function(el,ev) {
		ev.preventDefault();
		var newState = $(el).attr("newstatus");
		var param = this.element.formParams();
		var f = this.options.findings[this.options.index];
		f.attr("status",newState);
		f.attr("remark",param.remark);
		f.attr("overwrite",1);
		f.attr("workspaceId",this.options.workspace);
		f.save();
	},
	".move click" : function(el,ev) {
		ev.preventDefault();
		this.options.index = $(el).attr("index");
		this.updateView();
	},
	"{Seccubus.Models.Finding} updated" : function(Finding, ev, finding) {
		var n = 0;
		while(n < this.options.findings.length && this.options.findings[n].id != finding.id) {
			n++;
		}
		if(n < this.options.findings.length) {
			this.options.findings[n] = finding;
		}
		if(n == this.options.index) {
			this.updateView();
		}
	},
	/* 
	 * Update, overloaded to reder the control after and update even
	 */
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
