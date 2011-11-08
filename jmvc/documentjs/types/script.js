steal.then(function() {
	var ignoreCheck = /\@documentjs-ignore/,
		commentReg = /\r?\n(\s*\*+)?/g,
		spaceReg = /\S/g;
	
	/**
	 * Represents a file.
	 * Breaks up file into comment and code parts.
	 * Creates new [DocumentJS.Pair | Doc.Pairs].
	 * @hide
	 */
	DocumentJS.Script = {
		
		// returns the min intented amount for these lines.
		minSpace : function(lines){
			var removeSpace = Infinity,
				noSpace = spaceReg,
				match;
				
			for ( l = 0; l < lines.length; l++ ) {
				match = noSpace.exec(lines[l]);
				if ( match && lines[l] && noSpace.lastIndex < removeSpace ) {
					removeSpace = noSpace.lastIndex;
				}
				noSpace.lastIndex = 0;
			}
			return removeSpace - 1;
		},
		// removes Indent inline
		removeIndent : function(lines){
			var removeSpace = this.minSpace(lines);
			
			if ( isFinite(removeSpace) ) {
				for ( l = 0; l < lines.length; l++ ) {

					lines[l] = lines[l].substr(removeSpace)
				}
			}
			return lines;
		},
		getCommentCodePairs : function(){
			
		},
		group: new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\[/]*[^\\n]*)", "g"),

		// (?:/\*+((?:[^*]|(?:\*+[^*/]))*)\*+/[^\w\{\(\[\"'\$]*([^\r\n]*))
		splitter: new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))"),

		/**
		 * Generates docs for a file.
		 * @param {Object} docScript an object that has src and text attributes.  It can also just be 
		 * the path of a file.
		 */
		process: function( docScript, objects ) {
			if(typeof docScript == 'string'){
				docScript = {src: docScript}
			}

			var source = docScript.text || readFile(docScript.src);
			
			//check if the source has @documentjs-ignore
			if (ignoreCheck.test(source) ) {
				return;
			}
			var script = {
					type: "script",
					name: docScript.src
				},
				scope = script,
				comments,
				type;
			
			print("  " + script.name);
			objects[script.name] = script;
			
			// handle markdown docs
			if(/\.md$/.test(docScript.src)){
				type = DocumentJS.Type.create(source, "", scope, objects, 'page', docScript.src.match(/([^\/]+)\.md$/)[1]  );
				if ( type ) {

					objects[type.name] = type;
					//get the new scope if you need it
					// if we don't have a type, assume we can have children
					scope = !type.type || DocumentJS.types[type.type].hasChildren ? type : scope;
					type.src = docScript.src;
				}
				return;
			}
			
			comments = this.getComments(source);
			
			//clean comments
			for(var i =0 ; i < comments.length; i++){
				var comment = comments[i];
				
				type = DocumentJS.Type.create(comment.comment, 
							comment.code, scope, objects);
				if ( type ) {
					objects[type.name] = type;
					//get the new scope if you need it
					// if we don't have a type, assume we can have children
					scope = !type.type || DocumentJS.types[type.type].hasChildren ? type : scope;
					
					type.src = docScript.src;
				}
			}
			

		},
		// 
		getComments : function(source){
			var pairs = source.match(this.group) || [],
				comments = [],
				len = pairs.length;
			//clean comments
			for ( var i = 0; i < len; i++ ) {
				var splits = pairs[i].match(this.splitter),
					comment = splits[1].replace(commentReg, '\n');

				//print(splits[1].replace(/^[^\w@]*/,''))
				var code = splits[2],
					lines = comment.split("\n");
				
				this.removeIndent(lines);
				comment = lines.join("\n");

				// probably want line numbers and such
				comments.push({
					comment: comment,
					code: code
				})
			}
			return comments;
		}
	};

	DocumentJS.Type("script", {
		useName: false,
		hasChildren: true
	})
})