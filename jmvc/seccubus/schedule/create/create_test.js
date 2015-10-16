/*
 * Copyright 2014 Petr, Frank Breedijk
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

module("Seccubus.Schedule.Create", { 
	setup: function(){
		S.open("//seccubus/schedule/create/create.html");
	}
});

test("create schedule", function(){
	S("select[name=month] option[value=1]").click();
	S("select[name=week] option[value=2]").click();
	S("select[name=wday] option[value=4]").click();
	S("select[name=day]  option[value=2]").click();
	S("select[name=hour] option[value=5]").click();
	S("select[name=min] option[value=3]").click();
	S("[type=submit]").click();
	ok(true, "new input added");
	S('h3:contains(5)').exists(function(){
		S("button:contains(Cancel)").click();
		equals(S("select[name=month]").val() , null, "month");
		equals(S("select[name=wday]").val() , null, "week");
		equals(S("select[name=wday]").val() , null, "wday");
		equals(S("select[name=day]").val() , null, "day");
		equals(S("select[name=hour]").val() , null, "hour");
		equals(S("select[name=min]").val() , null, "min");
	});
	
});


});
