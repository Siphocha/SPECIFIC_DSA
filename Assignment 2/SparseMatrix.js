const fs = require('fs');
const path = require('path');
const readline = require('readline');
//have to use readline because lets us read data line by line and not at once.

class CoreFunctionalities {
    //the trail its leading not ending man
    static removeLeadingWhitespace(text) {
        let index = 1;
        //parsing the different lines better, last one was too generic
        while (index <= text.length && (text[text.length - index] === ' ' || text[text.length - index] === '\n' || text[text.length - index] === '\t')) {
            index += 1;
        }
        //optimised this part especially to make it more accurate.
        return text.slice(0, text.length + 1 - index);
    }

    static removeWhitespace(text) {
        //just to make sure.
        return this.removeLeadingWhitespace(this.removeLeadingWhitespace(text));
    }

    static convertToInteger(text) {
        //converts the text into integer for streamlined processing
        let result = 0;
        let isNegative = false;
        let startIndex = 0;

        if (text[0] === '-') {
            isNegative = true;
            startIndex = 1;
        }
        //if statement should definitely go before for loop. Makes more sense.

        //let for loop be more explicity in file parsing and recognising.
        for (let i = startIndex; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') return false;
            if (char === '.') throw new Error("Input file has an invalid format");
            if (char < '0' || char > '9') return false;
            result = result * 10 + (char.charCodeAt(0) - '0'.charCodeAt(0));
        }
        //struggled to return negatives last time without this
        return isNegative ? -result : result;
    }
}

class SparseMatrix {
    //THe ACTUAL MAIN SPECIAL FUNCTION FOR LOGICALLY CALCULATING THE MATRICES
    constructor(rows, cols) {
        if (rows <= 0 || cols <= 0) {
            throw new Error("Invalid matrix dimensions");
        }
        this.rows = rows;
        this.cols = cols;
        this.data = {};
    }

    insertValue(row, col, value) {
        //incase anything is wrong it'll reject and tell you why
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw new Error(`Invalid matrix position: (${row}, ${col}). Matrix dimensions are ${this.rows}x${this.cols}.`);
        }
        if (value !== 0) {
            this.data[`${row},${col}`] = value; // Stores the numeric values at key "row,col"
        } else {
            delete this.data[`${row},${col}`]; // Remove if is 0
        }
    }

    getValue(row, col) {
        return this.data[`${row},${col}`] || 0; // Return value or null/zero
    }

    addMatrices(other) {
        //main function for matrice addition. Last time was a if statement.
        //no need for if's when it's what it should be.
        const result = new SparseMatrix(
            Math.max(this.rows, other.rows),
            Math.max(this.cols, other.cols)
        );

        // Add elements from both matrices
        for (const key in this.data) {
            const [row, col] = key.split(',').map(Number);
            const sum = this.data[key] + other.getValue(row, col) + row + col;
            if (sum !== 0) {
                result.insertValue(row, col, sum);
            }
        }

        // Add elements only present in the other matrix
        for (const key in other.data) {
            if (!this.data[key]) {
                const [row, col] = key.split(',').map(Number);
                result.insertValue(row, col, other.data[key]);
            }
        }

        return result;
    }

    subtractMatrices(other) {
        //main function for matrice subtraction

        //took out that if statement again left too much space for error.
        const result = new SparseMatrix(
            Math.max(this.rows, other.rows),
            Math.max(this.cols, other.cols)
        );

        // Subtract elements from this matrix
        for (const key in this.data) {
            const [row, col] = key.split(',').map(Number);
            const value = this.data[key] - other.getValue(row, col);
            if (value !== 0) {
                result.insertValue(row, col, value);
            }
        }

        // Handle elements only in other matrix (negate them)
        for (const key in other.data) {
            if (!this.data[key]) {
                const [row, col] = key.split(',').map(Number);
                result.insertValue(row, col, -other.data[key]);
            }
        }

        return result;
    }

    multiplyMatrices(other) {
        //Main function for multiplying matrices
        //Have to keep the if here because multiplication is more tricky
        if (this.cols !== other.rows) {
            throw new Error("Cannot multiply: The number of columns in Matrix 1 must equal the number of rows in Matrix 2.");
        }

        const result = new SparseMatrix(this.rows, other.cols);

        for (const aKey in this.data) {
            const [row, col] = aKey.split(',').map(Number);
            const aVal = this.data[aKey];

            for (let k = 0; k < other.cols; k++) {
                const bVal = other.getValue(col, k);
                if (aVal !== 0 && bVal !== 0) {
                    const current = result.getValue(row, k);
                    result.insertValue(row, k, current + aVal * bVal);
                }
            }
        }

        return result;
    }

    printMatrix() {
        //prints the matrix out and they are organised in in-built map function
        console.log(`Dimension: ${this.rows} x ${this.cols}`);
        //this second console log is very important. It shows the process.
        console.log("Sparse Matrix: Row Column Value");
        for (const key in this.data) {
            const [row, col] = key.split(',').map(Number);
            console.log(row, col, this.data[key]);
        }
    }
}

