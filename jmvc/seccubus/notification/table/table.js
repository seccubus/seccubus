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
	'./views/notification.ejs',
function($){

/**
 * @class Seccubus.Notification.Table
 * @parent Notification
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Notification.Table',
/** @Static */
{
	/*
	 * @attribute options
	 * Object holding all options in it's attributes
	 */
	defaults : {
		/*
		 * @attribute options.scan
		 * The selected scan. -1 (default) means on scan selected.
		 */
		scan : -1,
		/*
		 * @attribute options.workspace
		 * The selected workspace. -1 (default) means on scan selected.
		 */
		workspace : -1,
		/*
		 * @attribute options.onEdit
		 * This function is triggered with an edit link is clicked
		 */
		onEdit : function(not) {
			alert("Seccubus.Notification.Table: no edit function specified for notification id: " + not.id );
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
		if ( this.options.scan === -1 ) {
			console.warn("Seccubus.Notification.Table: scan is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a scan and workspace to start"
					}
				)
			);
		} else if ( this.options.workspace === -1 ) {
			console.warn("Seccubus.Notification.Table: workspace is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a scan and workspace to start"
					}
				)
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Notification.findAll({
						scan		: this.options.scan,
						workspace	: this.options.workspace
					})
				)
			);
		}
	},
	".edit click" : function(el,ev) {
		ev.preventDefault();
		var not = el.closest('.notification').model();
        not.workspace = this.options.workspace;
        not.scan = this.options.scan;
        console.log(not);
		this.options.onEdit(not);
	},
	".destroy click" : function(el, ev) {
		ev.preventDefault();
		if(confirm("Are you sure you want to delete this notification?")){
			el.closest(".notification").model().destroy({
				scan 	: this.options.scan,
				workspace	: this.options.workspace
			});
		}
	},
	"{Seccubus.Models.Notification} destroyed" : function(Notification, ev, notification) {
		this.updateView();
	},
	"{Seccubus.Models.Notification} created" : function(Notification, ev, notification){
		this.updateView();
	},
	"{Seccubus.Models.Notification} updated" : function(Notification, ev, notification){
		notification.elements(this.element).html(this.view('notification', notification) );
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
