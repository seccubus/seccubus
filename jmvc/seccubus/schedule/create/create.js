/*
 * Copyright 2013 Frank Breedijk, Petr
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
	'seccubus/event/select'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Schedule.Create
 * @parent Schedule
 * @inherits jQuery.Controller
 * Generates a dialog to create a Schedule
 *
 * Story
 * -----
 * As a user I would like to be able to edit schedule from the GUI
 */
$.Controller('Seccubus.Schedule.Create',
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
		/* attribute options.schedule
		 * Schedule object that needs to be edited
		 */
		schedule : null
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
				this.options.schedule
			)
		);
		// $('#editNotTrigger').seccubus_event_select({
		// 	selected : this.options.schedule.schedule_id
		// });
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		var ok = true;
		var elements = [];
		if ( ok ) {
			this.element.find('[type=submit]').val('Creating...')
			params.workspaceId = this.options.workspace;
			params.scanId = this.options.scan;
			params.month  = this.setParam(params.month);
			params.week   = this.setParam(params.week);
			params.wday   = this.setParam(params.wday);
			params.day    = this.setParam(params.day);
			params.hour   = this.setParam(params.hour);
			params.min    = this.setParam(params.min);
			new Seccubus.Models.Schedule(params).save(this.callback('saved'));
		} else {
			this.nok(elements);
		}
	},
	setParam : function(val){
		if($.isArray(val)){
			return val.join(',');
		} else{
			if(val == 'on') val = '*';
			return val;
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
		this.element.find('[type=submit]').val('Update Schedule');
		this.element[0].reset();
		$(".nok").removeClass("nok");
		this.options.onClear();
	},
	".nok change" : function(el) {
		el.removeClass("nok");
	},

	"select click" :function(el){
		// console.log(el.attr('name'));
		if(el.find('option:checked').length > 0){
			$('input[name='+el.attr('name')+']').removeAttr('checked');
		} else{
			$('input[name='+el.attr('name')+']').attr('checked',true);
		}
	},

	"input[type=checkbox] click" : function(el){
		$('select[name='+el.attr('name')+'] option').removeAttr('selected');
		el.attr('checked',true);
	},
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
