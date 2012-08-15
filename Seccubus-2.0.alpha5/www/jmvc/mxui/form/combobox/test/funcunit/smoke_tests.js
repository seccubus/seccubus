module("combobox test", { 
	setup: function(){
        S.open("//mxui/combobox/combobox.html");
	}
})


test("Test change is only called once.", function() {
	S("#expirationBehavior .mxui_combobox_select").click();
	S(".mxui_combobox_dropdown .dropdown_2").visible();
	S(".mxui_combobox_dropdown .dropdown_2").click();
	
	S("#populateItems").click(function(){
		equals("1", S('.change_count').text())
	});
});

test("Test clicking combobox view in text mode and verify the dropdown opens.", function() {
	S("#expirationBehavior .mxui_combobox_select").exists(function(){
		var val = S("#expirationBehavior input[type=text]").val();
		ok(/archive/.test(val), "Item #1 (archive) is selected by default.");	
		var hiddenVal = S("#expirationBehavior input[type=hidden]").val();
		ok(/0/.test(hiddenVal), "Hidden input has the correct value.");
	});

	
	
	// checks if dropdown is now visible	
	S("#expirationBehavior .mxui_combobox_select").click( function(){
		var display = S(".mxui_combobox_dropdown").css("display");
		ok(/block/.test(display), "Dropdown is visible.");	
	});
	
});

test("Test clicking item 2 and check it was selected.", function() {
	S(".mxui_combobox .mxui_combobox_select").click();
	
	S(".mxui_combobox_dropdown .dropdown_2").visible();
	
	S(".mxui_combobox_dropdown .dropdown_2").click(function(){
		// check delete (item #2) was selected
		ok(/delete/.test(S("#expirationBehavior input[type=text]").val()), "Item #2 was selected.");	
	});
			
});

test("Test that change event isn't triggered when combobox is loaded.", function() {
	S("#expirationBehavior .mxui_combobox_select").exists(function(){
		// check if the visible input gets the correct value
		ok( S("#log3").val() === "", "Change event was not triggered when combobox was loaded as expected.");	
	});
	

});

test("Test that change event is triggered when the combobox value is changed.", function() {
	S("#combobox_demo").exists(function(){
		 ok(/hola/.test(S("#combobox_demo input[type=text]").val()), 
		 	"Item #1 (hola) is selected by default.");	
		 
		 ok(/1/.test(S("#combobox_demo input[type=hidden]").val()), 
		 	"Hidden input has the correct value.");
	});
	
	
	// checks if dropdown is now visible	
	S("#combobox_demo input[type=text]").click();
	S(".mxui_combobox_dropdown").visible();	
	
		
	S(".mxui_combobox_dropdown .dropdown_3").exists();
	S(".mxui_combobox_dropdown .dropdown_3").click();
	
	S("#combobox_demo input[type=text]").val(/kansas/);
	
	S("#log3").text("6");
});

test("Testing populateItems.", function() {
	S("#ajax_demo").exists();
	S("#populateItems").exists();
	S("#populateItems").click();
	S("#ajax_demo_output").exists( function() {
		ok(/dir0,/.test(S("#ajax_demo_output").text()), "populateItems successfully called.");
	} );
});

/*
 * Make this test work
 *test("Test that if options.watermarkText is empty, a value is typed that doesn't exist and combobox is blurred then if the user clicks the combobox again the input box shows the previously typed text.", function() {
	S("#combobox_demo").exists();
	S("#combobox_demo input[type=text]").type("[ctrl]a[up]0");
	S("#log3").click();
	S("#combobox_demo input[type=text]").click();
	S("#combobox_demo input[type=text]").val("0");
})*/