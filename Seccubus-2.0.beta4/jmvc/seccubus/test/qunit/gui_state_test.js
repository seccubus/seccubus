steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/gui_state.js", function(){
	module("Model: Seccubus.GuiState")
	
	test("create default", function(){
		expect(4)
		stop();
		new Seccubus.GuiState().save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
		// Default findStatus = 1
	        equals(gui_state.findStatus,1)
		// Default workspace = -1
		equals(gui_state.workspace, -1)
	        gui_state.destroy()
			start();
		})
	});

	test("create findStatus fraction", function(){
		expect(3)
		stop();
		new Seccubus.GuiState({findStatus : 0.5}).save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
	        equals(gui_state.findStatus,1)
	        gui_state.destroy()
			start();
		})
	});

	test("set findStatus fraction", function(){
		expect(3)
		stop();
		new Seccubus.GuiState().save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
		gui_state.attr("findStatus",3.5);
	        equals(gui_state.findStatus,3)
	        gui_state.destroy()
			start();
		})
	});

	test("set findStatus fraction too_low", function(){
		expect(3)
		stop();
		new Seccubus.GuiState().save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
		gui_state.attr("findStatus",0.5);
	        equals(gui_state.findStatus,1)
	        gui_state.destroy()
			start();
		})
	});

	test("create findStatus too_low", function(){
		expect(3)
		stop();
		new Seccubus.GuiState({findStatus : 0}).save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
	        equals(gui_state.findStatus,1)
	        gui_state.destroy()
			start();
		})
	});

	test("create findStatus too_high", function(){
		expect(3)
		stop();
		new Seccubus.GuiState({findStatus : 999}).save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
	        equals(gui_state.findStatus,1)
	        gui_state.destroy()
			start();
		})
	});

	test("create findStatus Ignore", function(){
		expect(3)
		stop();
		new Seccubus.GuiState({findStatus : 99}).save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
	        equals(gui_state.findStatus,99)
	        gui_state.destroy()
			start();
		})
	});

	test("is scans cleared", function(){
		expect(5)
		stop();
		new Seccubus.GuiState().save(function(gui_state){
			ok(gui_state);
	        ok(gui_state.id);
		gui_state.scans = [1];
	        equals(gui_state.scans[0],1)
		gui_state.attr("workspace",-1);
	        equals(gui_state.scans[0],1)
		gui_state.attr("workspace",3);
	        equals(gui_state.scans,null)
	        gui_state.destroy()
			start();
		})
	});
})
