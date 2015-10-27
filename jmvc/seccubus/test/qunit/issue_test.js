/*
 * Copyright 2015 Frank Breedijk
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
 */steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/issue.js", function(){
	module("Model: Seccubus.Models.Issue")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Issue.findAll({}, function(issues){
			ok(issues)
	        ok(issues.length)
	        ok(issues[0].name)
	        ok(issues[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Issue({name: "dry cleaning", description: "take to street corner"}).save(function(issue){
			ok(issue);
	        ok(issue.id);
	        equals(issue.name,"dry cleaning")
	        issue.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Issue({name: "cook dinner", description: "chicken"}).
	            save(function(issue){
	            	equals(issue.description,"chicken");
	        		issue.update({description: "steak"},function(issue){
	        			equals(issue.description,"steak");
	        			issue.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Issue({name: "mow grass", description: "use riding mower"}).
	            destroy(function(issue){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})