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
steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'jquery/dom/form_params',
	'seccubus/models',
	'seccubus/issue/select'
).then( './views/init.ejs',
function($){

/**
 * @class Seccubus.Issue.Create
 * @parent Issue
 * @inherits jQuery.Controller
 * Generates an dialog to show/create one or more issues
 *
 * Story
 * -----
 *  As a user I would like to be able to have a detailed view and create
 *  posibility for issues
 */
$.Controller('Seccubus.Issuelink.Create',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that contains the options
	 */
	defaults : {
		/* @attribute options.workspace
		 * Id of the current workspace
		 */
		workspace : -1,
		/*
		 * @attribute findings
		 * Array of findings to link to new issue
		 */
		findings : [],
		/*
		 * @attribute options.onClear
		 * Funciton that is called when the form is cleared, e.g. to
		 * disable a modal display
		 */
		onClear : function () {
		},
		/*
		 * @attribute options.onClear
		 * Funciton that is called when the form is cleared, e.g. to
		 * disable a modal display
		 */
		onNewIssue : function (findings) {
			console.warn("Seccubus.Issuelink.Create: onNewIssue called but not set");
			console.log(findings);
		}
	}

},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			console.warn("Seccubus.Issuelink.Create : Workspace not set");
			this.element.html("");
		} else if ( this.options.findings.length == 0 ) {
			console.warn("Seccubus.Issuelink.Create : No findings to link");
			this.element.html("");
		} else {
			this.element.html(
				this.view(
					'init',
					{},
					{
						findings : this.options.findings
					}
				)
			);
			$('#issueSelectNewLink').seccubus_issue_select(
				{
					workspace 	: this.options.workspace,
					includeNew	: true,
					openOnly	: true
				}
			);
		}
	},
	// Handle different issue values
	"#issueSelectNewLink change" : function(el,ev) {
		ev.preventDefault();
		var btn = this.element.find('#issuelinkCreateButton');
		btn.attr('disabled', false);
		if ( el[0].value == -2 ) {
			btn.attr('value','Create');
		} else {
			btn.attr('value','Link');
		}
	},
	".createSetStatus click" : function(el,ev) {
		ev.preventDefault();

		var param = this.element.formParams();
		// Check form
		var ok = true;
		var elements = [];
		if ( param.issueSelectNewLink == -1 ) {
			elements.push("#issueSelectNewLink");
			ok = false;
		}

		if ( param.issueId == -2 ) {
			this.options.onNewIssue(this.options.findings);
		} else {
			if ( ok ) {
				issue = new Seccubus.Models.Issue(param);
				issue.attr("workspace", this.options.workspace);
                issue.attr("issue_id", param.issueId);
				issue.attr("findings_add", []);
				for ( i=0;i < this.options.findings.length;i++) {
					issue.attr("findings_add").push(this.options.findings[i].id);
				}
				issue.save(this.callback('saved'));
			} else {
				this.nok(elements);
			}
		}
	},
	nok : function(elements) {
		this.element.children(".nok").removeClass("nok");
		for(i=0;i<elements.length;i++) {
			$(elements[i]).addClass("nok");
		}
		this.element.css({position : "absolute"});
		this.element.animate({left : '+=10'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=10'},100);
		this.element.css({position : "relative"});
	},
	".cancel click" : function() {
		this.clearAll();
	},
	saved : function(){
		this.clearAll();
	},
	clearAll : function() {
		console.log("clearAll");
		$(".nok").removeClass("nok");
		this.options.findings = [];
		this.updateView();
		this.options.onClear();
	},
	"{Seccubus.Models.Issue} updated" : function(Issue, ev, issue) {
		this.updateView();
	},
	// Autoclear nok status
	".nok change" : function(el) {
		el.removeClass("nok");
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
