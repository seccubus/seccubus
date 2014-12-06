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
	module("Seccubus.Asset.Table", { 
		setup: function(){
			S.open("//seccubus/asset/table/table.html");
		}
	});


	test("list asset", function(){
		S("#assets td").exists();
		S("#assets tr:first-child td a.edit").click();
		S('#editas input[type=submit]').exists(function(){
			ok(true,"edit form opened");
			ok(S('#editas input[name=name]').length,"exist name");
			ok(S('#editas textarea[name=hosts]').length,"exists hosts");
			ok(S('#editas input[name=recipients]').length,"exist recipients");
			ok(S('#editas input[type=submit]').length,"exist submit button");
			ok(S('#editas button:contains(Cancel)').length,"exist cancel button");
			S('#editas input[name=name]').click().type("[delete]Test",function(){
				S('#editas textarea[name=hosts]').click().type("\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b123.24.45.56-12",function(){
					S('#editas input[name=recipients]').click().type("test@recipient.testVal",function(){
						S('#editas input[type=submit]').click();
						S('#editas input[type=submit]').val("Update",function(){
							var tds = S("#assets tr:first-child td");
							ok(S(tds[0]).html("Test"),"Name updated");
							ok(S(tds[1]).html('<a href="mailto:test@recipient.testVal">test@recipient.testVal</a>'),"Email updated");
							ok(S(tds[2]).html("123.24.45.56-12"),"Hosts updated");
							var trsLength = S('#assets tr').length;
							S("#create").click(function(){
								S("#assets tr:nth-child("+trsLength+") td:first-child:contains(Asset)").exists(function(){
									console.log("length:",trsLength, S('#assets tr').length,S("#create").html());
									ok((trsLength<S('#assets tr').length),"Created asset");
									S("#assets tr:last-child td:last a.destroy").click();
									S("#assets tr:nth-child("+trsLength+")").missing(function(){
										ok((trsLength==S('#assets tr').length),"Deleted asset");
									});
									
								});
								
							});
						});
						S.confirm(true);
					});
				});	
			});
		});
	});
});
