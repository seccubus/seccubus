/*
 * Copyright 2014 Петр, Frank Breedijk
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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/asset.js", function(){
	module("Model: Seccubus.Models.Asset")
	
	test("findAll", function(){
		expect(8);
		stop();
		Seccubus.Models.Asset.findAll({}, function(asset){
			ok(asset)
        	ok(asset.length)
        	ok(asset[0].id)
        	ok(asset[0].name)
        	ok(asset[0].hosts)
        	ok(asset[0].recipients)
        	ok(asset[0].recipientsHtml)
        	ok(asset[0].workspace)
			start();
		});
		
	})
	
	test("create", function(){
		expect(6)
		stop();
		new Seccubus.Models.Asset({
					name: "dry cleaning", 
					hosts: "192.168.0.1, 192.168.0.2",
					recipients: "test@test",
					workspace:"1"
				}).save(function(asset){
					console.log("Asset:",asset);
			ok(asset);
	        ok(asset.id);
	        equals(asset.name,"dry cleaning")
	        equals(asset.hosts,"192.168.0.1, 192.168.0.2")
	        equals(asset.recipients,"test@test")
	        equals(asset.workspace,"1")
	        asset.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(4);
		stop();
		new Seccubus.Models.Asset({
				id:20,
				name: "chicken", 
				hosts: "192.168.0.1, 192.168.0.2",
				recipients: "test@test",
			}).
	            save(function(asset){
	            	equals(asset.name,"chicken");
	            	equals(asset.hosts,"192.168.0.1, 192.168.0.2");
	            	equals(asset.recipients,"test@test");
	        		asset.update({recipients: "test@test2"},function(asset){
	        			equals(asset.recipients,"test@test2");
	        			asset.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Finding({name: "mow grass", description: "use riding mower"}).
	            destroy(function(finding){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
