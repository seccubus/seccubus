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
 steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
).then( './views/init.ejs',
	'./views/error.ejs',
	'./views/asset.ejs',
function($){
/**
 * @class Seccubus.Asset.Table
 * @parent Asset
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Asset.Table',
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
		onEdit : function(as) {
			alert("No onEdit function set for Seccubus.Asset.Table<BR> asset.id = " + sc.id);
		}
	}
},

/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.edit click': function( el ){
		var as = el.closest('.asset').model();
		this.options.onEdit(as);
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.asset').model().destroy();
		}
	},
	"{Seccubus.Models.Asset} destroyed" : function(Asset, ev, asset) {
		this.updateView();
	},
	"{Seccubus.Models.Asset} created" : function(Asset, ev, asset){
		this.updateView();
	},
	"{Seccubus.Models.Asset} updated" : function(Asset, ev, asset){
		asset.elements(this.element)
			.html(this.view('asset', asset) );
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
			Seccubus.Models.Asset.findAll(
				{ workspaceId : this.options.workspace },
				this.callback('dataReady')
			);
		}
	},
	dataReady : function(items) {
		$.map(items,function(item){
		});
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