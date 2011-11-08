(function($){
/**
 * @add FuncUnit
 */
FuncUnit.
/**
 * Waits a timeout before running the next command.  Wait is an action and gets 
 * added to the queue.
 * @codestart
 * S.wait(100, function(){
 *   equals( S('#foo').innerWidth(), 100, "innerWidth is 100");
 * })
 * @codeend
 * @param {Number} [time] The timeout in milliseconds.  Defaults to 5000.
 * @param {Function} [callback] A callback that will run 
 * 		after the wait has completed, 
 * 		but before any more queued actions.
 */
wait = function(time, callback){
	if(typeof time == 'function'){
		callback = time;
		time = undefined;
	}
	time = time != null ? time : 5000
	FuncUnit.add({
		method : function(success, error){
			steal.dev.log("Waiting "+time)
			setTimeout(success, time)
		},
		callback : callback,
		error : "Couldn't wait!",
		timeout : time + 1000
	});
	return this;
}

FuncUnit.
/**
Uses 2 checker methods to see which success function to call.  This is a way to conditionally 
run one method if you're unsure about the conditions of your page, without causing a test 
failure.  For example, this is useful for login steps, if you're not sure whether the app 
is logged in.

    S.branch(function(){
    	return (S("#exists").size() > 0);
    }, function(){
    	ok(true, "found exists")
    }, function(){
    	return (S("#notexists").size() > 0);
    }, function(){
    	ok(false, "found notexists")
    });
    
@param check1 {Function} a checker function that, if it returns true, causes success1 to be called
@param success1 {Function} a function that runs when check1 returns true
@param check2 {Function} a checker function that, if it returns true, causes success2 to be called
@param success2 {Function} a function that runs when check2 returns true 
@param timeout {Number} if neither checker returns true before this timeout, the test fails
 */
branch = function(check1, success1, check2, success2, timeout){
	FuncUnit.repeat({
		method : function(print){
			print("Running a branch statement")
			if(check1()){
				success1();
				return true;
			}
			if(check2()){
				success2();
				return true;
			}
		},
		error : "no branch condition was ever true",
		timeout : timeout,
		type: "branch"
	})
}

/**
 * @function repeat
 * Takes a function that will be called over and over until it is successful.
 * method : function(){},
	callback : callback,
	error : errorMessage,
	timeout : timeout,
	bind: this
 */
FuncUnit.repeat = function(options){
	
	var interval,
		stopped = false	,
		stop = function(){
			clearTimeout(interval)
			stopped = true;
		};
	FuncUnit.add({
		method : function(success, error){
			options.bind = this.bind;
			options.selector = this.selector;
			var printed = false,
				print = function(msg){
					if(!printed){
						steal.dev.log(msg);
						printed = true;
					}
				}
			interval = setTimeout(function(){
				var result = null;
				try {
					result = options.method(print)
				} 
				catch (e) {
					//should we throw this too error?
				}
				
				if (result) {
					success(options.bind);
				}else if(!stopped){
					interval = setTimeout(arguments.callee, 10)
				}
				
			}, 10);
			
			
		},
		callback : options.callback,
		error : options.error,
		timeout : options.timeout,
		stop : stop,
		bind : options.bind,
		type: options.type
	});
	
}

/**
 * @Prototype
 */
$.extend(FuncUnit.prototype, {
	/**
	 * Waits until an element exists before running the next action.
	 * @codestart
	 * //waits until #foo exists before clicking it.
	 * S("#foo").exists().click()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action.
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	exists: function( callback ) {
		return this.size(function(size){
			return size > 0;
		}, callback);
	},
	/**
	 * Waits until no elements are matched by the selector.  Missing is equivalent to calling
	 * <code>.size(0, callback);</code>
	 * @codestart
	 * //waits until #foo leaves before continuing to the next action.
	 * S("#foo").missing()
	 * @codeend
	 * @param {Function} [callback] a callback that is run after the selector exists, but before the next action
	 * @return {FuncUnit} returns the funcUnit for chaining. 
	 */
	missing: function( callback ) {
		return this.size(0, callback)
	},
	/**
	 * Waits until the funcUnit selector is visible.  
	 * @codestart
	 * //waits until #foo is visible.
	 * S("#foo").visible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the funcUnit is visible, but before the next action.
	 * @return [funcUnit] returns the funcUnit for chaining.
	 */
	visible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		this.selector += ":visible"
		return this.size(function(size){
			return size > 0;
		}, function(){
			self.selector = sel;
			callback && callback.apply(this, arguments);
		})
		
	},
	/**
	 * Waits until the selector is invisible.  
	 * @codestart
	 * //waits until #foo is invisible.
	 * S("#foo").invisible()
	 * @codeend
	 * @param {Function} [callback] a callback that runs after the selector is invisible, but before the next action.
	 * @return [funcUnit] returns the funcUnit selector for chaining.
	 */
	invisible: function( callback ) {
		var self = this,
			sel = this.selector,
			ret;
		this.selector += ":visible"
		return this.size(0, function(){
			self.selector = sel;
			callback && callback.apply(this, arguments);
		})
	},
	/**
	 * Waits a timeout before calling the next action.  This is the same as
	 * [FuncUnit.prototype.wait].
	 * @param {Number} [timeout]
	 * @param {Object} callback
	 */
	wait: function( timeout, callback ) {
		FuncUnit.wait(timeout, callback)
		return this;
	},
	/**
	 * Calls the callback function after all previous asynchronous actions have completed.  Then
	 * is called with the funcunit object.
	 * @param {Object} callback
	 */
	then : function(callback){
		var self = this;
		FuncUnit.wait(0, function(){
			callback.call(this, this);
		});
		return this;
	}
})

})(window.jQuery || window.FuncUnit.jQuery)