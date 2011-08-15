module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning6d.html");
	}
})

/*
 *  6. Combobox positioning tests - Combobox appended to scrollable element:
 *  
 *  6a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  6b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  6c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  6d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  6e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  6d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, 
 *  the dropdown opens to fit space avaialble above   
 */
test("6d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above", function() {
	
	S("#combobox6d").exists();
	
	S("#combobox6d").visible();	
	
	var comboOffset = S("#combobox6d").offset(),
		comboTop = comboOffset.top,
		containerTop = S("#container").offset().top;
		
	S("#combobox6d").find("input[type=text]").click();
	
	S("#combobox6d_dropdown").visible();
			
	// make sure the dropdown position is right	
	S("#combobox6d_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(dropTop - containerTop) <= 1;
	});
	
});


