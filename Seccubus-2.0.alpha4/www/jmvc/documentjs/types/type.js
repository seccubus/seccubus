steal.then(function() {
	/**
	 * @class
	 * @tag documentation
	 * Keeps track of types of directives in DocumentJS.  
	 * Each type is added to the types array.
	 * @param {Object} type
	 * @param {Object} props
	 */
	DocumentJS.Type = function( type, props ) {
		DocumentJS.types[type] = props;
		props.type = type;
	}

	DocumentJS.extend(DocumentJS.Type,
	/**
	 * @Static
	 */
	{
		/**
		 * Must get type and name
		 * @param {String} comment
		 * @param {String} code
		 * @param {Object} scope
		 * @return {Object} type
		 */
		create: function( comment, code, scope ) {
			var check = comment.match(/^\s*@(\w+)/),
				type, props

				if (!(type = this.hasType(check ? check[1] : null))) { //try code
					type = this.guessType(code);
				}

				if (!type ) {
					return null;
				}

				var nameCheck = comment.match(/^\s*@(\w+)[ \t]+([\w\.\$]+)/m)

			
			props = type.code(code)
			
			if (!props && !nameCheck ) {
				return null;
			}

			if (!props ) {
				props = {};
			}
			if ( nameCheck && nameCheck[2] && nameCheck[1].toLowerCase() == type.type ) {
				props.name = nameCheck[2]
			}
			if ( type.init ) {
				return type.init(props, comment)
			}
			
			
			if ( !props.type ) {
				props.type = type.type;
			}
			if ( props.name ) {
				var parent = this.getParent(type, scope)
				//print("    p="+(parent ? parent.name+":"+parent.type : ""))
				//if we are adding to an unlinked parent, add parent's name
				if (!parent.type || DocumentJS.types[parent.type].useName ) {
					props.name = parent.name + "." + props.name
				}
				if(props.name === 'toString'){
					// can't have an empty toString
					return null;
				}
				props.parent = parent.name;
				if ( DocumentJS.objects[props.name] ) {
					var newProps = props;
					props = DocumentJS.objects[props.name];
					DocumentJS.extend(props, newProps);
				}
				if (!parent.children ) {
					parent.children = [];
				}
				parent.children.push(props.name)

				//objects[props.name] = props;
				this.process(props, comment, type)
				return props
			}
		},
		/**
		 * Get the type's parent
		 * @param {Object} type
		 * @param {Object} scope
		 * @return {Object} parent
		 */
		getParent: function( type, scope ) {
			if (!type.parent ) {
				return scope;
			}


			while ( scope && scope.type && !type.parent.test(scope.type) ) {

				scope = DocumentJS.objects[scope.parent];

			}
			return scope;
		},
		/**
		 * Checks if type processor is loaded
		 * @param {Object} type
		 * @return {Object} type
		 */
		hasType: function( type ) {
			if (!type ) return null;

			return DocumentJS.types.hasOwnProperty(type.toLowerCase()) ? DocumentJS.types[type.toLowerCase()] : null;
		},
		/**
		 * Guess type from code
		 * @param {String} code
		 * @return {Object} type
		 */
		guessType: function( code ) {
			for ( var type in DocumentJS.types ) {
				if ( DocumentJS.types[type].codeMatch && DocumentJS.types[type].codeMatch(code) ) {
					return DocumentJS.types[type];
				}

			}
			return null;
		},
		suggestType : function(incorrect, line){
			var lowest = 1000, 
				suggest = "",
				check = function(things){
					for(var name in things){
						var dist = DocumentJS.distance(incorrect.toLowerCase(),name.toLowerCase())
						if(dist < lowest ){
							lowest = dist
							suggest = name.toLowerCase()
						} 
					}
				}
			check(DocumentJS.types);
			check(DocumentJS.tags);
			
			if(suggest){
				print("\nWarning!!\nThere is no @"+incorrect+" directive. did you mean @"+suggest+" ?\n")
			}
		},
		matchTag: /^\s*@(\w+)/,
		/**
		 * Process comments
		 * @param {Object} props
		 * @param {String} comment
		 * @param {Object} type
		 */
		process: function( props, comment, type ) {
			var i = 0,
				lines = comment.split("\n"),
				typeDataStack = [],
				curType, lastType, curData, lastData, defaultWrite = 'comment',
				messages = []; //what data we are going to be called with
			if ( !props.comment ) {
				props[defaultWrite] = '';
			}
			for ( var l = 0; l < lines.length; l++ ) {
				var line = lines[l],
					match = line.match(this.matchTag);

					if ( match ) {
						match[1] = match[1].toLowerCase();
						var curType = DocumentJS.tags[match[1]];



						if (!curType ) {
							if(!DocumentJS.types[match[1].toLowerCase()]){
								this.suggestType(match[1])
							}
							
							if (!DocumentJS.types[match[1]] ) {
								props.comment += line + "\n"
							}

							continue;
						} else {
							curType.type = match[1];
						}
						messages.push(match[1])
						curData = curType.add.call(props, line, curData);

						//horrible ... fix
						if ( curData && curData.length == 2 && curData[0] == 'push' ) { //
							typeDataStack.push({
								type: lastType,
								data: lastData
							})
							curData = curData[1];
							lastType = curType;
						}
						else if ( curData && curData.length == 2 && curData[0] == 'pop' ) {
							var last = typeDataStack.pop();

							if ( last && last.type ) {
								last.type.addMore.call(props, curData[1], last.data);
							} else {
								props[defaultWrite] += "\n" + curData[1]
							}

							lastData = curData = last.data;
							lastType = curType = last.type;
						} else if ( curData && curData.length == 2 && curData[0] == 'default' ) {
							defaultWrite = curData[1];
						}
						else if ( curData ) {
							lastType = curType;
							lastData = curData;
						}
						else {
							//this._last = null;
							lastType = null;
						}


					}
					else {

						//clean up @@abc becomes @abc
						line = line.replace(/@@/g, "@");

						if ( lastType ) {
							lastType.addMore.call(props, line, curData)
						} else {
							props[defaultWrite] += line + "\n"
						}
					}
			}
			

			try {
				props.comment = DocumentJS.converter.makeHtml(props.comment);
				//allow post processing
				for(var tag in DocumentJS.tags){
					if(DocumentJS.tags[tag].done){
						DocumentJS.tags[tag].done.call(props);
					}
				}
				
			} catch (e) {
				print("Error with converting to markdown")
			}

		}
	});
})