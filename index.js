#!/usr/bin/env node

const os = require('os');
const { exec } = require("child_process");

const operatingSystem = os.type();

console.log(operatingSystem);

let version;

//const tools = ["wget", "curl", "node", "php"];
//
//tools.forEach( function(tool) {
//    if (tool === "node" || tool === "php") {
//        version = " -v";
//    } else {
//        version = " -V";
//    }
//    exec(tool + version, (error, stdout, stderr) => {
//        if (error) {
//            console.log(`error: ${error.message}`);
//            return;
//        }
//        if (stderr) {
//            console.log(`stderr: ${stderr}`);
//            return;
//        }
//        console.log(`stdout: ${stdout}`);
//    });
//});