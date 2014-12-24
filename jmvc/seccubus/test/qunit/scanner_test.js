/*
 * Copyright 2014 Frank Breedijk, Petr
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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/scanner.js", function(){
	module("Model: Seccubus.Scanner")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Scanner.findAll({}, function(scanners){
			ok(scanners)
	        ok(scanners.length)
	        ok(scanners[0].name)
	        ok(scanners[0].description)
			start();
		});
		
	})
	
	// test("create", function(){
	// 	expect(3)
	// 	stop();
	// 	new Seccubus.Scanner({name: "dry cleaning", description: "take to street corner"}).save(function(scanner){
	// 		ok(scanner);
	//         ok(scanner.id);
	//         equals(scanner.name,"dry cleaning")
	//         scanner.destroy()
	// 		start();
	// 	})
	// })
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Scanner({name: "cook dinner", description: "chicken"}).
	            save(function(scanner){
	            	equals(scanner.description,"chicken");
	        		scanner.update({description: "steak"},function(scanner){
	        			equals(scanner.description,"steak");
	        			scanner.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Scanner({name: "mow grass", description: "use riding mower"}).
	            destroy(function(scanner){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
