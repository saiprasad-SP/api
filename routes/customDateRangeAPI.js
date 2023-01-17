const e = require("cors");
var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const directoryPath = path.resolve(__dirname,"../../logtrace-filestore/edepoze-logs");


router.get("/", function(req,res,next){
    var filesMatched = [];
    var logtraceArr = [];
    const parseDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10)//this will format date into yyyy-mm-dd


    const startDate = parseDate("2022-12-06")
    const endDate = parseDate("2022-12-06")
    
    filesMatched = fs.readdirSync(directoryPath).filter(
    (filename)=>{
        var fileFormattedDate = parseDate(String(filename).match(/\d{4}\-\d{2}-\d{2}/));
        if(fileFormattedDate >= startDate  && fileFormattedDate <= endDate){
            return filename;
        }
    });
    console.log("filesMatched ----->",filesMatched);
    var count = 0;
    function processFile(content){
        //console.log(content);
        content.forEach(function (item, index) {
            if (item != undefined){
                //console.log(item, index);
                var pipearray = item.toString().split("|");
                var logtraceObj = {
                    EventTimestamp:'',
                    FullQualifiedName:'',
                    UserName:'',
                    OperationName:'',
                    MessageID:'',
                    CorrelationIDContent:'',
                    Direction : '',
                    FromServer: '',
                    ToServer:''
                };
                var EventTimestamp = new Array();
                    EventTimestamp=pipearray[0].split("::")
                    if (EventTimestamp.length == 2) {
                        logtraceObj.EventTimestamp = EventTimestamp[1];
                    } else {
                        logtraceObj.EventTimestamp = "";
                    }
                var FullQualifiedName = new Array();
                    FullQualifiedName=pipearray[1].split("::")
                    if (FullQualifiedName.length == 2) {
                        logtraceObj.FullQualifiedName = FullQualifiedName[1];
                    } else {
                        logtraceObj.FullQualifiedName = "";
                    }
                var UserName = new Array();
                    UserName = pipearray[2].split("::");
                    if (UserName.length == 2) {
                    logtraceObj.UserName = UserName[1];
                    } else {
                        logtraceObj.UserName = "";
                    }
                var OperationName = new Array();
                    OperationName = pipearray[3].split("::");
                    if (OperationName.length == 2) {
                        logtraceObj.OperationName = OperationName[1];
                    } else {
                        logtraceObj.OperationName = "";
                    }
                var MessageID = new Array();
                    MessageID = pipearray[4].split("::");
                    if(MessageID.length == 2){
                    logtraceObj.MessageID = MessageID[1];
                    }else{
                    logtraceObj.MessageID = "";
                    }
                var CorrelationIDContent = new Array();
                    CorrelationIDContent = pipearray[5].split("::");
                    if (CorrelationIDContent.length == 2) {
                        logtraceObj.CorrelationIDContent = CorrelationIDContent[1];
                    } else {
                        logtraceObj.CorrelationIDContent = "";
                    }
                var Direction = new Array();
                    Direction = pipearray[5].split("::");
                    if (Direction.length == 2) {
                        logtraceObj.Direction = Direction[1];
                    } else {
                        logtraceObj.Direction = "";
                    }
                var FromServer = new Array();
                    FromServer = pipearray[6].split("::");
                    if (FromServer.length == 2) {
                        logtraceObj.FromServer = FromServer[1];
                    } else {
                        logtraceObj.FromServer = "";
                    }
                var ToServer =  new Array();
                    ToServer = pipearray[7].split("::");
                    if(ToServer.length == 2){
                        logtraceObj.ToServer = ToServer[1];
                    }else{
                        logtraceObj.ToServer = "";
                    }
                //console.log('Line from file:', count);
                //console.log('Line from file:', logtraceObj);
                logtraceArr.push(logtraceObj);
            }
        });
    }
    function parseFile(filePath) {
        //console.log(filePath);
        let content = "";
        let output = new Promise((resolve, reject) => {
            fs.readFile(filePath, function(err, data) {
                //console.log(data);
                content = data.toString().split(/(?:\r\n|\r|\n)/g).map(function(line) {
                    var matchedContent;
                    const regExp = /\[Event([^]+\])/g
                    if((matchedContent = line.match(regExp)) != null){
                        return matchedContent;
                    }
                })
                //console.log(content);
                resolve(processFile(content))
            })
        })
        return output
    }
    var promises =  filesMatched.map(file => parseFile(path.join(directoryPath,file)));
    Promise.all(promises).then(function(results){
        //Put your callback logic here
        console.log("---------->Promise all");
        res.header("Access-Control-Allow-Origin", "*");
        res.contentType('application/json');
        res.send(logtraceArr);
    });
})  
router.post('/DisplayLogTraceJson', function(req, res) {
    const Param1 =req.body.passStart;
    const Param2 =req.body.passEnd;
    // console.log(Param1);
    // console.log(Param2);
    Dfilter(Param1, Param2)//calling function along with passing start and end date as parameters
    // res.send("Date and time has been successfully received")
    res.header("Access-Control-Allow-Origin", "*");
    res.contentType('application/json');
    res.send(logArr);
    
  });
  
module.exports = router;