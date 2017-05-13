/*
 * Copyright 2014 Petr, Frank Breedijk
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
       './views/asset.ejs',
       './views/error.ejs',
function($){

/**
 * @class Seccubus.Asset.Select
 * @parent Asset
 * @inherits jQuery.Controller
 * Renders a control to select scans
 * @param {Object} options
 * Defines the options for this control
 */
$.Controller('Seccubus.Asset.Select',
/** @Static */
{
	/*
	 * @attribute options.workspace
	 * Determines which workspaces is selected.
	 * -1 (default value) means no workspace is selected
	 */
	defaults : {
		/* attribute options.workspace
		 * workspace id we are currently in
		 */
		workspace : -1,
		/* attribute options.selected
		 * Which options are selected now
		 * Obj: key: scan_id, val: asset_id
		 */
		selected : []
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
	// This controller is (re)initialized if a Asset object is destroyed
	"{Seccubus.Models.Asset} destroyed" : function(Asset, ev, asset) {
		this.updateView();
	},
	// This controller is (re)initialized if a Asset object is created
	"{Seccubus.Models.Asset} created" : function(Asset, ev, asset){
		this.updateView();
	},
	// A the option is rerendered if a Asset object is altered
	"{Seccubus.Models.Asset} updated" : function(Asset, ev, asset){
		asset.elements(this.element)
		      .html(this.view('asset', asset) );
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
			Seccubus.Models.Asset.findAll(
				{ workspace : this.options.workspace },
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
		if(this.options.selected.length != false){
			var sel = this.options.selected;
			$.map(items,function(item){
				if(item.id in sel){
					item.selected = true;
				}
			});
		}
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
