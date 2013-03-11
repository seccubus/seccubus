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
steal( 'jquery/controller',
       'jquery/view/ejs',
       'jquery/controller/view',
       'seccubus/models' )
.then( './views/init.ejs', 
       './views/scan.ejs', 
       './views/error.ejs',
function($){

/**
 * @class Seccubus.Scan.Select
 * @parent Scan
 * @inherits jQuery.Controller
 * Renders a control to select scans
 * @param {Object} options
 * Defines the options for this control
 */
$.Controller('Seccubus.Scan.Select',
/** @Static */
{
	/*
	 * @attribute options.workspace
	 * Determines which workspaces is selected.
	 * -1 (default value) means no workspace is selected
	 */
	defaults : {
		workspace : -1
	}
},
/** @Prototype */
{
	/*
	 * Initializes the controller by calling updateView
	 */
	init : function(){
		this.updateView();
	},
	// This controller is (re)initialized if a Scan object is destroyed
	"{Seccubus.Models.Scan} destroyed" : function(Scan, ev, scan) {
		this.updateView();
	},
	// This controller is (re)initialized if a Scan object is created
	"{Seccubus.Models.Scan} created" : function(Scan, ev, scan){
		this.updateView();
	},
	// A the option is rerendered if a Scan object is altered
	"{Seccubus.Models.Scan} updated" : function(Scan, ev, scan){
		scan.elements(this.element)
		      .html(this.view('scan', scan) );
	},
	/*
	 * @function updateView
	 * This function renders the entire controller
	 *
	 * If this.options.workspace == -1 the message "no workspace selected"
	 * will be displayed
	 */
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			this.element.html(
				this.view(
					'error',
					{message : "No workspace selected" }
				)
			);
		} else {
			Seccubus.Models.Scan.findAll( 
				{ workspaceId : this.options.workspace },
				this.callback('dataReady')
			);
		}
	},
	/*
	 * @function dataReady
	 * This is the callback functio that is used internally after the 
	 * findAll call in updateView 
	 * @param {Deferred} items
	 * A deferred containing all scans
	 */
	dataReady : function(items) {
		this.element.html(this.view(
			'init',
			items,
			{selectedWorkspace : this.options.workspace }
		));
	},
	/*
	 * @function update
	 * This overloads the standard update funciton to allways excute 
	 *  updateView then the control is updated
	 * @param {Object} options
	 * The options object
	 */
	update : function(options){
		this._super(options);
		this.updateView();
	}
});

});
