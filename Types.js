/*
http://docs.mongodb.org/manual/reference/object-id/
ObjectId is a 12-byte BSON type, constructed using:

a 4-byte value representing the seconds since the Unix epoch,
a 3-byte machine identifier,
a 2-byte process id, and
a 3-byte counter, starting with a random value.

*/

var ObjectId = function(){
	if(this instanceof ObjectId){
		if(!this.hasOwnProperty("str")){ //contractor
			this.str = Math.round(new Date()/1000).toString(16) + Math.random()*10e16.toString();
		}
		else{	//clone
			var r = new ObjectId();
			r.str = this.str;
			return r;
		}
	}
	else{ //String to ObjectId
		return new ObjectId();
	}
};
ObjectId.prototype = {
	constructor: ObjectId,
	toString: function(){
		return "ObjectId(\"" + this.str + "\")";
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

var ISODate = function(date){
	if(this instanceof ISODate){
		if(!this.hasOwnProperty("date")){ //contractor 
			if(typeof date === "string")
				this.date = new Date(Date.parse(date));
			else
				this.date = new Date(date);
		}
		else {//clone
			return new ISODate(this.date);
		}
	}
	else 
		return new ISODate(date);
};
ISODate.prototype = {
	constructor: ISODate,
	tojson: function(){
		return "ISODate(\"" + this.date.toJSON() + "\")";
	},
}


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

			//keep _id is the first property to output;
			r = x._id ? "{\"_id\":" + tojson(x._id) + ", " : "{";		
			for(var i in x){
				if(!x.hasOwnProperty(i) || i=="_id")
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

