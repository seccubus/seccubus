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
	'seccubus/scanner/select',
	'seccubus/notification/table',
	'seccubus/asset/select'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Scan.Edit
 * @parent Scan
 * @inherits jQuery.Controller
 * Generates a dialog to edit a scan
 *
 * Story
 * -----
 * As a user I would like to be able to edit scans from the GUI
 */
$.Controller('Seccubus.Scan.Edit',
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
		/* attribute options.scan
		 * Scan object that needs to be edited
		 */
		scan : null,
		/* attribute options.assets
		 * Assets objects which are in workplace
		 */

		onNotificationEdit : function(not) {
			alert("Seccubus.Scan.Edit: no edit function specified for notification id: " + not.id );
		},
		/* attribute options.onNotificationCreate
		 * Function that is called when the edit link is click in the 
		 * notification screen
		 */
		onNotificationCreate : function(ws,sc) {
			alert("Seccubus.Scan.Edit: no create function specified for notification " + ws + "," + sc);
		},
		/* attribute options.workspace
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
	updateView:function(){
		var to = this;
		to.element.html(
			to.view(
				'init',
				to.options.scan
			)
		);
		$('#editScanScanner').seccubus_scanner_select({
			helpHere : '#editScanHelp',
			paramsHere : '#defaultParams',
			selected : to.options.scan.scanner
		});
		$('#editScanNotifications').seccubus_notification_table({
			scan	: to.options.scan.id,
			onEdit	: to.options.onNotificationEdit,
			onCreate : to.options.onNotificationCreate
		});
		Seccubus.Models.Asset2Scan.findAll({
			scanid:to.options.scan.id,
			workspace : to.options.workspace},
			function(selAssets){
				var selAssObj = {};
				$.map(selAssets,function(val){ selAssObj[val['asset_id']] = true; });
				$('#editScanAssets').seccubus_asset_select({
			 		workspace : to.options.workspace,
			 		selected : selAssObj
				});

			})
		
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		if ( params.scanner == 'other' ) {
			params.scanner = params.otherScanner;
		}
		var ok = true;
		var elements = [];
		if ( params.name == '' ) {
			elements.push("#editScanName");
			ok = false;
		}
		if ( params.scanner == '' || params.scanner == 'none' ) {
			elements.push("#editScanScanner", "#editScanOtherScanner");
			ok = false;
		}
		var paramStr = params.parameters;
		if ( paramStr == '' ) {
			elements.push("#editScanParam");
			ok = false;
		}
		console.log("Assets: "+params.assets);
		if( ( paramStr.indexOf('@HOSTS') != -1 || paramStr.indexOf('$HOSTS') != -1  ) && params.targets == ''){
			elements.push("#editScanTargets");
			ok = false;
		}
		if( (paramStr.indexOf('$ASSETS') != -1 || paramStr.indexOf('@ASSETS') != -1) && (params.assets == null) ){
			elements.push('#editScanAssets');
			ok = false;
			console.log("Assets False");
		}
		
		if ( ok ) {
			this.element.find('[type=submit]').val('Updating...')

			sc = this.options.scan;
			sc.name = params.name;
			sc.scanner = params.scanner;
			sc.parameters = params.parameters;
			sc.targets = params.targets;
			sc.assets = params.assets;
			Seccubus.Models.Asset2Scan.update({
				id:sc.id,
				assets:params.assets
			})
			sc.save(this.callback('saved'));
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
	"#editScanScanner change" : function() {
		if ( $('#editScanScanner').val() == null || $('#editScanScanner').val() == 'other'  ) {
			$('#editScanOtherScannerRow').show();
		} else {
			$('#editScanOtherScannerRow').hide();
		}
	},
	".nok change" : function(el) {
		el.removeClass("nok");
	},
	".createNotification click" : function(el, ev) {
		ev.preventDefault();
		this.options.onNotificationCreate(this.options.workspace, this.options.scan.id);
	},
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
