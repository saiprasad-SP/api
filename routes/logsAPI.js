const { json } = require("express");
var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const directoryPath = path.resolve(__dirname,"../../logtrace-filestore/edepoze-logs");

function processFile(content){
    // console.log('content from file:', content);
    content.forEach(function (item, index) {
        if (item != undefined){
            var logtraceObjArr = [
                "EventTimestamp",
                "FullQualifiedName",
                "UserName",
                "OperationName",
                "MessageID",
                "CorrelationIDContent",
                "Direction",
                "FromServer",
                "ToServer"
            ];
            var logtraceObj = {};
            var pipearray = item.toString().split("|");
            // console.log('pipearray:', pipearray.length);
            pipearray.forEach(function(element,index) {
                var logObj = element.split("::")
                logtraceObj[logtraceObjArr[index]] = logObj[1];
            })
            // console.log('Line from file:', logtraceObj);
            this.logtraceArr.push(logtraceObj);
        }
    });
}
function parseFile(filePath) {
    // console.log(filePath);
    let content = "";
    let output = new Promise((resolve, reject) => {
        fs.readFile(filePath, function(err, data) {
            content = data.toString().split(/(?:\r\n|\r|\n)/g).map(function(line) {
                var matchedContent;
                const regExp = /\[Event([^]+\])/g
                if((matchedContent = line.match(regExp)) != null){
                    // console.log('matchedContent from file:', matchedContent);
                    return matchedContent;
                }
            })
            resolve(processFile(content))
        })
    })
    return output
}
router.get("/", function(req,res,next){
    var filesMatched = [];
    global.logtraceArr = [];
    let currentDate = new Date()//
    const parseDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10)//this will format date into yyyy-mm-dd
        const startDate = parseDate(currentDate)
        const endDate = parseDate(currentDate)
        // console.log(startDate);
        // console.log(endDate);
    filesMatched = fs.readdirSync(directoryPath).filter(
        (filename)=>{
            var fileFormattedDate = parseDate(String(filename).match(/\d{4}\-\d{2}-\d{2}/));
            if(fileFormattedDate >= startDate  && fileFormattedDate <= endDate){
                return filename;
            }
        });
    // console.log("filesMatched ----->",filesMatched);
    var promises =  filesMatched.map(file => parseFile(path.join(directoryPath,file)));
    Promise.all(promises).then(()=>{
        // console.log("---------->Promise all");
        res.header("Access-Control-Allow-Origin", "*");
        res.contentType('application/json');
        // res.send(this.logtraceArr);
        let currentTime = new Date().getTime()
        let fromTime = new Date(currentTime).toTimeString().slice(0,8)
        let toTime = new Date(currentTime-(60*60*1000)).toTimeString().slice(0,8)
        var TimeStampRegEx = /\d{2}:\d{2}:\d{2}/
        var timeMatched = [];
        timeMatched = this.logtraceArr.filter((item,i)=>{
            var line = item.EventTimestamp
            let matchedTimeContent =line.match(TimeStampRegEx)
            if(matchedTimeContent <=fromTime && matchedTimeContent >=toTime){
            return item;
        }
        })
        res.send(timeMatched)
    });
})
router.post("/customDateRange", function(req,res){
    var filesMatched = [];
    global.logtraceArr = [];
    const parseDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10)//this will format date into yyyy-mm-dd
   // console.log(req);
    if(req.body != null){
        const from =req.body.param1;
        const to =req.body.param2;
        const startDate = parseDate(from)
        const endDate = parseDate(to)
        console.log(startDate);
        console.log(endDate);
        // console.log("---directoryPath ----->",directoryPath);
        filesMatched = fs.readdirSync(directoryPath).filter(
        (filename)=>{
            var fileFormattedDate = parseDate(String(filename).match(/\d{4}\-\d{2}-\d{2}/));
            if(fileFormattedDate >= startDate  && fileFormattedDate <= endDate){
                return filename;
            }
        });
        // console.log("---filesMatched ----->",filesMatched);
        var promises =  filesMatched.map(file => parseFile(path.join(directoryPath,file)));
        Promise.all(promises).then((results)=>{
            // console.log("---------->Promise all");
            res.header("Access-Control-Allow-Origin", "*");
            res.contentType('application/json');
            res.send(this.logtraceArr);
        });
    }
})
router.post("/customTimeRange",function(req,res){
    let timeParam,currentTime,fromTime,toTime
    timeParam = req.body.timeParam1
    currentTime = new Date().getTime()
    fromTime = new Date(currentTime).toTimeString().slice(0,8);
    toTime =new Date(currentTime-((timeParam*60)*60*1000)).toTimeString().slice(0,8);
    console.log(fromTime);//log values
    console.log(toTime);//log values
    var TimeStampRegEx = /\d{2}:\d{2}:\d{2}/
    var timeMatched = [];
    timeMatched = logtraceArr.filter((item,i)=>{
        var line = item.EventTimestamp
        let matchedTimeContent =line.match(TimeStampRegEx)
        if(matchedTimeContent <=fromTime && matchedTimeContent >=toTime){
        return item;
     }
    })
    res.send(timeMatched)
})
module.exports = router;