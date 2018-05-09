const      chai = require("chai"),
            app = require("../src/app"),
       testData = require("../source/data.json"); 

global.app = app;
global.expect = chai.expect;
global.testData = testData;