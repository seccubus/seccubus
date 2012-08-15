steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/finding.js", function(){
	module("Model: Seccubus.Models.Finding")
	
	test("findAll with workspace", function(){
		expect(14);
		stop();
		Seccubus.Models.Finding.findAll({}, function(findings){
			ok(findings)
	        	ok(findings.length)
	        	ok(findings[0].id)
	        	ok(findings[0].host)
	        	ok(findings[0].hostName)
	        	ok(findings[0].port)
	        	ok(findings[0].plugin)
	        	ok(findings[0].find)
	        	ok(findings[0].remark)
	        	ok(findings[0].severity)
	        	ok(findings[0].severityName)
	        	ok(findings[0].status)
	        	ok(findings[0].statusName)
	        	ok(findings[0].scanId)
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
