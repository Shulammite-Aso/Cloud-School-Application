const { execSync} = require('child_process');

module.exports.installNode = (operatingSystem) => {
    let child;

    if(operatingSystem === "Linux") {
        const installNVM = "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash";
        const loadNVM = `export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"`;

        // First install and load node version manager (NVM)

        child = execSync(installNVM + " && " + loadNVM, {'encoding': 'UTF-8', 'stdio': 'inherit'});
        
          // Install node using NVM

          child = execSync("nvm install node", {'encoding': 'UTF-8', 'stdio': 'inherit'});

    } else if (operatingSystem === "Darwin") {

        child = execSync("brew install node", {'encoding': 'UTF-8', 'stdio': 'inherit'});
        
    } else if (operatingSystem === "Windows_NT") {

      // First install chocolatey
        child =execSync("sudo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))", {'encoding': 'UTF-8', 'stdio': 'inherit'});
          
          // Install node with chocolatey

          child = execSync("cinst nodejs.install", {'encoding': 'UTF-8', 'stdio': 'inherit'});

    }

    };

