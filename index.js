var Collection = require("./Collection.js");
var ConsoleIO = require("./ConsoleIO.js");

var coll = Collection.new(ConsoleIO);
coll.save({"_id":1, "name":{"first":"John","last":"Backus"}, "birth":ISODate("1924-12-03T05:00:00Z"), "death":ISODate("2007-03-17T04:00:00Z"), "contribs":["Fortran","ALGOL","Backus-Naur Form","FP" ], "awards":[{"award":"W.W. McDowell Award", "year":1967, "by":"IEEE Computer Society"},{"award":"National Medal of Science", "year":1975, "by":"National Science Foundation"},{"award":"Turing Award", "year":1977, "by":"ACM"},{"award":"Draper Prize", "year":1993, "by":"National Academy of Engineering"}]});
coll.save({"name":{"first":"John", "last":"McCarthy"}, "birth":ISODate("1927-09-04T04:00:00Z"), "death":ISODate("2011-12-24T05:00:00Z"), "contribs":["Lisp", "Artificial Intelligence", "ALGOL"], "awards":[{"award":"Turing Award", "year":1971, "by":"ACM"}, {"award":"Kyoto Prize", "year":1988, "by":"Inamori Foundation"}, {"award":"National Medal of Science", "year":1990, "by":"National Science Foundation"}]});
coll.save({"_id":3, "name":{"first":"Grace", "last":"Hopper"}, "title":"Rear Admiral", "birth":ISODate("1906-12-09T05:00:00Z"), "death":ISODate("1992-01-01T05:00:00Z"), "contribs":["UNIVAC", "compiler", "FLOW-MATIC", "COBOL"], "awards":[{"award":"Computer Sciences Man of the Year", "year":1969, "by":"Data Processing Management Association"}, {"award":"Distinguished Fellow", "year":1973, "by":" British Computer Society"}, {"award":"W. W. McDowell Award", "year":1976, "by":"IEEE Computer Society"}, {"award":"National Medal of Technology", "year":1991, "by":"United States"}]});
coll.save({"_id":4, "name":{"first":"Kristen", "last":"Nygaard"}, "birth":ISODate("1926-08-27T04:00:00Z"), "death":ISODate("2002-08-10T04:00:00Z"), "contribs":["OOP", "Simula"], "awards":[{"award":"RosingPrize", "year":1999, "by":"NorwegianDataAssociation"}, {"award":"TuringAward", "year":2001, "by":"ACM"}, {"award":"IEEEJohnvonNeumannMedal", "year":2001, "by":"IEEE"}]});
coll.save({"_id":5, "name":{"first":"Ole-Johan", "last":"Dahl"}, "birth":ISODate("1931-10-12T04:00:00Z"), "death":ISODate("2002-06-29T04:00:00Z"), "contribs":["OOP", "Simula"], "awards":[{"award":"RosingPrize", "year":1999, "by":"NorwegianDataAssociation"}, {"award":"TuringAward", "year":2001, "by":"ACM"}, {"award":"IEEEJohnvonNeumannMedal", "year":2001, "by":"IEEE"}]});
coll.save({"_id":6, "name":{"first":"Guido", "last":"vanRossum"}, "birth":ISODate("1956-01-31T05:00:00Z"), "contribs":["Python"], "awards":[{"award":"AwardfortheAdvancementofFreeSoftware", "year":2001, "by":"FreeSoftwareFoundation"}, {"award":"NLUUGAward", "year":2003, "by":"NLUUG"}]});
coll.save({"_id":ObjectId("51e062189c6ae665454e301d"), "name":{"first":"Dennis", "last":"Ritchie"}, "birth":ISODate("1941-09-09T04:00:00Z"), "death":ISODate("2011-10-12T04:00:00Z"), "contribs":["UNIX", "C"], "awards":[{"award":"TuringAward", "year":1983, "by":"ACM"}, {"award":"NationalMedalofTechnology", "year":1998, "by":"UnitedStates"}, {"award":"JapanPrize", "year":2011, "by":"TheJapanPrizeFoundation"}]});
coll.save({"_id":8, "name":{"first":"Yukihiro", "aka":"Matz", "last":"Matsumoto"}, "birth":ISODate("1965-04-14T04:00:00Z"), "contribs":["Ruby"], "awards":[{"award":"AwardfortheAdvancementofFreeSoftware", "year":"2011", "by":"FreeSoftwareFoundation"}]});
coll.save({"_id":9, "name":{"first":"James", "last":"Gosling"}, "birth":ISODate("1955-05-19T04:00:00Z"), "contribs":["Java"], "awards":[{"award":"TheEconomistInnovationAward", "year":2002, "by":"TheEconomist"}, {"award":"OfficeroftheOrderofCanada", "year":2007, "by":"Canada"}]});
coll.save({"_id":10, "name":{"first":"Martin", "last":"Odersky"}, "contribs":["Scala"]});

coll.find({contribs:"UNIX"});
coll.find({"name": {"first":"John", "last":"Backus"}}, {_id:0, "name.first":0});
coll.find({"name": {"first":"John", "last":"Backus"}}, {_id:0, "name.first":1});

coll.save({a:[{b:[{c:{d:1}}, {c:{e:2}}]}, {b:{c:{d:2}}}]});
