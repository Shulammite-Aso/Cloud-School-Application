## Technical Assessment for She Code Africa Cloud School Application
**A Command-line interface (CLI) application**

I used nodejs to build this. And in this repository, i have:

-- Created a **lib** folder. And inside the folder, i have the code that installs the tools: node, curl, and wget.
The code takes the operating system of the user as an argument, and runs the appropraite command for install the given tool for that particular OS, and the distribution of the OS where this applies.

-- Checks if any of the tools: node, curl and wget is installed. This happens in the index.js file, If they're not installed yet, it runs calls the function for installing that particular tool, this is after requiring the file where the function has been defined.

-- In places where an additional software is needed to install a package, it installs the software first before installing the package. e.g installing **chocolatey** to be able to install __curl__ from the command line on windows.