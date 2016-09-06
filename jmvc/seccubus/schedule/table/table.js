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
	'jquery/controller/view',
	'seccubus/models'
).then(	
	'./views/init.ejs',
	'./views/error.ejs',
	'./views/schedule.ejs',
function($){

/**
 * @class Seccubus.Schedule.Table
 * @parent Schedule
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Schedule.Table',
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
		 * @attribute options.onEdit
		 * This function is triggered with an edit link is clicked
		 */
		onEdit : function(not) {
			alert("Seccubus.Schedule.Table: no edit function specified for notification id: " + not.id );
		},

		getSaveSchedules : function(){
			alert("Seccubus.Schedule.Table: no getSaveSchedules added");
		},

		delSavedSchedule : function(sch){
			alert("Seccubus.Schedule.Table: no delSavedSchedule added");
		}



	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},

	// "{Seccubus.Models.Schedule} created" : function(list, el,evt){
	// 	// var data = el.html();
	// 	console.log('OK',list, el,evt);
	// 	return
	// 	if(data === '*') return;
	// 	var monthNames = ['January','February','Marth','April','May','June','July','August','September','October','November','December'];
	// 	data = data.month.split(',').map(function(monId){
	// 			return monthNames[monId-1];
	// 		}).join('<BR>');
	// 	el.html(data);
	// },
	/*
	 * This function renders the control
	 */
	updateView : function() {
		var monthNames = ['','January','February','Marth','April','May','June','July','August','September','October','November','December'];
		var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thirsday', 'Friday', 'Saturday', 'Sunday'];
		var launch = {'d' : 'On demand', 'o' : 'Once', 'w' : 'Weekly', 'b' : 'Bi-weekly', 'm' : 'Monthly'};
		var weekTypes = {'w' : 'Every week', '2w' : 'Every 2nd week', '3w' : 'Every 3rd week', '4w' : 'Every 4th weel'};
		if ( this.options.scan  == -1 ) {
			console.warn("Seccubus.Schedule.Table: scan is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a scan to start"
					}
				)
			);
		} else if( this.options.scan == -2){
			var to = this;
			this.element.html(
				this.view(
					'init',
					function(){
						var data = to.options.getSaveSchedules();	
						return data.map(function(val){
							val.lastRun = '';
							val.enabled = val.enabled ? 'Yes' : ' ';
							val.launchT = launch[val.launch] || ' - ';
							val.monthT = monthNames[val.month] || ' - ';
							val.weekT = weekTypes[val.week];
							if(val.day < 10) { val.day = '0'+val.day; }
							
							val.wdayR = {};
							val.wdayT = to.splitJoinData(val.wday,'day',val.wdayR,weekDays);

							
							// val.lastRun = '';

							// val.monthR = {};
							// val.monthT = to.splitJoinData(val.month,'month',val.monthR,monthNames);

							// val.weekR = {};
							// val.weekT = to.splitJoinData(val.week,'week',val.weekR,weekTypes);
							
							// val.wdayR = {};
							// val.wdayT = to.splitJoinData(val.wday,'week day',val.wdayR,weekDays);

							// val.dayR = {};
							// val.dayT = to.splitJoinData(val.day,'day',val.dayR);

							// val.hourR = {};
							// val.hourT = to.splitJoinData(val.hour,'hour',val.hourR);

							// val.minR = {};
							// val.minT = to.splitJoinData(val.min,'minute',val.minR);
							val.noEdit = true;
							return val;	
						});
					}()
					
				)
			);
		}
		else {
			var to = this;
			to.element.html(
				to.view(
					'init',
					Seccubus.Models.Schedule.findAll({
						scanId		: to.options.scan
					},
					function(data){
						return data.map(function(val){
							val.enabled = val.enabled ? 'Yes' : ' ';
							val.launchT = launch[val.launch] || ' - ';
							val.monthT = monthNames[val.month] || ' - ';
							val.weekT = weekTypes[val.week];
							if(val.day < 10) { val.day = '0'+val.day; }
							
							val.wdayR = {};
							val.wdayT = to.splitJoinData(val.wday,'day',val.wdayR,weekDays);

							

							// val.hourR = {};
							// val.hourT = to.splitJoinData(val.hour,'hour',val.hourR);

							// val.minR = {};
							// val.minT = to.splitJoinData(val.min,'minute',val.minR);
							val.noEdit = false;

							return val;	
						});
					})
				)
			);
		}
	},

	splitJoinData:function(data,paramName,setArr,toChangeArr){
		if(!data){ data = ''; }
		if(data === '*'){
			setArr[data] = true;
			return 'Every '+paramName;
		}
		return data.split(',').map(function(val){
			setArr[val] = true;
			if(! toChangeArr) return val;
			return toChangeArr[val];
		}).join(', ');
	},
	".edit click" : function(el,ev) {
		ev.preventDefault();
		var not = el.closest('.schedule').model();
		this.options.onEdit(not);
	},
	".destroy click" : function(el, ev) {
		ev.preventDefault();
		if(confirm("Are you sure you want to delete this schedule?")){
			var schedule = el.closest(".schedule").model();
			if(this.options.scan < 0){
				this.options.delSavedSchedule(schedule);
			} else{
				schedule.destroy();	
			}
			
		}
	},
	"{Seccubus.Models.Schedule} destroyed" : function(Schedule, ev, schedule) {
		// console.log('destroyed:',Schedule, ev, schedule);
		this.updateView();
	},
	"{Seccubus.Models.Schedule} created" : function(Schedule, ev, schedule){
		// console.log('created:',Schedule, ev, schedule);
		this.updateView();
	},
	"{Seccubus.Models.Schedule} updated" : function(Schedule, ev, schedule){
		// console.log('updated:',Schedule, ev, schedule);
		// schedule.elements(this.element).html(this.view('schedule', schedule) );
		this.updateView();
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
