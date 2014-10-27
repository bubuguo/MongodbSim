
if(typeof require === "function"){
	var Types = require("./Types.js");
}

(function(exports, Types){

	exports.clone = function(obj){
		if(obj == null || typeof(obj) != 'object')
			return obj;
	
		var temp = obj.constructor();
		var type = Types.getType(temp);
		if(type !== Types.Object && type !== Types.Array)
			return temp;
	
		for(var key in obj) {
			if(obj.hasOwnProperty(key)) {
				temp[key] = exports.clone(obj[key]);
			}
		}
		return temp;
	};
				
	exports.compare = function compare(obj1, obj2){
		//when try to compare a array element
		if(Array.isArray(obj1) && !Array.isArray(obj2)){
			var r=[];
			for(var i=0,l=obj1.length; i<l; i++){
				r[i] = compare(obj1[i], obj2);
			}
			return r;
		}
		
		if(obj2 instanceof RegExp){
			return obj2.test(obj1) ? 0 : NaN;
		}
	
		if(typeof obj1 !== typeof obj2)
			return NaN;
		
		switch(typeof obj1){
			case "number": 
			case "boolean": 
				return obj1==obj2?0:obj1<obj2?-1:1;
			case "string":
				return obj1.localeCompare(obj2);
			case "function": 
				return obj1==obj2?0:NaN;
			case "object":
				var i, count1=0, count2=0;
				for(i in obj1) count1++;
				for(i in obj2) count2++;
				if(count1 !== count2)
					return NaN;
								
				for(i in obj2){
					if(obj1[i]){
						var r = exports.compare(obj1[i], obj2[i]);
						if(r !== 0)
							return r;
					}
					else{
						return NaN;
					}
				}
				return 0;
			default:
				return NaN;				
		}
	};
	
	/* http://docs.mongodb.org/manual/reference/operator/query/ */
	exports.filters = {
		$gt: function(item, criteria){
			var result = exports.compare(item, criteria);						
			return Array.isArray(result) ? result.indexOf(1)>=0 : result==1;
		},
		$gte: function(item, criteria){
			var result = exports.compare(item, criteria);						
			return Array.isArray(result) ? (result.indexOf(1)>=0 || result.indexOf(0)>=0) : (result==1 || result==0);
		},
		$in: function(item, criteria){
			if(!Array.isArray(criteria))
				throw {code: 17287, message: "BadValue $in or $nin needs an array"};
			for(var i=0,l=criteria.length; i<l; i++){
				var result = exports.compare(item, criteria[i]);
				if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0){
					return true;
				}
			}
			return false;
		},
		$lt: function(item, criteria){
			var result = exports.compare(item, criteria);						
			return Array.isArray(result) ? result.indexOf(-1)>=0 : result==-1;
		},
		$lte: function(item, criteria){
			var result = exports.compare(item, criteria);						
			return Array.isArray(result) ? (result.indexOf(-1)>=0 || result.indexOf(0)>=0) : (result==-1 || result==0);
		},
		$ne: function(item, criteria){
			var result = exports.compare(item, criteria);						
			return Array.isArray(result) ? (result.indexOf(0)<0) : (result!==0);
		},
		$nin: function(item, criteria){
			return !exports.filters.$in(item, criteria);
		},
			
		$and: function(item, criteria, filterFun){
			if(!Array.isArray(criteria));
				throw {code: 17287, message: "BadValue $and needs an array"};
				
			for(var i=0,l=criteria.length; i<l; i++){
				if(!filterFun(item, null, null, criteria[i]))
					return false;
			}
			return true;
		},
		$nor: function(item, criteria, filterFun){
			if(!Array.isArray(criteria))
				throw {code: 17287, message: "BadValue $nor needs an array"};
				
			for(var i=0,l=criteria.length; i<l; i++){
				if(filterFun(item, null, null, criteria[i]))
					return false;
			}
			return true;
		},
		$not: function(item, criteria, filterFun){
			return !filterFun(item, null, null, criteria);
		},
		$or: function(item, criteria, filterFun){
			if(!Array.isArray(criteria))
				throw {code: 17287, message: "BadValue $or needs an array"};
				
			for(var i=0,l=criteria.length; i<l; i++){
				if(filterFun(item, null, null, criteria[i]))
					return true;
			}
			return false;
		},
		$exists: function(item, criteria, filterFun){ //only handle $exists: 1, $exists:0 is handled in filter function
			if(criteria)
				return true;
			return false;
		},
		$type: function(item, criteria){
			return Types.getType(item) === criteria;
		},
		$mod: function(item, criteria){
			return (item % criteria[0]) == criteria[1];
			//exception handler
		},
		$regex: function(item, criteria){
			return RegExp(criteria).test(item);
		},
		$text: function(){ // not implement
			return true;
		},
		$where: function(item, criteria){ // only support function now
			if(typeof criteria == "function"){
				if(obj)
					var temp = obj;
				var r = criteria.apply(item);
				if(temp)
					obj = temp;
				return r;
				
			}
		},
		$all: function(item, criteria){
			for(var t in criteria){
				if (item.indexOf(t) < 0)
					return false;
			}
			return true;
		},
		$elemMatch: function(item, criteria, filterFun){
			nextArrayItem:
			for(var i=0,l=item.length; i<l; i++){
				for(var c in criteria){
					var cri = {};
					cri[c] = criteria[c];
					if(!filterFun(item[i], null, null, cri)){
						continue nextArrayItem
					}
				}
				return true;				
			}
			return false;
		},
		$size: function(item, criteria){
			return item.length === criteria;
		},
	};
	
	exports.filters._isNoExistsCriterias = function(cri){
		var count = 0;
		if(cri.hasOwnProperty("$exists") && !cri["$exists"]){
			for(var i in cri) count++;
			if(count == 1)
				return true;
		}
		return false;
	};
	
})(
	typeof(exports) !== 'undefined' ? exports : window['Utils']={},
	Types
);