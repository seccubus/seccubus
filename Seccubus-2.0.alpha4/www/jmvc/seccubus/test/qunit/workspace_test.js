module("Model: Seccubus.Models.Workspace")

asyncTest("findAll", function(){
	stop(2000);
	Seccubus.Models.Workspace.findAll({}, function(workspaces){
		ok(workspaces)
        ok(workspaces.length)
        ok(workspaces[0].name)
        ok(workspaces[0].description)
		start()
	});
	
})

asyncTest("create", function(){
	stop(2000);
	new Seccubus.Models.Workspace({name: "dry cleaning", description: "take to street corner"}).save(function(workspace){
		ok(workspace);
        ok(workspace.id);
        equals(workspace.name,"dry cleaning")
        workspace.destroy()
		start();
	})
})
asyncTest("update" , function(){
	stop();
	new Seccubus.Models.Workspace({name: "cook dinner", description: "chicken"}).
            save(function(workspace){
            	equals(workspace.description,"chicken");
        		workspace.update({description: "steak"},function(workspace){
        			equals(workspace.description,"steak");
        			workspace.destroy();
        			start()
        		})
            })

});
asyncTest("destroy", function(){
	stop(2000);
	new Seccubus.Models.Workspace({name: "mow grass", description: "use riding mower"}).
            destroy(function(workspace){
            	ok( true ,"Destroy called" )
            	start();
            })
})