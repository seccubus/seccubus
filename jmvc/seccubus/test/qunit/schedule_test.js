/*
 * Copyright 2015 Petr, Frank Breedijk
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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/schedule.js", function(){
	module("Model: Seccubus.Models.Schedule")
	
	test("findAll", function(){
		expect(9);
		stop();
		Seccubus.Models.Schedule.findAll({}, function(schedule){
			ok(schedule)
        	ok(schedule.length)
        	ok(schedule[0].id)
        	ok(schedule[0].month)
        	ok(schedule[0].week)
        	ok(schedule[0].day)
        	ok(schedule[0].wday)
        	ok(schedule[0].hour)
        	ok(schedule[0].min)
			start();
		});
		
	})
	
	test("create", function(){
		expect(10)
		stop();
		new Seccubus.Models.Schedule({
					enabled:"1",
					launch:"d",
					month: "1", 
					week: "2w",
					wday: "1",
					day: "3",
					hour: "5",
					min: "4",
					scanId:'1',
					workspace:"1"
				}).save(function(schedule){
					console.log("Scheule:",schedule);
					ok(schedule);
			        ok(schedule.id);
			        equals(schedule.enabled,"1")
			        equals(schedule.launch,"d")
			        equals(schedule.month,"1")
			        equals(schedule.week,"2w")
			        equals(schedule.wday,'1')
			        equals(schedule.day,"3")
			        equals(schedule.hour,"5")
			        equals(schedule.min,"4")
			        schedule.destroy();
					start();
		})
	})
	test("update" , function(){
		expect(7);
		stop();
		new Seccubus.Models.Schedule({
				id:20,
				enabled:"1",
				launch:"d",
				month: "1", 
				week: "w",
				wday: "1",
				day: "3",
				hour: "5",
				min: "4",
				scanId:'1',
				workspace:"1"
			}).
	            save(function(schedule){
	            	equals(schedule.enabled,"1")
			        equals(schedule.launch,"d")
	            	equals(schedule.month,"1")
			        equals(schedule.week,"w")
			        equals(schedule.wday,'1')
			        equals(schedule.day,"3")
			        equals(schedule.hour,"5")
			        equals(schedule.min,"4")
	        		schedule.update({min: "8"},function(schedule){
	        			equals(schedule.min,"8");
	        			schedule.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Schedule({month: "1", week: "2"}).
	            destroy(function(schedule){
	            	ok( true ,"Destroy called" )
					start();
	            })
	});
	
})
