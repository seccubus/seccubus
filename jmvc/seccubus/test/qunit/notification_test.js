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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/notification.js", function(){
	module("Model: Seccubus.Models.Notification")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Notification.findAll({}, function(notifications){
			ok(notifications)
	        ok(notifications.length)
	        ok(notifications[0].name)
	        ok(notifications[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Notification({name: "dry cleaning", description: "take to street corner"}).save(function(notification){
			ok(notification);
	        ok(notification.id);
	        equals(notification.name,"dry cleaning")
	        notification.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Notification({name: "cook dinner", description: "chicken"}).
	            save(function(notification){
	            	equals(notification.description,"chicken");
	        		notification.update({description: "steak"},function(notification){
	        			equals(notification.description,"steak");
	        			notification.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Notification({name: "mow grass", description: "use riding mower"}).
	            destroy(function(notification){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