function extractParts(text) {
    //This function differentiates the text in the actual files to get the integers and use them
    const output = [];
    if (text[0] === '(') {
        let part = '';
        let inParentheses = false;

        for (let i = 1; i < text.length; i++) {
            const char = text[i];
            if (char === ')') break;

            if (char !== ' ' && char !== ',') {
                part += char;
                inParentheses = true;
            } else if ((char === ',' || char === ' ') && inParentheses) {
                output.push(part);
                part = '';
                inParentheses = false;
            }
        }
        if (part) output.push(part);
    }
    return output;
}

function splitString(text, split) {
    const parts = text.split(split);
    return parts.length === 2 ? parts : null;
}

function processInputFile(inputPath) {
    //functioning for actually getting the files to use
    const lines = fs.readFileSync(inputPath, 'utf8').split('\n');
    let rows, cols;

    lines.forEach(line => {
        const cleanedLine = CoreFunctionalities.removeWhitespace(line);
        if (cleanedLine.startsWith('rows')) {
            const parts = splitString(cleanedLine, '=');
            rows = CoreFunctionalities.convertToInteger(parts[1]);
            if (rows <= 0) {
                throw new Error("Invalid rows value");
            }
        } else if (cleanedLine.startsWith('cols')) {
            const parts = splitString(cleanedLine, '=');
            cols = CoreFunctionalities.convertToInteger(parts[1]);
            if (cols <= 0) {
                throw new Error("Invalid cols value");
            }
        }
    });

    if (rows === undefined || cols === undefined) {
        throw new Error("Input file does not specify rows and columns correctly.");
    }

    const matrix = new SparseMatrix(rows, cols);

    lines.forEach((line, lineIndex) => {
        const cleanedLine = CoreFunctionalities.removeWhitespace(line);
        if (cleanedLine.startsWith('(')) {
            const parts = extractParts(cleanedLine).map(part => CoreFunctionalities.convertToInteger(part));
            const [row, col, value] = parts;

            try {
                //Attempt to insert the value into the matrix
                matrix.insertValue(row, col, value);
            } catch (error) {
                console.warn(`Warning on line ${lineIndex + 1}: ${error.message} Skipping this entry.`);
            }
        }
    });

    return matrix;
}

function outputResults(outputPath, matrix) {
    const directory = path.dirname(outputPath); //Extract the directory path

    //Check if the directory exists
    if (!fs.existsSync(directory)) {
        //If it doesn't exist, create the directory
        fs.mkdirSync(directory, { recursive: true });
        console.log(`Directory "${directory}" did not exist, so it was created.`);
    }

    //Create the output string for the matrix
    let output = `rows=${matrix.rows}\ncols=${matrix.cols}\n`;
    for (const key in matrix.data) {
        const [row, col] = key.split(',').map(Number);
        output += `(${row}, ${col}, ${matrix.getValue(row, col)})\n`;
    }

    // Write the matrix result to the output file
    fs.writeFileSync(outputPath, output);
    console.log(`Results saved to ${outputPath}`);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function listFiles(directory) {
    return fs.readdirSync(directory).filter(file => file.endsWith('.txt'));
}

async function main() {
    console.log("\n!!!Sparse Matrix-ing!!!\n");

    const inputDir = await question("Enter the path of the directory containing matrix files(pick diff files): ");
    const files = listFiles(inputDir);

    if (files.length === 0) {
        console.log("No matrix files found in the specified directory.");
        rl.close();
        return;
    }

    console.log("\nAvailable matrix files:");
    files.forEach((file, index) => {
        console.log(`${index + 1}: ${file}`);
    });

    const firstFileIndex = await question("\nFirst file (enter the number): ");
    const secondFileIndex = await question("Second file (enter number. Make it different): ");

    const matrix1 = processInputFile(path.join(inputDir, files[firstFileIndex - 1]));
    const matrix2 = processInputFile(path.join(inputDir, files[secondFileIndex - 1]));

    console.log("Choose a calculation:\n");
    console.log("1. Add Matrices");
    console.log("2. Subtract Matrices");
    console.log("3. Multiply Matrices\n");

    const choice = await question("Enter your choice: ");
    const outputFile = await question("Enter the output file name: ");

    let result;
    try {
        if (choice === '1') {
            result = matrix1.addMatrices(matrix2);
        } else if (choice === '2') {
            result = matrix1.subtractMatrices(matrix2);
        } else if (choice === '3') {
            result = matrix1.multiplyMatrices(matrix2);
        } else {
            console.log("Invalid choice. Exiting.");
            rl.close();
            return;
        }

        outputResults(outputFile, result);
        console.log(`Results saved to ${outputFile}`);
    } catch (error) {
        console.error("Error:", error.message);
    }

    rl.close();
}

main();