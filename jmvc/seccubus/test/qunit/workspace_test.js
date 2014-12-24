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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/workspace.js", function(){
	module("Model: Seccubus.Models.Workspace")
	
	test("findAll", function(){
		expect(7);
		stop();
		Seccubus.Models.Workspace.findAll({}, function(workspaces){
				ok(workspaces)
		        ok(workspaces.length)
		        ok(workspaces[0].id)
		        ok(workspaces[0].name)
		        ok(workspaces[0].findCount)
		        ok(workspaces[0].scanCount)
		        ok(workspaces[0].lastScan)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Workspace({name: "dry cleaning", description: "take to street corner"}).save(function(workspace){
			ok(workspace);
	        ok(workspace.id);
	        equals(workspace.name,"dry cleaning")
	        workspace.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Workspace({name: "cook dinner", description: "chicken"}).
	            save(function(workspace){
	            	equals(workspace.description,"chicken");
	        		workspace.update({description: "steak"},function(workspace){
	        			equals(workspace.description,"steak");
	        			workspace.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Workspace({name: "mow grass", description: "use riding mower"}).
	            destroy(function(workspace){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
