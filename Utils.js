var util = {};

/*
	deep clone object, and keep object type, need object prototype have such settings
	xxx.prototype.constructor = xxx
*/
util.clone = function(obj){
	if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();
	var type = util.typeof(temp);
	if(type !== "object" && type !== "array")
		return temp;

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = util.clone(obj[key]);
        }
    }
    return temp;
};

util.genObjectId = function(){
	return new ObjectId();
};
			
util.compare = function compare(obj1, obj2){

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
					var r = util.compare(obj1[i], obj2[i]);
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
util.filters = {
	$gt: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? result.indexOf(1)>=0 : result==1;
	},
	$gte: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? (result.indexOf(1)>=0 || result.indexOf(0)>=0) : (result==1 || result==0);
	},
	$in: function(item, criteria){
		if(!Array.isArray(criteria))
			throw {code: 17287, message: "BadValue $in or $nin needs an array"};
		for(var i=0,l=criteria.length; i<l; i++){
			var result = util.compare(item, criteria[i]);
			if(Array.isArray(result) ? result.indexOf(0)>=0 : result==0){
				return true;
			}
		}
		return false;
	},
	$lt: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? result.indexOf(-1)>=0 : result==-1;
	},
	$lte: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? (result.indexOf(-1)>=0 || result.indexOf(0)>=0) : (result==-1 || result==0);
	},
	$ne: function(item, criteria){
		var result = util.compare(item, criteria);						
		return Array.isArray(result) ? (result.indexOf(0)<0) : (result!==0);
	},
	$nin: function(item, criteria){
		return !util.filters.$in(item, criteria);
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
	$exists: function(item, criteria, filterFun){ //only handle $exists: true
		if(criteria)
			return true;
		return false;
	},
	$type: function(item, criteria){
		return util.typeof(item) === criteria;
	},
	$mod: function(item, criteria){
		return (item % criteria[0]) == criteria[1];
		//exception handler
	}
};

util.filters._isNoExistsCriterias = function(cri){
	var count = 0;
	if(cri.hasOwnProperty("$exists") && !cri["$exists"]){
		for(var i in cri) count++;
		if(count == 1)
			return true;
	}
	return false;
};

/*
http://docs.mongodb.org/manual/reference/operator/query/type/
Type	Number	Notes
Double	1	 
String	2	 
Object	3	 
Array	4	 
Binary data	5	 
Undefined	6	Deprecated.
Object id	7	 
Boolean	8	 
Date	9	 
Null	10	 
Regular Expression	11	 
JavaScript	13	 
Symbol	14	 
JavaScript (with scope)	15	 
32-bit integer	16	 
Timestamp	17	 
64-bit integer	18	 
Min key	255	Query with -1.
Max key	127
*/
util.typeMap = {"1": "double", "2": "string", "3": "object", "4": "array", "5": "binary data", "6": "undefined", "7": "object id", "8": "boolean", "9": "date"}

util.typeof = function(obj){
	var type = typeof obj;
	if(type !== "object"){
		return type;						
	}
	else if(obj instanceof RegExp){
		return "regexp";
	}
	else if(Array.isArray(obj)){
		return "array";
	}
	else if(obj instanceof ObjectId){
		return "objectid";
	}
	else if(obj instanceof ISODate){
		return "isodate";
	}
	return type;
};

util.makeAryIterator = function (array){
	var nextIndex = 0;
	return {
		next: function(){
			return nextIndex < array.length ? array[nextIndex++] : null;
		},
		hasNext: function(){
			return nextIndex < array.length;
		}
	}
};