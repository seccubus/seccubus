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
steal('funcunit',function(){

module("Seccubus.ConfigItem.List", { 
	setup: function(){
		S.open("//seccubus/config_item/list/list.html");
	}
});

test("check config_items", function(){

	// wait until Create ConfigItem link has been added
	S('a:contains(Create ConfigItem)').exists(function(){
		// set tests:
		ok(function(){ return $('h3:contains(Configuration file)').length},"Configuration file exists");
		ok(function(){ return $('h3:contains(Path modules)').length},"Path modules exists");
		ok(function(){ return $('h3:contains(Path scanners)').length},"Path scanners exists");
		ok(function(){ return $('h3:contains(Path bindir)').length},"Path bindir exists");
		ok(function(){ return $('h3:contains(Path configdir)').length},"Path configdir exists");
		ok(function(){ return $('h3:contains(Path dbdir)').length},"Path dbdir exists");
		ok(function(){ return $('h3:contains(Database login)').length},"Database login exists");
		ok(function(){ return $('h3:contains(Database structure)').length},"Database structure exists");
		ok(function(){ return $('h3:contains(Database version)').length},"Database version exists");
		ok(function(){ return $('h3:contains(HTTP authentication)').length},"HTTP authentication exists");
		ok(function(){ return $('h3:contains(SMTP configuration)').length},"SMTP configuration exists");
		S.confirm(true);
	});

	
});


});
