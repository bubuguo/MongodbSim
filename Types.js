/*
http://docs.mongodb.org/manual/reference/object-id/
ObjectId is a 12-byte BSON type, constructed using:

a 4-byte value representing the seconds since the Unix epoch,
a 3-byte machine identifier,
a 2-byte process id, and
a 3-byte counter, starting with a random value.

*/

var ObjectId = function(){
	this.str = Math.round(new Date()/1000).toString(16) + Math.random()*10e16.toString();
};
ObjectId.prototype = {
	toString: function(){
		return "ObjectId(" + this.str + ")";
	},
	
	tojson: function(){
		return this.toString();
	},
	
	valueOf: function(){
		return this.str;
	},
	
	isObjectId: true,
	
	getTimestamp: function(){
		return new Date(parseInt(this.valueOf().slice(0,8), 16)*1000);
	}, 

	equals: function(other){
		return this.str == other.str;
	}
};

var ISODate = function(dataString){
//    this.date = new Date(Date.parse(dataString));
//	return ISODate(this.date);
	return new Date(Date.parse(dataString));
};
Date.prototype.tojson = function(){
	return "ISODate(\"" + this.toJSON() + "\")";
};


Array.prototype.tojson = function(){
	var r = '[';
	for(var i=0, l=this.length-1; i<l; i++){
		r += tojson(this[i]);
		r += ", ";
	}
	
	r+=tojson(this[i]);
	r+=']';

	return r;
};

tojson = function(x) {
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
			var r = "{";
			for(var i in x){
				if(!x.hasOwnProperty(i))
					continue;
				count++;
				r+="\"";
				r += i;
				r += "\":";
				r += tojson(x[i]);
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

