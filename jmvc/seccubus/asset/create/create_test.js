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

module("Seccubus.Asset.Create", { 
	setup: function(){
		S.open("//seccubus/asset/create/create.html");
	}
});

test("create asset", function(){
	S("input[name=name]").type("Ice Water");
	S("textarea[name=hosts]").type('127.0.0.1 192.168.0.1-12');
	S("input[name=recipients]").type("Recipient@res.test");
	S("[type=submit]").click();
	S('h3:contains(Ice Water)')
		.exists(function(){
			ok(true, "Ice Water added");
			S("button:contains(Cancel)").click();
			equals(S("[name=name]").val() , "", "form reset");
		})
});


});
