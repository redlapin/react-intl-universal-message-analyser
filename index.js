#!/usr/bin/env node

const commander = require("commander");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const defaultFileType = /\.[jt]sx?$/;
const defaultIntlWord = "intl";

function list(val){
    return val.split(',').filter(d => d!= '');
}
function localFile(val){
    return path.resolve(process.cwd(), val);
}
commander
    .version('0.0.1')
    .option('-t, --target <target>', "folder directory to search", list)
    .option('-f, --file <file>', 'existing locale json file', localFile)
    .option('-i, --intlWord [intlWord]', 'intl variable name used in program', defaultIntlWord)
    .parse(process.argv)


const targetFolderArr = commander.target;
const localMessageFile = commander.file;
const regVerify = new RegExp(commander.intlWord + ".get\\([\"'][\\w\\-' ']+[\"']\\)");
const fileType = defaultFileType;

// 检查文件类型是否正确。不正确，抛出异常
if(!fs.existsSync(localMessageFile)){
    throw new Error("The existing locale json file does not exist!");
}

if(!commander.intlWord){
    throw new Error("please specify the intl variable name with -i ")
}

function find(pathTarget){
    const fileArr = fs.readdirSync(pathTarget);
    let promiseArr = [];
    fileArr.forEach(file => {
        const abPath = path.resolve(pathTarget, file);
        if(!fs.statSync(abPath).isDirectory()){
            if(fileType.test(file)){
                // 执行搜索逻辑
                const promise_result = findText(abPath);
                promiseArr.push(promise_result);
            }
        }
        else{
            const promise_res = find(abPath);
            promiseArr.push(promise_res);
        }
    })
    return Promise.all(promiseArr).then(res => {
        if(res instanceof Array){
            if(res.length > 0){
                return res.filter(d => d != "").join(",")
            }
            return ""
        }
    })
}

function findText(abPath){
    return new Promise((resolve) => {
        const result = [];
        const lineReader = readline.createInterface({
            input: fs.createReadStream(abPath)
        });
        lineReader.on('line', function (line) {
            const l_tr = line.trim();
            if(l_tr && regVerify.test(l_tr)){
                let res = l_tr.replace(/[\s\S]*intl.get\(["']([\w\-' ']+)["']\)[\s\S]*/, "$1");
                result.push(res);
            }
        });
        lineReader.on("close", function(){
            const resolved_value = result.join(",");
            !!result.length ? resolve(resolved_value) : resolve("");
        })
    })
}

const resPromise = targetFolderArr.map(p => {
    const targetPath = path.resolve(process.cwd(), p);
    // 检查路径是否存在，不存在，抛出异常
    if(!fs.existsSync(targetPath)){
        throw new Error("The search path does not exist! Please modify your config option of '-t'!");
    }
    return new Promise((resolve, reject) => {
        find(targetPath)
        .then(values => {
            resolve(values);
        }, err => {
            reject(err)
        })
    })
})

Promise.all(resPromise).then(res => {
    const values = res.join(',');
    let used_value = values.split(",").sort();
    used_value = used_value.filter((d, i) => {
                        return used_value.indexOf(d) == i
                    });
    const exist_value = Object.keys(JSON.parse(fs.readFileSync(localMessageFile, 'utf8')));
    const lacked_value = [];
    const unused_value = [];
    for(var i=0; i< used_value.length; i++){
        if(exist_value.indexOf(used_value[i]) < 0){
            lacked_value.push(used_value[i]);
        }
    }
    for(var k=0; k< exist_value.length; k++){
        if(used_value.indexOf(exist_value[k]) < 0){
            unused_value.push(exist_value[k])
        }
    }
    console.log("number of messages in using: " + used_value.length);
    console.log("number of messages existing: " + exist_value.length);
    console.log("number of lacked messages: " + lacked_value.length);
    console.log("number of redundant messages: " + unused_value.length + '\n\n');
    console.log("list of lacked messages: \n " +lacked_value.sort().join("\n") + "\n\n\n");
    console.log("list of redundant messages: \n" +unused_value.sort().join("\n"));

}, e => {
    console.log(e);
})
