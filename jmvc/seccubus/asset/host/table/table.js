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
	'./views/host.ejs',
function($){
	$.Controller('Seccubus.Asset.Host.Table',
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
		 * @attribute options.asset
		 * The selected asset. -1 (default) means no asset was 
		 * selected
		 */
		asset : -1,
		/*
		 * @attribute options.onEdit
		 * This function is triggered with an edit link is clicked
		 */
		onEdit : function(ah) {
			alert("No onEdit function set for Seccubus.Asset.Host.Table<BR> assethost.id = " + ah.id);
		}
	}
},

/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	'.edit click': function( el ){
		var ash = el.closest('.assethost').model();
		this.options.onEdit(ash);
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			var ash = el.closest('.assethost').model().destroy();
		}
	},
	"{Seccubus.Models.Assethost} destroyed" : function(Asset, ev, assethost) {
		this.updateView();
	},
	"{Seccubus.Models.Assethost} created" : function(Asset, ev, assethost){
		this.updateView();
	},
	"{Seccubus.Models.Assethost} updated" : function(Asset, ev, assethost){
		this.updateView();
		// assethost.elements(this.element)
		// 	.html(this.view('assethost', assethost) );
	},
	updateView : function() {

		if ( this.options.workspace == -1 ) {
			this.element.html(
				this.view(
					'error',
					{ message : "No workspace selected" }
				)
			);
		} else if( this.options.asset == -1 ) {
			this.element.html(
				this.view(
					'error',
					{ message : "No asset selected" }
				)
			);
		} else {

			Seccubus.Models.Assethost.findAll(
				{ workspaceId : this.options.workspace,
				  assetId : this.options.asset },
				this.callback('dataReady')
			);
		}
	},
	dataReady : function(items) {
		this.element.html(this.view(
			'init',
			items,
			{ selectedWorkspace : this.options.workspace }
		));
	},
	update : function(options){
		this._super(options);
		this.updateView(); 
	}
});

});