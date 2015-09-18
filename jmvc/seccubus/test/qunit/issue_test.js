steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/issue.js", function(){
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