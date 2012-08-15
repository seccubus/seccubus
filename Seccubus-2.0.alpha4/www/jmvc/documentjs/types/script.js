steal.then(function() {
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
				noSpace = /\S/g,
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
		process: function( docScript ) {
			if(typeof docScript == 'string'){
				docScript = {src: docScript}
			}

			var source = docScript.text || readFile(docScript.src);
			
			//check if the source has @documentjs-ignore
			if (/\@documentjs-ignore/.test(source) ) {
				return;
			}
			var script = {
				type: "script",
				name: docScript.src
			}
			print("  " + script.name);
			DocumentJS.objects[script.name] = script;
			var pairs = source.match(this.group);
			//clean comments
			var scope = script;
			if (!pairs ) return;
			for ( var i = 0; i < pairs.length; i++ ) {
				var splits = pairs[i].match(this.splitter),
					comment = splits[1].replace(/\r?\n(\s*\*+)?/g, '\n');

				//print(splits[1].replace(/^[^\w@]*/,''))
				var code = splits[2],
					lines = comment.split("\n");
					this.removeIndent(lines);
					//print(removeSpace)
					comment = lines.join("\n")

					var type = DocumentJS.Type.create(comment, code, scope, DocumentJS.objects);

				if ( type ) {

					DocumentJS.objects[type.name] = type;
					//get the new scope if you need it
					// if we don't have a type, assume we can have children
					scope = !type.type || DocumentJS.types[type.type].hasChildren ? type : scope;
				}

			}

		}
	};

	DocumentJS.Type("script", {
		useName: false,
		hasChildren: true
	})
})