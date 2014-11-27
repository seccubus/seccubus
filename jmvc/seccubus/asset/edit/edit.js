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
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models',
	'seccubus/asset/host/table'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Asset.Edit
 * @parent Asset
 * @inherits jQuery.Controller
 * Generates a dialog to edit a asset
 *
 * Story
 * -----
 * As a user I would like to be able to edit scans from the GUI
 */
$.Controller('Seccubus.Asset.Edit',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that contains the options
	 */
	defaults : {
		/*
		 * @attribute options.onClear
		 * Funciton that is called when the form is cleared, e.g. to 
		 * disable a modal display
		 */
		onClear : function () { },
		/* attribute options.asset
		 * Asset object that needs to be edited
		 */
		asset : null,
		/* attribute options.onHostEdit
		 * Function that is called when the edit link is click in the 
		 * hosts screen
		 */
		onHostEdit : function(ash) {
			alert("Seccubus.Asset.Edit: no edit function specified for asset id: " + ash.id );
		},
		/* attribute options.onHostDelete
		 * Function that is called when the delete link is click in the 
		 * hosts screen
		 */
		// onHostDelete : function(as){
		// 	alert("Seccubus.Asset.Edit: no delete function specified for asset id: " + as.id );
		// },
		/* attribute options.onHostCreate
		 * Function that is called when the create button is click in the 
		 * hosts screen
		 */
		onHostCreate : function(ws,as) {
			alert("Seccubus.Asset.Edit: no create function specified for asset " + ws + "," + as);
		},
		/* attribute options.workspaces
		 * workspace id we are currently in
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
		this.element.html(
			this.view(
				'init',
				this.options.asset
			)
		);
		var ws = this.options.workspace,
			as = this.options.asset.id,
			options = this.options;

		$('#editAssetHost').seccubus_asset_host_table({
			workspace : ws,
			asset : as,
			onEdit : options.onHostEdit
		});
		$('.createHost').click(function(){ options.onHostCreate(ws,as); });
	},
	submit : function(el, ev){
		ev.preventDefault();
		var params = el.formParams();
		var elements = [];
		var ok = true;
		if(params.name == ''){
			ok = false;
			elements.push('#editAssetName');
		}
		if ( ok ) {
			this.element.find('[type=submit]').val('Updating...')
			var as = this.options.asset;
			as.name = params.name;
			as.hosts = params.hosts;
			as.recipients = params.recipients;
			as.recipientsHtml = as.recipients.replace(/([-0-9a-zA-Z.+_]+\@[-0-9a-zA-Z.+_]+\.?[a-zA-Z]{0,4})/g,"<a href='mailto:$1'>$1<\/a>");
			as.save(this.callback('saved'));
		} else {
			this.nok(elements);
		}
	},
	nok : function(elements) {
		this.element.children(".nok").removeClass("nok");
		for(i=0;i<elements.length;i++) {
			$(elements[i]).addClass("nok");
		}
		this.element.css({position : "absolute"});
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.css({position : "relative"});
	},
	".cancel click" : function() {
		this.clearAll();
	},
	saved : function(){
		this.clearAll();
	},
	clearAll : function() {
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset()
		$(".nok").removeClass("nok");
		this.options.onClear();
	},
	".nok change" : function(el) {
		el.removeClass("nok");
	},
	// ".createNotification click" : function(el, ev) {
	// 	ev.preventDefault();
	// 	this.options.onNotificationCreate(this.options.workspace, this.options.scan.id);
	// },
	update : function(options) {
		this._super(options);
		this.updateView();
	}
});

});