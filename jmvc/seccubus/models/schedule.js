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
steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Scan
 * @parent Scan
 * @inherits jQuery.Model
 * Wraps backend scan services.  
 */
$.Model('Seccubus.Models.Schedule',
/* @Static */
{
	/*
	 * @function findAll
	 * @param {Object} params
	 * Parameters of the API call
	 * @param {Function} success
	 * Callback funciton in case of success
	 * @param {Function} error
	 * Callback function in case of error
	 * @return {Deferred} A deferred Scans (Scan.List)
	 */
	findAll : function(params,success,error){
		
		return $.ajax({
			url	: "json/getSchedules.pl",
			type	: "POST",
			dataType: "json schedule.models",
			data	: params,
			success : success,
			// success	: function(data){
			// 	data = data.map(function(val){
			// 		val.month = val.month.split(',').map(function(monId){
			// 			return monthNames[monId-1];
			// 		}).join('<BR>');
			// 		return val;
			// 	});
			// 	if(success) success(data);
				
			// },
			error	: error
		});
	},
  	// Not implemented
	//findOne	: "/scans/{id}.json", 
  	create	: "POST json/createSchedule.pl",
	update	: "POST json/updateSchedule.pl",
	destroy	: "POST json/deleteSchedule.pl"
  	// Not implemented yet
	//destroy	: "/scans/{id}.json"
},
/* @Prototype */
{});

})
