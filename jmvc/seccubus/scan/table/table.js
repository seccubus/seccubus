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
	'seccubus/models'
).then( './views/init.ejs',
	'./views/error.ejs',
	'./views/scan.ejs',
function($){

/**
 * @class Seccubus.Scan.Table
 * @parent Scan
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Scan.Table',
/** @Static */
{
	/* 
	 * @attribute options
	 * Object holding all options
	 */
	defaults : {
		/*
		 * @attribute options.workspace
		 * The selected workspace. -1 (default) means no workspace was 
		 * selected
		 */
		workspace : -1,
		/*
		 * @attribute options.onEdit
		 * This function is triggered with an edit link is clicked
		 */
		onEdit : function(sc) {
			alert("No onEdit function set for Seccubus.Scan.Table\nscan.id = " + sc.id);
		}
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.edit click': function( el ){
		var sc = el.closest('.scan').model();
		this.options.onEdit(sc);
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.scan').model().destroy();
		}
	},
	"{Seccubus.Models.Scan} destroyed" : function(Scan, ev, scan) {
		this.updateView();
	},
	"{Seccubus.Models.Scan} created" : function(Scan, ev, scan){
		this.updateView();
	},
	"{Seccubus.Models.Scan} updated" : function(Scan, ev, scan){
		scan.elements(this.element)
			.html(this.view('scan', scan) );
	},
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
	dataReady : function(items) {
		this.element.html(this.view(
			'init',
			items,
			{selectedWorkspace : this.options.workspace }
		));
	},
	update : function(options){
		this._super(options);
		this.updateView(); 
	}
});

});
