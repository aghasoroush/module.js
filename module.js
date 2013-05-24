/*!
 * moduleJs Library v1.9.1
 * https://github.com/aghasoroush/moduolejs
 *
 * Copyright 2013 Soroush Khosravi
 * Released under the MIT license
 */

 
var regExp = {
	trim: /^\s+|\s+$/g,
	rtrim: /^\s+/,
	ltrim: /\s+$/
},

moduleJs = function(nameSpace, addonsToLoad) {
	if (typeof addonsToLoad == "undefined") {
		return new moduleJs.core.getNs(nameSpace);
	}
	return new moduleJs.core.loader(nameSpace, addonsToLoad);
};

moduleJs.core = moduleJs.prototype = {
	plugins : [],
	loader : function(namespace, requestedPlugings) {
		moduleJs.nameSpaces = moduleJs.nameSpaces || {};
		var ns = new Object();
		var libs = [];
		//bind modules to the namespace
		if (typeof requestedPlugings === "string") {
			requestedPlugings = moduleJs.trim(requestedPlugings);
			
			if (requestedPlugings == "*") {
				for (var moduleId in moduleJs.modules) {
					libs.push(moduleId);
				}
			} else {
				if (moduleJs.modules[requestedPlugings]) {
					libs.push(requestedPlugings);
				}
			}
		} else if (moduleJs.isArray(requestedPlugings)) {
			moduleJs.foreach(moduleJs.modules, function(moduleName) {
				if (moduleJs.inArray(moduleName, requestedPlugings)) {
					libs.push(moduleName);
				}
			});
		}
		
		//load modules
		for (var moduleIndex in libs) {
			var moduleName = libs[moduleIndex];
			if (moduleJs.modules[moduleName] && !ns[moduleName]) {
				moduleJs.modules[moduleName].execute();
				var obj = new Object();
				obj[moduleName] = moduleJs.modules[moduleName];
				moduleJs.extend(obj, ns);
			}
		}
		
		moduleJs.nameSpaces[namespace] = ns;
		
		var load = function(callback) {
			if (typeof callback === "function") {
				callback.apply(ns, [ns]);
			}
		};
		// badan bayad namespace ro ham set konam

		return {
			load : load
		};
	},
	
	//gets a namespace if it is defined
	getNs: function(nsName) {
		
		var get = function() {
			return moduleJs.nameSpaces[nsName] ? moduleJs.nameSpaces[nsName] : undefined;
		},
		remove = function() {
			if (moduleJs.nameSpaces[nsName]) {
				delete moduleJs.nameSpaces[nsName];
			}
		};
		
		return {
			get: get,
			remove: remove
		};
	}
};
moduleJs.core.loader.prototype = moduleJs.core;

//Special thanks to jQuery...
moduleJs.extend = moduleJs.core.extend = function() {
	var args = arguments;
	if (args[0]) {
		if (typeof args[0] === "object") {
			// we should loop throw it to extend all of item inside it

			var dest = false;
			
			if (args[1]) {
				for ( var item in args[0]) {
					args[1][item] = args[0][item];// copy to the destination
				}
			}
			
		} else if (typeof args[0] === "string" && 
				typeof args[1] === "function" && 
				typeof args[2] == "object") {
			args[2][args[0]] = args[1];
		}
	}

	return moduleJs;
};



moduleJs.extend({
	//check the existence of a needle on a haystack
	inArray : function(needle, haystack) {
		var length = haystack.length;
		for ( var i = 0; i < length; i++)
			if (haystack[i] == needle)
				return true;
		return false;
	},
	
	isArray: function(obj) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	},
	
	/**
	 * moduleJs.trim(" Hi there   ") -> "Hi There"
	 * moduleJs.trim(" Hi there   ", "ltrim") -> " Hi There"
	 * moduleJs.trim(" Hi there   ", "rtrim") -> "Hi There   "
 	 * @param {string} str
 	 * @param {string} type
 	 * @return {string}
	 */
	trim: function(str, type) {
		var ret = str;
		var pattern = typeof type !== "undefined" ? (regExp[type] ? regExp[type] : null) : null
		if (pattern !== null) {
			ret = str.replace(pattern, '');
		} else {
			ret = str.replace(regExp['trim'], '');
		}
		return ret;
	},
	
	
	foreach: function(obj, callback) {
		if (typeof callback == "function") {
			if (moduleJs.isArray(obj)) {
				for (i = 0; i < obj.length; i++) {
					if (callback.call(obj[i], i, obj[i]) === false) {
						break;//break if the call result is a breaker
					}
				}
			} else {
				for (var i in obj) {
					if (callback.apply(obj[i], [i, obj[i]]) === false ) {
						break;//Alternatively we can use a null return
					}
				}
			}
		}
		return this;
	},
	
	arrayKeyValue: function(data, type){
		type = type || "key";
		var ret = [];
		moduleJs.foreach(data, function(key, value){
			ret.push(type == "key" ? key : value);
		});
		return ret;
	},
	
	arrayKeys: function(data) {
		return moduleJs.arrayKeyValue(data, "key");
	},
	
	arrayValues: function(data) {
		return moduleJs.arrayKeyValue(data, "values");
	},
	
	//module structure
	module: function(options) {
		moduleJs.modules = moduleJs.modules || {};
		var extend = function() {
			if (!options.moduleName) {
				return false;
			}
			
			moduleJs.extend({
				defaults: {},
				init: options.init || (function() {}),
				get: function(key) {
					return options.defaults[key] || null;
				},
				set: function(opts) {
					moduleJs.foreach(opts, function(i, k) {
						options.defaults[i] = k;
					});
				},
				// #todo complete this method
				addMethod: function(options) {
					
				},
				//it calls by the system
				execute: function() {
					if (this.init && typeof this.init === "function") {
						this.init.call(options);
					}
					return options;
				}
			}, options);
			
			moduleJs.modules[options.moduleName] = options;
			
			return true;
		};
		
		return {
			extend: extend,
			
			unset: function() {
				if (options.moduleName) {
					if (moduleJs.modules[options.moduleName]) {
						delete moduleJs.modules[options.moduleName];
					}
				}
				return this;
			}
		}
	}
}, moduleJs);
