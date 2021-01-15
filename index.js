#!/usr/bin/env node

const { execSync } = require("child_process");
const os = require('os');

const { installNode } = require("./lib/node");
const { installCurl } = require("./lib/curl");
const { installWget } = require("./lib/wget")

const operatingSystem = os.type();
const checkToolVersions = [ "node -v", "curl -V", "wget -V"];
let isInstalled;

// Check if any of the tools is installed by checking their versions

checkToolVersions.forEach((tool) => {
    isInstalled = execSync(tool, {'encoding': 'UTF-8'});
    
    if (!isInstalled && tool === "node -v") {

        installNode(operatingSystem);

    } else if (!isInstalled && tool === "curl -V") {

        installCurl(operatingSystem);

    } else if (!isInstalled && tool === "wget -V") {

        installWget(operatingSystem);
    }
});
