(function (exports, global) {

	/*
	Combined with
	a 4-byte value representing the seconds since the Unix epoch,
	a 8-byte random value.
	*/
	var ObjectId = function(){
		if(this instanceof ObjectId){
			if(!this.hasOwnProperty("_str")){ //contractor
				this._str = Math.round(new Date()/1000).toString(16) + Math.random()*10e16.toString();
			}
			else{	//clone
				var r = new ObjectId();
				r._str = this._str;
				return r;
			}
		}
		else{ //new ObjectId
			return new ObjectId();
		}
	};
	ObjectId.prototype = {
		constructor: ObjectId,
		toString: function(){
			return "ObjectId(\"" + this._str + "\")";
		},
		
		tojson: function(){
			return this.toString();
		},
		
		valueOf: function(){
			return this._str;
		},
		
		isObjectId: true,
		
		getTimestamp: function(){
			return new Date(parseInt(this.valueOf().slice(0,8), 16)*1000);
		}, 
	
		equals: function(other){
			return this._str == other._str;
		}
	};
	
	var ISODate = function(date){
		if(this instanceof ISODate){
			if(!this.hasOwnProperty("_date")){ //contractor 
				if(typeof date === "string")
					this._date = new Date(Date.parse(date));
				else
					this._date = new Date(date);
			}
			else {//clone
				return new ISODate(this._date);
			}
		}
		else 
			return new ISODate(date);
	};
	ISODate.prototype = {
		constructor: ISODate,
		tojson: function(){
			return "ISODate(\"" + this._date.toJSON() + "\")";
		},
	}
	
	
	Array.prototype.tojson = function(){
		if(this.length === 0)
			return '[]';
			
		var r = '[';
		for(var i=0, l=this.length-1; i<l; i++){
			r += exports.tojson(this[i]);
			r += ", ";
		}
		
		r+=exports.tojson(this[i]);
		r+=']';
	
		return r;
	};
	
	exports.tojson = function(x) {
		if (x === null)
			return "null";
	
		if (x === undefined)
			return "undefined";
			
		switch (typeof x) {
			case "string": 
				return "\"" + x + "\"";
			case "number":
			case "boolean":
				return "" + x;
			case "object":{				
				if(x.tojson){
					return x.tojson();
				}
				var count = 0;
	
				//keep _id is the first property to output;
				r = x._id ? "{\"_id\":" + exports.tojson(x._id) + ", " : "{";		
				for(var i in x){
					count++;
					if(!x.hasOwnProperty(i) || i=="_id")
						continue;
					r+= "\"";
					r += i;
					r += "\":";
					r += exports.tojson(x[i]);
					r += ", "
				}
				if(count === 0)
					return "{}"
				return r.substring(0, r.length-2)+"}";
			}
			case "function":
				return x.toString();
			default:
				throw "tojson can't handle type " + (typeof x);
		}
	};
	
	//MinKey and MaxKey compare less than and greater than all other possible BSON element values, respectively, and exist primarily for internal use.
	MaxKey = function(){};
	MaxKey.prototype.tojson = function(){
		return "{\"$maxKey\": 1}";
	}
	MaxKey = new MaxKey();
	MinKey = function(){};
	MinKey.prototype.tojson = function(){
		return "{\"$minKey\": 1}";
	}
	MinKey = new MinKey();
	
	/*
	http://docs.mongodb.org/manual/reference/operator/query/type/
	Only have one type for Double, 32-bit Integer and 64-bit Integer
	*/	
	exports.getType = function(o){
		switch(typeof o){
			case "number": return exports.Double;		
			case "string": return exports.String;
			case "undefined": return exports.Undefined;
			case "boolean": return exports.Boolean;
			case "function": return exports.Function
		}
		
		if(o instanceof Number) return exports.Double;
		if(o instanceof String) return exports.String;
		if(o instanceof Array) return exports.Array;
		//if(o instanceof BinaryData) return exports.BinaryData;
		if(o instanceof ObjectId) return exports.ObjectId;
		if(o instanceof Boolean) return exports.Boolean;
		if(o instanceof ISODate) return exports.Date;
		if(o instanceof Date) return exports.Date;
		if(o === null) return exports.Null;
		if(o instanceof RegExp) return exports.RegExp;
		//if(o instanceof Symbol) return exports.Symbol;
		//if(o instanceof Timestamp) return exports.Timestamp;
		//if(o instanceof MinKey) return exports.MinKey;
		//if(o instanceof MaxKey) return exports.MaxKey;
		return exports.Object;
	};
	
	Map = function(){
		this.keys = [];
		this.values = [];
	};
	Map.prototype = {
		put: function(key, value){
			this.keys[this.keys.length] = key;
			this.values[this.values.length] = value;
		},
		
		get: function(key){
			return this.values[this.keys.indexOf(key)];
		}		
	};
	
	exports.Double=1;
	exports.String=2;
	exports.Object=3;
	exports.Array=4;
	exports.BinaryData=5;
	exports.Undefined=6;
	exports.ObjectId=7;
	exports.Boolean=8;
	exports.Date=9;
	exports.Null=10;
	exports.RegExp=11;
	exports.JavaScript=13;
	exports.Symbol=14;
	exports.JavaScript=15;
	exports.Integer=1; //16;
	exports.Timestamp=17;
	exports.Integer=1; //64;
	exports.MinKey=255;
	exports.MaxKey=127;
	exports.Function=13;
	
	
	global.ObjectId = ObjectId;
	global.ISODate = ISODate;
})(
	typeof(exports) !== 'undefined' ? exports : window['Types']={},
	typeof(global) !== 'undefined' ? global : window
);

