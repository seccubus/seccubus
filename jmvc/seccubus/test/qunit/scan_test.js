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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/scan.js", function(){
	module("Model: Seccubus.Models.Scan")
	
	test("findAll", function(){
		expect(9);
		stop();
		Seccubus.Models.Scan.findAll({workspaceId:'1'}, function(scans){
				// console.log("scans",scans);
				ok(scans);
	        	ok(scans.length);
	        	ok(scans[0].workspace);
	        	ok(scans[0].name);
	        	ok(scans[0].scanner);
	        	ok(scans[0].parameters);
	        	ok(scans[0].targets);
	        	ok(scans[0].noFindings);
	        	ok(scans[0].lastScan);
			start();
		});
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Scan({name: "dry cleaning", description: "take to street corner"}).save(function(scan){
			ok(scan);
	        ok(scan.id);
	        equals(scan.name,"dry cleaning")
	        scan.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Scan({name: "cook dinner", description: "chicken"}).
	            save(function(scan){
	            	equals(scan.description,"chicken");
	        		scan.update({description: "steak"},function(scan){
	        			equals(scan.description,"steak");
	        			scan.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Scan({name: "mow grass", description: "use riding mower"}).
	            destroy(function(scan){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
