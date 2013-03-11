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
steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/config_item.js", function(){
	module("Model: Seccubus.Models.ConfigItem")
	
	test("findAll", function(){
		expect(5);
		stop();
		Seccubus.Models.ConfigItem.findAll({}, function(config_items){
			ok(config_items);
	        	ok(config_items.length);
	        	ok(config_items[0].name);
	        	ok(config_items[0].result);
	        	ok(config_items[0].message);
			start();
		});
		
	})
})
