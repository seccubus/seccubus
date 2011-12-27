steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/finding.js", function(){
	module("Model: Seccubus.Models.Finding")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Finding.findAll({}, function(findings){
			ok(findings)
	        ok(findings.length)
	        ok(findings[0].name)
	        ok(findings[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(0)
		stop();
		new Seccubus.Models.Finding({name: "dry cleaning", description: "take to street corner"}).save(function(finding){
			ok(finding);
	        ok(finding.id);
	        equals(finding.name,"dry cleaning")
	        finding.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(0);
		stop();
		new Seccubus.Models.Finding({name: "cook dinner", description: "chicken"}).
	            save(function(finding){
	            	equals(finding.description,"chicken");
	        		finding.update({description: "steak"},function(finding){
	        			equals(finding.description,"steak");
	        			finding.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(0);
		stop();
		new Seccubus.Models.Finding({name: "mow grass", description: "use riding mower"}).
	            destroy(function(finding){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
