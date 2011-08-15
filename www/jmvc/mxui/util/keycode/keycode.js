steal('jquery').then(function(){
	
	/**
	 * Call like $.keycode(ev, "enter")
	 * Returns true if the key pressed was "enter"
	 * @param {Object} event
	 */
	$.keycode = function(event){
		var types = $.makeArray(arguments);
		var event = types.shift();
		var name = $.keyname(event);

		for(var i=0; i < types.length;i++){
			
			if(types[i] ===  name){
				return true;
			}
		}
		return false;
	}
	$.keycode.isNavigation = function(event){
		
	}
	
	$.keycode.keycodes = {
		'backspace':'8','tab':'9','enter':'13','shift':'16','ctrl':'17','alt':'18','space':'32',
		'pause/break':'19','pause':'19','break':'19','caps lock':'20','escape':'27','page up':'33','page down':'34','end':'35',
		'home':'36','left':'37','up':'38','right':'39','down':'40','insert':'45',
		'delete':'46',
		'0':'48','1':'49','2':'50','3':'51','4':'52','5':'53','6':'54','7':'55','8':'56','9':'57',
		'a':'65','b':'66','c':'67','d':'68','e':'69','f':'70','g':'71','h':'72','i':'73','j':'74','k':'75','l':'76','m':'77',
		'n':'78','o':'79','p':'80','q':'81','r':'82','s':'83','t':'84','u':'85','v':'86','w':'87','x':'88','y':'89','z':'90',
		'left window key':'91','right window key':'92','select key':'93',
		//numpad
		'0':'96','1':'97','2':'98','3':'99','4':'100','5':'101','6':'102','7':'103','8':'104','9':'105',
		'*':'106','+':'107','-':'109','.':'110',
		'/':'111',
		'f1':'112','f2':'113','f3':'114','f4':'115','f5':'116','f6':'117','f7':'118','f8':'119','f9':'120','f10':'121','f11':'122','f12':'123',
		'num lock':'144','scroll lock':'145',
		';':'186',
		'=':'187',
		',':'188',
		'-':'189',
		'.':'190',
		'/':'191',
		'`':'192',
		'[':'219',
		'\\':'220',
		']':'221',
		"'":'222'
	};
	$.keycode.reverseKeycodes = {};
	for(var name in $.keycode.keycodes){
		$.keycode.reverseKeycodes[$.keycode.keycodes[name]] = name;
	}
	
	$.keyname  = function(event){
		var keycode;
	
		//if IE
		if ($.browser.msie){
			if (event.type == 'keypress'){
				return event.keyCode ? String.fromCharCode(event.keyCode) : String.fromCharCode(event.which)
			} else if (event.type == 'keydown') {
				// IE only recognizes the backspace and delete keys in the keydown event, not keypress
				keycode = $.keycode.reverseKeycodes[event.keyCode];
				
				if (keycode === 'backspace' || keycode === 'delete'){
					return keycode;
				}
			}
		}
		
		
		if (!event.keyCode && event.which) {
			return String.fromCharCode(event.which)
		}

		return $.keycode.reverseKeycodes[event.keyCode+""] 
	}
	
})