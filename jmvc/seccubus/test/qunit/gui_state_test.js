steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/gui_state.js", function(){
	module("Model: Seccubus.GuiState")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.GuiState.findAll({}, function(gui_states){
			ok(gui_states)
	        ok(gui_states.length)
	        ok(gui_states[0].name)
	        ok(gui_states[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.GuiState({name: "dry cleaning", description: "take to street corner"}).save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
	        equals(gui_state.name,"dry cleaning")
	        gui_state.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.GuiState({name: "cook dinner", description: "chicken"}).
	            save(function(gui_state){
	            	equals(gui_state.description,"chicken");
	        		gui_state.update({description: "steak"},function(gui_state){
	        			equals(gui_state.description,"steak");
	        			gui_state.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.GuiState({name: "mow grass", description: "use riding mower"}).
	            destroy(function(gui_state){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})