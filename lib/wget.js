const {execSync} = require('child_process');

module.exports.installWget = (operatingSystem) => {
    let child;

    if (operatingSystem === "Linux") {
        let linuxDistro = execSync('uname -v', {'encoding': 'UTF-8'});

        // Check the Linux distro, then use the appropraite command to install wget
        if (linuxDistro.match(/Ubuntu/i) || linuxDistro.match(/Debian/i)) {

            child = execSync("sudo apt-get install wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});

        } else if (linuxDistro.match(/Fedora/i) || linuxDistro.match(/CentOS/i) || linuxDistro.match(/RHEL/i)) {

            child = execSync("sudo yum install wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});

        } else if (linuxDistro.match(/ArchLinux/i)) {

            child = execSync("pacman -Sy wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});

        } else if (linuxDistro.match(/OpenSUSE/i)) {
            child = execSync("zypper install wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});
        }


  } else if (operatingSystem === "Darwin") {

      child = execSync("brew install wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});
        
  } else if ("Windows_NT") {
  const coco = execSync('coco -v', {'encoding': 'UTF-8'});

    if (!coco) {

      // First install chocolatey
      child = execSync("sudo Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]   ::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient)  .DownloadString('https://chocolatey.org/install.ps1'))", {'encoding': 'UTF-8', 'stdio': 'inherit'});

    };

  child = execSync("choco install wget", {'encoding': 'UTF-8', 'stdio': 'inherit'});

};

};
