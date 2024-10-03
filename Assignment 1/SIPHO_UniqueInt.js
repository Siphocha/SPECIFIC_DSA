const fs = require("fs");
const path = require("path"); //required for using write, read and execute permissions
const { performance } = require("perf_hooks"); //measures performance. module from node.js

class UniqueInt {
    constructor() {
        //Constructor function for holding all attributes results
        const outputDir = path.resolve(__dirname, "./results");
        if (!fs.existsSync(outputDir)) {

            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    //Main function for input and output
    processFile(inputFilePath, outputFilePath) {
        const startTime = performance.now(); // Start time for measuring run-time
        const startMemory = process.memoryUsage().heapUsed; // Initial memory usage

        try {
            //Different seen numbers for each file
            this.seenNumbers = new Array(2047).fill(false);

            const inputData = fs.readFileSync(inputFilePath, "utf-8");
            const lines = inputData.split("\n");
            const uniqueIntegers = [];

            lines.forEach((line) => {
                const parsedNum = this.readNextItemFromFile(line);
                if (parsedNum !== null) {
                    const index = parsedNum + 1023; // Shift range [-1023, 1023] to [0, 2046]
                    if (!this.seenNumbers[index]) {
                        this.seenNumbers[index] = true;
                        uniqueIntegers.push(parsedNum);
                    }
                }
            });

            this.sort(uniqueIntegers);
            this.writeOutputFile(outputFilePath, uniqueIntegers);

            //measure runtime after processing
            const finalMemory = process.memoryUsage().heapUsed;
            const endTime = performance.now();

            //Log memory
            console.log(`File Name: ${inputFilePath}`);
            console.log(`Memory: ${finalMemory - startMemory} bytes`);
            console.log(`Time: ${(endTime - startTime).toFixed(2)} ms`);

            // Catch and log any errors
        } catch (error) {
            console.error(`Error processing file: ${error.message}`);
        }
    }

    // Function to read and validate each line
    readNextItemFromFile(line) {
        // Trim whitespace from the beginning and end of the line
        const trimmedLine = line.trim();

        //empty line
        if (trimmedLine === "") {
            return null;
        }

        return null;
    }

    //Bubble Sort algorithm for actually sorting the data
    sort(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            for (let n = 0; n < arr.length - i - 1; n++) {
                if (arr[n] > arr[n + 1]) {
                    const temp = arr[n];
                    arr[n] = arr[n + 1];
                    arr[n + 1] = temp;
                }
            }
        }
    }

    //Function puts output of Algorithm to pathway
    writeOutputFile(outputFilePath, uniqueIntegers) {
        const outputData = uniqueIntegers.join("\n");
        fs.writeFileSync(outputFilePath, outputData, "utf-8");
        console.log(`Results written to ${outputFilePath}`);
    }

    //taking multiple files at once
    processFiles(inputFolderPath, outputFolderPath) {
        const files = fs.readdirSync(inputFolderPath);
        files.forEach((file) => {

            const inputFilePath = path.join(inputFolderPath, file);
            const outputFilePath = path.join(outputFolderPath, file);
            this.processFile(inputFilePath, outputFilePath);

        });
    }
}

// Input/Output paths
const specialInt = new UniqueInt();
specialInt.processFiles(
    path.join(__dirname, "./inputs"),
    path.join(__dirname, "./results")
);