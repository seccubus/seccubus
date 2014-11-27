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

module("Seccubus.Workspace.Table", { 
	setup: function(){
		S.open("//seccubus/workspace/table/table.html");
	}
});

test("edit workspace", function(){
	// S('#create').click()
	
	// wait until grilled cheese has been added
	S('a:contains(Create Workspace)').exists();
	// console.log(S('a.edit').length);
	S('a.edit:first-child').click();
	S('#editws input[name=name]').exists(function(){
		ok(S('#editws input[name=name]').length,"exist name");
		ok(S('#editws input[type=submit]').length,"exist submit button");
		ok(S('#editws input[value=Cancel]').length,"exist cancel button");
		
		S('#editws input[value=Cancel]').click();

	});
	
	S.confirm(true);
	// S('h3:last a').click();
	
	
	// S('h3:contains(Grilled Cheese)').missing(function(){
	// 	ok(true,"Grilled Cheese Removed")
	// });
	
});


});
