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

module("Seccubus.Scan.Create", { 
	setup: function(){
		S.open("//seccubus/scan/create/create.html");
	}
});

test("create scans", function(){
	S("[name=name]").type("Ice Water");
	S("[name=parameters]").type('Parameters');
	S("[name=targets]").type('127.0.0.1 192.168.0.1');
	S("select[name=scanner] option[value=Medusa]").click();
	S("[name=password]").type("Password");
	S("[type=submit]").click();
	S('h3:contains(Ice Water)')
		.exists(function(){
			ok(true, "Ice Water added");
			equals(S("[name=name]").val() , "", "form reset");
			// equals(S("[name=description]").val() , "", "form reset");
		})
});


});
