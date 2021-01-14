const { spawnSync} = require('child_process');

module.exports.installNode = (operatingSystem) => {
    let child;

    if(operatingSystem === "Linux") {
        const installNVM = "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash";
        const loadNVM = `export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"`;

        // First install node version manager (NVM)

        child = spawnSync(installNVM + " && " + loadNVM);
        
          
         child.on('error', (error) => {
            console("There was an error:", error);
            process.exit();
          });

          // Install node using NVM

          child = spawnSync("nvm install node");

          child.stdout.on('data', (data) => {
            console.log(data.toString());
          });
          
          child.stderr.on('data', (data) => {
            console.error(data.toString());
          });
          
          child.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
          });
        
    } else if (operatingSystem === "Darwin") {
        child = spawnSync("brew install node");
        
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
         child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });
          
         child.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
          });
        
    } else if (operatingSystem === "Windows_NT") {

      // First install chocolatey
        child = spawnSync("sudo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))");
          
         child.on('error', (error) => {
          console("There was an error:", error);
          process.exit();
          });

          // Install node with chocolatey

          child = spawnSync("cinst nodejs.install");

          child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
         child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });
          
         child.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
          });
    }

    };

