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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/event.js", function(){
	module("Model: Seccubus.Models.Event")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Event.findAll({}, function(events){
			ok(events)
	        ok(events.length)
	        ok(events[0].name)
	        ok(events[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Event({name: "dry cleaning", description: "take to street corner"}).save(function(event){
			ok(event);
	        ok(event.id);
	        equals(event.name,"dry cleaning")
	        event.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Event({name: "cook dinner", description: "chicken"}).
	            save(function(event){
	            	equals(event.description,"chicken");
	        		event.update({description: "steak"},function(event){
	        			equals(event.description,"steak");
	        			event.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Event({name: "mow grass", description: "use riding mower"}).
	            destroy(function(event){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
