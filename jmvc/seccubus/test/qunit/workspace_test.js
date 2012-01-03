steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/workspace.js", function(){
	module("Model: Seccubus.Models.Workspace")
	
	test("findAll", function(){
		expect(7);
		stop();
		Seccubus.Models.Workspace.findAll({}, function(workspaces){
			ok(workspaces)
		        ok(workspaces.length)
		        ok(workspaces[0].id)
		        ok(workspaces[0].name)
		        ok(workspaces[0].findCount)
		        ok(workspaces[0].scanCount)
		        ok(workspaces[0].lastScan)
			start();
		});
		
	})
	
	test("create", function(){
		expect(0)
		stop();
		new Seccubus.Models.Workspace({name: "dry cleaning", description: "take to street corner"}).save(function(workspace){
			ok(workspace);
	        ok(workspace.id);
	        equals(workspace.name,"dry cleaning")
	        workspace.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(0);
		stop();
		new Seccubus.Models.Workspace({name: "cook dinner", description: "chicken"}).
	            save(function(workspace){
	            	equals(workspace.description,"chicken");
	        		workspace.update({description: "steak"},function(workspace){
	        			equals(workspace.description,"steak");
	        			workspace.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(0);
		stop();
		new Seccubus.Models.Workspace({name: "mow grass", description: "use riding mower"}).
	            destroy(function(workspace){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
