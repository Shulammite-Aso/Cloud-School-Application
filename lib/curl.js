const {execSync} = require('child_process');

module.exports.installCurl = (operatingSystem) => {
    let child;

    if (operatingSystem === "Linux") {

        child = execSync("sudo apt-get install curl", {'encoding': 'UTF-8', 'stdio': 'inherit'});

  } else if (operatingSystem === "Darwin") {

      child = execSync(`ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null   2> /dev/null`, {'encoding': 'UTF-8', 'stdio': 'inherit'});

      child = execSync("brew install curl", {'encoding': 'UTF-8', 'stdio': 'inherit'});
        
} else if ("Windows_NT") {
    const coco = execSync('coco -v', {'encoding': 'UTF-8'});

    if (!coco) {
    
      // First install chocolatey
      child = execSync("sudo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager] ::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient)  .DownloadString('https://chocolatey.org/install.ps1'))", {'encoding': 'UTF-8', 'stdio': 'inherit'});
    
    };
  
    child = execSync("choco install curl", {'encoding': 'UTF-8', 'stdio': 'inherit'});

};

};