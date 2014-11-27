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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/run.js", function(){
	module("Model: Seccubus.Models.Run")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Run.findAll({}, function(runs){
			ok(runs)
	        ok(runs.length)
	        ok(runs[0].name)
	        ok(runs[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Run({name: "dry cleaning", description: "take to street corner"}).save(function(run){
			ok(run);
	        ok(run.id);
	        equals(run.name,"dry cleaning")
	        run.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Run({name: "cook dinner", description: "chicken"}).
	            save(function(run){
	            	equals(run.description,"chicken");
	        		run.update({description: "steak"},function(run){
	        			equals(run.description,"steak");
	        			run.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Run({name: "mow grass", description: "use riding mower"}).
	            destroy(function(run){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
