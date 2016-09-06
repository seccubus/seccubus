/*
 * Copyright 2015 Frank Breedijk, Petr
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
 * @class Seccubus.Schedule.Edit
 * @parent Schedule
 * @inherits jQuery.Controller
 * Generates a dialog to edit a schedule
 *
 * Story
 * -----
 * As a user I would like to be able to edit schedule from the GUI
 */
$.Controller('Seccubus.Schedule.Edit',
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
		 * Notification object that needs to be edited
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
		// var monthNames = ['January','February','Marth','April','May','June','July','August','September','October','November','December'];
		// var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thirsday', 'Friday', 'Saturday', 'Sunday'];
		// console.log(this.options.schedule);
		this.element.html(
			this.view(
				'init',
				this.options.schedule
			)
		);
		$('#editNotTrigger').seccubus_event_select({
			selected : this.options.schedule.schedule_id
		});
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		var ok = true;
		var elements = [];
		if ( ok ) {
			this.element.find('[type=submit]').val('Updating...')
			schedule = this.options.schedule;
			schedule.enabled = params.enabled;
			schedule.launch = params.launch;
			schedule.month = params.month;
			schedule.week = params.week;
			// schedule.month  = this.setParam(params.month);
			// schedule.week   = this.setParam(params.week);
			schedule.wday   = this.setParam(params.wday);
			schedule.day = params.day;
			schedule.hour = params.hour;
			schedule.min = params.min	
			// schedule.day    = this.setParam(params.day);
			// schedule.hour   = this.setParam(params.hour);
			// schedule.min    = this.setParam(params.min);
			// schedule.month = params.month;
			// schedule.week = params.week;
			// schedule.day = params.day;
			// schedule.hour = params.hour;
			// schedule.min = params.min;
			schedule.save(this.callback('saved'));
		} else {
			this.nok(elements);
		}
	},
	setParam : function(val){
		if($.isArray(val)){
			return val.join(',');
		} else{
			// console.log(val);
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

	// "select click" :function(el){
	// 	// console.log(el.attr('name'));
	// 	if(el.find('option:checked').length > 0){
	// 		$('input[name='+el.attr('name')+']').removeAttr('checked');
	// 	} else{
	// 		$('input[name='+el.attr('name')+']').attr('checked',true);
	// 	}
	// },

	// "input[type=checkbox] click" : function(el){
	// 	$('select[name='+el.attr('name')+'] option').removeAttr('selected');
	// 	el.attr('checked',true);
	// },

	"select[name=launch] change" : function(el){
		var weekDay = $('select[name=wday]').attr('disabled',true);
		var week = $('select[name=week]').attr('disabled',true);
		if(el.val() == 'w' || el.val() == 'b' ){ weekDay.removeAttr('disabled'); }
		if(el.val() == 'b'){ week.removeAttr('disabled'); }
	},

	"select[name=month] change" : function(el){
		var days = $('select[name=day]');
		var selDay = days.val();
		var sm = el.val();
		days.empty();
		var daysMuch = 30;
		if(sm == 1 || sm == 3 || sm == 5 || sm == 7 || sm == 8 || sm == 10 || sm == 12 ){ daysMuch = 31; }
		else if( sm == 2){ daysMuch = 29; }
		for(var i=1; i <= daysMuch; i++){
			var cNum = i;
			if(cNum < 10) { cNum = '0'+cNum; }
			var option = $('<option>').html(cNum).attr('value',i).appendTo(days); 
			if(i == selDay){ option.attr('selected', true); }
		}
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
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
