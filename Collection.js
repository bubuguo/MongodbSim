
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
			var result = this._data().filter(this.createFilterFunc(criterias));
			projection = projection || {};
			result = result.map(this.createMapFunc(projection));
			return (this.io) ? this.io.output(result) : result;
		},

		createFilterFunc: function (criterias){	
			function filterFun(item, index, ary, cris){
				if(cris === undefined)
					cris = criterias;
					
				continueNextKey:
				for(var key in cris){
					var temp = item;
					var opt = Utils.filters[key];
					if(opt){
						return opt(temp, cris[key], filterFun);
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
											continue continueNextKey;
										}
									}
									else{
										var result = Utils.compare(tt, value);
										if(Array.isArray(result) ? result.indexOf(0)>=0 : result===0)
											continue continueNextKey;
									}
								}
								else{
									if(filterFun(tt, index, ary, nextCri)){
										if(Utils.filters._isNoExistsCriterias(value)){
											notExistCount++;
											continue;
										}
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
		
		createMapFunc : function(proj){
			function mapFun(obj, index, ary){
				var result;
				var keepId = (proj._id === 0 || proj._id === false) ? false : true;
				
				var bIncludeMap = false;
				for(var field in proj){
					if(field == "_id")
						continue;
					bIncludeMap = (proj[field] !== 0);
					break;
				}
						
				if(bIncludeMap){ // Map is for include
					result = {};
					if(keepId)
						result._id = obj._id;
					for(var field in proj){
						if(field == "_id")
							continue;
							
						var fs = field.split('.');
						var value = obj, newValue = result;
						for(var i=0,l=fs.length; i<l; i++){
							if(!value.hasOwnProperty(fs[i])){
								break;							
							}
							
							newValue = newValue[fs[i-1]] || result;
							if(!newValue.hasOwnProperty(fs[i]))
								newValue[fs[i]] = {};
							value = value[fs[i]];
						}
						
						if(i === l){
							newValue[fs[l-1]] = Utils.clone(value);
						}
					}
				}
				else{ //Map is for exclude
					result = Utils.clone(obj);
					for(var field in proj){
						var fs = field.split('.');
						var toDelProp, toDelObj = result;
						for(var i=0,l=fs.length; i<l; i++){
							toDelObj = toDelObj[fs[i-1]] || result;
							var temp = toDelObj[fs[i]];
							if(temp === undefined)
								break;
						}	
						delete toDelObj[fs[l-1]];			
					}
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