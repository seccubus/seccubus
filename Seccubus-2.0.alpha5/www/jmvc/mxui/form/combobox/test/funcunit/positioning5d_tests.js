module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning5d.html");
	}
})

/*
 *  5. Combobox positioning tests - Combobox appended to positioned element:
 *  
 *  5a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  5b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  5c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  5d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  5e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  5d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, 
 *  the dropdown opens to fit space avaialble above   
 */
test("5d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above", function() {
	
	S("#combobox5d").exists();
	
	S("#combobox5d").visible();	
	
	var comboOffset = S("#combobox5d").offset(),
		comboTop = comboOffset.top;
		
	S("#combobox5d").find("input[type=text]").click();
	
	S("#combobox5d_dropdown").visible();
			
	// make sure the dropdown position is right	
	S("#combobox5d_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(dropTop) < 1;
	});
	
});


