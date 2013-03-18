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
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Status.Status
 * @parent Status
 * Control that renders status selection buttons with find counts
 */
$.Controller('Seccubus.Status.Status',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options in its attributes
	 */
	defaults : {
		/*
	 	 * @attribute options.workspace
		 * Currently seleced workspace -1 means no workspace
	 	 */
		workspace	: -1,
		/*
	 	 * @attribute options.scan
		 * Array of currently selected scans
	 	 */
		scans		: null,
		/*
	 	 * @attribute options.status
		 * The current findStatus
	 	 */
		status		: 1,
		/*
	 	 * @attribute options.host
		 * The current host filter
	 	 */
		host		: "*",
		/*
	 	 * @attribute options.hostName
		 * The current hostName filter
	 	 */
		hostName	: "*",
		/*
	 	 * @attribute options.port
		 * The current port filter
	 	 */
		port		: "*",
		/*
	 	 * @attribute options.plugin
		 * The current plugin filter
	 	 */
		plugin		: "*",
		/*
	 	 * @attribute options.severity
		 * The current severity filter
	 	 */
		severity	: "*",
		/*
	 	 * @attribute options.finding
		 * The current finding filter
	 	 */
		finding		: "",
		/*
	 	 * @attribute options.remark
		 * The current remark filter
	 	 */
		remark		: "",
		/*
	 	 * @attribute options.onClick
		 * Function to be execute on clicking one of the buttons
	 	 */
		onClick 	: function(value) { },
		/*
	 	 * @attribute options.updateOnClick
		 * Boolean that determines if the control should update itself 
		 * when one of the buttons is clicked
	 	 */
		updateOnClick	: true
	}
},
/** @Prototype */
{
	/*
	 * Calls updateView to update itself
	 */
	init : function(){
		this.updateView();
	},
	'.setStatus click' : function(el) {
		$('.setStatus').attr("disabled",false);
		$(el).attr("disabled",true);
		this.options.status = el.val();
		this.options.onClick(this.options.status);
		if ( this.options.updateOnClick ) {
			this.updateView();
		}
	},
	/*
	 * This function renders the controller
	 */
	updateView : function() {
		if ( this.options.workspace < 0  ) {
			this.element.html(
				this.view('error', {sStatus : this.options.status})
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('error', {sStatus : this.options.status})
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Status.findAll({
						workspaceId	: this.options.workspace,
						scanIds		: this.options.scans,
						Status		: this.options.status,
						Host		: this.options.host,
						HostName	: this.options.hostName,
						Port		: this.options.port,
						Plugin		: this.options.plugin,
						Severity	: this.options.severity,
						Finding		: this.options.finding,
						Remark		: this.options.remark
					}),
					{
						sStatus		: this.options.status,
					}
				)
			);
		}
	},
	// (Re-)render the controller on create
	"{Seccubus.Models.Status} created" : function(Status, ev, finding) {
		this.updateView();
	},
	// (Re-)render the controller on update
	"{Seccubus.Models.Status} updated" : function(Status, ev, finding) {
		this.updateView();
	},
	// (Re-)render the controller on delete
	"{Seccubus.Models.Status} destroyed" : function(Status, ev, finding) {
		this.updateView();
	},
	/*
	 * Overloaded to rerender the controller on controller update
	 */
	update : function(options){
		this._super(options);
		this.updateView();
	},
	/*
	 * Function that returns the current status
	 * @return {Integer} Numeric status
	 */
	getStatus : function() {
		return this.options.status;
	}
}) // Controller

}); // Steal
