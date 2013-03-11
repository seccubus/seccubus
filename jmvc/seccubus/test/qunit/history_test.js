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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/history.js", function(){
	module("Model: Seccubus.Models.History")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.History.findAll({}, function(histories){
			ok(histories)
	        ok(histories.length)
	        ok(histories[0].name)
	        ok(histories[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.History({name: "dry cleaning", description: "take to street corner"}).save(function(history){
			ok(history);
	        ok(history.id);
	        equals(history.name,"dry cleaning")
	        history.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.History({name: "cook dinner", description: "chicken"}).
	            save(function(history){
	            	equals(history.description,"chicken");
	        		history.update({description: "steak"},function(history){
	        			equals(history.description,"steak");
	        			history.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.History({name: "mow grass", description: "use riding mower"}).
	            destroy(function(history){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
