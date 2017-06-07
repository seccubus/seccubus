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
steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
).then(	
	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Run.Table
 * @parent Run
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Run.Table',
/** @Static */
{
	/*
	 * @attribute options
	 * Object holding all options in it's attributes
	 */
	defaults : {
		/*
		 * @attribute options.workspace
		 * The selected workspace. -1 (default) means on workspace is
		 * selected.
		 */
		workspace : -1,
		/*
		 * @attribute options.scan
		 * The selected scan. -1 (default) means on scan selected.
		 */
		scan : -1,
		/*
		 * @attribute options.download
		 * Boolean that specifies if a download link is given. 
		 * Default: false
		 */
		download: false,
		/*
		 * @attribute options.onDownload
		 * Function that will be fired when a downloadlink is triggered
		 */
		onDownload : function(workspaceId, scanId, runId, attachmentId) {
			alert("Seccubus.Run.Table: no download function specified: " + workspaceId + " " + scanId + " " + runId + " " + attachmentId);
		}
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	/*
	 * This function renders the control
	 */
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			console.warn("Seccubus.Run.Table: workspace is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a workspace to start"
					}
				)
			);
		} else if ( this.options.scan  == -1 ) {
			console.warn("Seccubus.Run.Table: scan is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a scan to start"
					}
				)
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Run.findAll({
						workspace	: this.options.workspace,
						scan		: this.options.scan
					}),
					{
						download	: this.options.download
					}
				)
			);
		}
	},
	".download click" : function(el,ev) {
		ev.preventDefault();
		this.options.onDownload(
			this.options.workspace,
			this.options.scan, 
			el.attr("runId"),
			el.attr("attachmentId")
		);
	},
	/* 
	 * Update is overloaded to render the control on each update to the 
	 * control
	 */
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
