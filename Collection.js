
if(typeof require === "function"){
	var Types = require("./Types.js");
	var Utils = require("./Utils.js");
};

(function(exports, Types, Utils){

	exports.new = function(io){
		return new exports.Collection(io);
	}
	
	exports.Collection = function(io){
		var _data = [];
		this.io = io;
		this._data = function(){
			return _data;
		};
	};
	
	exports.Collection.prototype = {			
		save: function(record){
			var data = this._data();
			if(record._id){
				for(var i=0, length=data.length; i<length; i++){
					if(data[i]._id == record._id){
						data.splice(i ,1);
						break;
					}
				}
			}
			else{
				record._id = ObjectId();
			}
			this._data().push(record);
		},
		
		remove: function(criterias){
			var records = this.find(criterias)
			var data = this._data();
			for(var i=records.length; i>=0; i--){
				data.indexOf(records[i]);
				data.splice(i, 1);					
			}
		},
		
		update: function(query, update, options){
			var records = this.find(criterias);
		},
		
		
		find: function(criterias, projection){
			//http://docs.mongodb.org/manual/reference/operator/query/
			var context = {};
			var result = this._data().filter(this.createFilterFunc(criterias, context));
			projection = projection || {};
			result = result.map(this.createMapFunc(projection, context));
			return (this.io) ? this.io.output(result) : result;
		},

		createFilterFunc: function (criterias, context){
			context.matchedAryEle = new Map();
			function filterFun(item, index, ary, cris){
				if(cris === undefined)
					cris = criterias;
					
				continueNextKey:
				for(var key in cris){
					var temp = item;
					var opt = Utils.filters[key];
					if(opt){
						if(opt(temp, cris[key], filterFun)) 
							continue
						else
							return false;
					}
					
					var value = cris[key];
					if(key.indexOf('.')==-1){
						var nextkey = "";
					}
					else{
						var nextkey = key.substring(key.indexOf('.')+1);
						var key = key.substring(0, key.indexOf('.'));
						var nextCri = {};
						nextCri[nextkey] = value;				
					}
					
					if(temp.hasOwnProperty(key)){ //This maybe slow, but has less code
						temp = [temp]
					}
					if(Array.isArray(temp)){
						var notExistCount = 0;
						for(var i=0, l=temp.length; i<l; i++){
							if(temp[i].hasOwnProperty(key)){
								var tt = temp[i][key];
								if(nextkey === ""){
									if(Types.getType(value) == Types.Object){
										if(filterFun(tt, index, ary, value)){
											if(Utils.filters._isNoExistsCriterias(value)){
												notExistCount++;
												continue;
											}
											context.matchedAryEle.put(temp, i);
											continue continueNextKey;
										}
									}
									else{
										var result = Utils.compare(tt, value);
										if(Array.isArray(result) ? result.indexOf(0)>=0 : result===0){
											context.matchedAryEle.put(temp, i);
											continue continueNextKey;
										}
									}
								}
								else{
									if(filterFun(tt, index, ary, nextCri)){
										if(Utils.filters._isNoExistsCriterias(value)){
											notExistCount++;
											continue;
										}
										context.matchedAryEle.put(temp, i);
										continue continueNextKey;
									}
								}
							}
							else{
								notExistCount++;
							}
						}
						if(notExistCount == l){
							if(Utils.filters._isNoExistsCriterias(value))
								return true;
						}
					}
					else{ //do not have the key
						if(Utils.filters._isNoExistsCriterias(value))
							return true;
					}
					return false;
				}
				
				return true;
			}
			
			return filterFun;
		},
		
		createMapFunc : function(projection, context){
			var proj = projection;
			function isIncludeMap(proj){
				for(var field in proj){
					if(field == "_id" && proj===projection)
						continue;
						
					if(typeof proj[field] === "object"){
						return isIncludeMap(proj[field]);
					}
					return (proj[field] !== 0);
				}
				return false;
			}
			function cloneObjWithIncludeProj(obj, result, projs){
				continueNextKey:
				for(var key in projs){
					if(key === "_id" && projs === projection)
						continue;
						
					var value = projs[key];
					if(key.indexOf('.')==-1){
						var nextkey = "";
					}
					else{
						var nextkey = key.substring(key.indexOf('.')+1);
						var key = key.substring(0, key.indexOf('.'));
					}			
					if(!obj.hasOwnProperty(key)){
						continue continueNextKey;
					}
					
					var currentObj = obj[key];
					
					//Handle Projection Operators $, $elemMatch and $slice
					if(Array.isArray(currentObj)){
						if(nextkey === "$" || nextkey.substr(-2) === ".$"){						
							if(!result.hasOwnProperty(key))
								result[key] = [];
							var index = context.matchedAryEle.get(currentObj);
							if(index === undefined)
								index = 0;						
							result[key][0] = Utils.clone(currentObj[index])

							continue continueNextKey;
						}
						
						if(value.hasOwnProperty("$slice")){
							if(Array.isArray(value["$slice"])){
								var start = value["$slice"][0];
								if(start < -currentObj.length)
									start = 0;
								else if(start < 0)
									start = currentObj.length + start;
								var end = start + value["$slice"][1];
								currentObj = currentObj.slice(start, end);
							}
							else{
								if(value["$slice"]<-currentObj.length){
									var start = 0;
									var end = currentObj.length;
								}
								else if(value["$slice"] >= 0){
									var start = 0;
									var end = value["$slice"];
								}
								else{
									var start = currentObj.length + value["$slice"];
									var end = currentObj.length;
								}
								currentObj = currentObj.slice(start, end);
							}
							value = 1;
						}
					}
					
					if(nextkey !== ""){
						if(Array.isArray(currentObj)){
							if(!result.hasOwnProperty(key))
								result[key] = [];
							for(var i=0, l=currentObj.length; i<l; i++){
								if(!result[key].hasOwnProperty(i))
									result[key][i] = {};
								var nextproj = {};
								nextproj[nextkey] = value;
								cloneObjWithIncludeProj(currentObj[i], result[key][i], nextproj);							
							}
						}
						else{
							if(!result.hasOwnProperty(key))
								result[key] = {};
							var nextproj = {};
							nextproj[nextkey] = value;	
							cloneObjWithIncludeProj(currentObj, result[key], nextproj);						
						}
					}
					else{
						if(typeof value === "object"){ //This is not allowed in Mongo
							if(Array.isArray(currentObj)){
								if(!result.hasOwnProperty(key))
									result[key] = [];
								for(var i=0, l=currentObj.length; i<l; i++){
									if(!result[key].hasOwnProperty(i))
										result[key][i] = {};
									cloneObjWithIncludeProj(currentObj[i], result[key][i], value);							
								}
							}
							else{
								if(!result.hasOwnProperty(key))
									result[key] = {};
								cloneObjWithIncludeProj(currentObj, result[key], value);						
							}
						}
						else{
							result[key] = Utils.clone(currentObj);
						}
					}
				}
			}
			
			//obj can be not used in exclude mode, for it has been cloned to result
			function cloneObjWithExcludeProj(obj, result, projs){
				for(var key in projs){
					if(key === "_id" && projs === projection)
						continue;
					
					var value = projs[key];
					if(key.indexOf('.')==-1){
						var nextkey = "";
					}
					else{
						var nextkey = key.substring(key.indexOf('.')+1);
						var key = key.substring(0, key.indexOf('.'));
					}			
					if(!obj.hasOwnProperty(key)){
						continue;
					}
					
					if(nextkey !== ""){
						if(Array.isArray(obj[key])){
							for(var i=0, l=obj[key].length; i<l; i++){
								var nextproj = {};
								nextproj[nextkey] = value;
								cloneObjWithExcludeProj(obj[key][i], result[key][i], nextproj);							
							}
						}
						else{
							var nextproj = {};
							nextproj[nextkey] = value;	
							cloneObjWithExcludeProj(obj[key], result[key], nextproj);						
						}
					}
					else{
						if(typeof value === "object"){ //This is not allowed in Mongo
							if(Array.isArray(obj[key])){
								for(var i=0, l=obj[key].length; i<l; i++){
									cloneObjWithExcludeProj(obj[key][i], result[key][i], value);							
								}
							}
							else{
								cloneObjWithExcludeProj(obj[key], result[key], value);						
							}
						}
						else{
							delete result[key];
						}
					}					
					
				}
			}
			
			function mapFun(obj, index, ary){
				var result;
				var keepId = (proj._id === 0 || proj._id === false) ? false : true;		
				var bIncludeMap = isIncludeMap(proj);
				for(var field in proj){
					if(field == "_id")
						continue;
					bIncludeMap = (proj[field] !== 0);
					break;
				}
						
				if(bIncludeMap){ // Map is for include
					result = {};
					if(keepId) result._id = obj._id;
					//Mongo use the most restrict proj, need filter the projections. for example {"a.b.c.d":1, "a.b.c":1}, only {"a.b.c.d":1} work
					cloneObjWithIncludeProj(obj, result, proj);
				}
				else{ //Map is for exclude
					result = Utils.clone(obj);
					//Mongo use the most restrict proj, need filter the projections. for example {"a.b.c.d":1, "a.b.c":1}, only {"a.b.c.d":1} work
					cloneObjWithExcludeProj(obj, result, proj);
					if(!keepId){
						delete result._id;
					}
				}
				return result;	
			}
			return mapFun;
		},
	};

})(
	typeof(exports) !== 'undefined' ? exports : window['Collection']={},
	Types,
	Utils
);