
class SparseMatrix:
    def __init__(self, matrixFilePath=None, numRows=0, numCols=0):
        self.rows = numRows
        self.cols = numCols
        self.elements = {}
        if matrixFilePath:
            self.load_from_file(matrixFilePath)

    def load_from_file(self, matrixFilePath):
        try:
            with open(matrixFilePath, 'r') as f:
                self.rows = int(f.readline().strip().split('=')[1])
                self.cols = int(f.readline().strip().split('=')[1])
                for line in f:
                    line = line.strip()
                    if line:  # Ignore empty lines
                        line = line.strip('() ')
                        row, col, value = map(int, line.split(','))
                        self.setElement(row, col, value)
            print(f"Matrix loaded from: {matrixFilePath}")  # Confirmation message
        except FileNotFoundError:
            print(f"File {matrixFilePath} not found.")
            exit(1)
        except ValueError:
            print("Error processing the matrix file.")
            exit(1)

    def setElement(self, row, col, value):
        if value != 0:
            self.elements[(row, col)] = value

    def getElement(self, row, col):
        return self.elements.get((row, col), 0)

    def add(self, other):
        result = SparseMatrix(numRows=max(self.rows, other.rows), numCols=max(self.cols, other.cols))
        for (row, col), value in self.elements.items():
            result.setElement(row, col, value + other.getElement(row, col))
        
        for (row, col), value in other.elements.items():
            if (row, col) not in self.elements:
                result.setElement(row, col, value)
        
        return result

    def subtract(self, other):
        result = SparseMatrix(numRows=max(self.rows, other.rows), numCols=max(self.cols, other.cols))
        for (row, col), value in self.elements.items():
            result.setElement(row, col, value - other.getElement(row, col))
        
        for (row, col), value in other.elements.items():
            if (row, col) not in self.elements:
                result.setElement(row, col, -value)
        
        return result

    def multiply(self, other):
        if self.cols != other.rows:
            raise ValueError("Cannot multiply: The number of columns in Matrix 1 must equal the number of rows in Matrix 2.")

        result = SparseMatrix(numRows=self.rows, numCols=other.cols)
        for (row, col), value in self.elements.items():
            for k in range(other.cols):
                if self.getElement(row, col) != 0 and other.getElement(col, k) != 0:
                    result.setElement(row, k, result.getElement(row, k) + value * other.getElement(col, k))
        return result


def main():
    print("Welcome to the Sparse Matrix Operations Program.")

    # Hardcoded file paths for testing
    matrix1_file_path = r"./inputs/eg1.txt"
    matrix2_file_path = r"./inputs/eg2.txt"

    # Initialize matrices
    try:
        matrix1 = SparseMatrix(matrix1_file_path)
        matrix2 = SparseMatrix(matrix2_file_path)
    except Exception as e:
        print(e)
        return

    # Select operation
    print("Select operation to perform:")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    operation = input("Enter your choice (1/2/3): ")

    if operation == '1':
        try:
            result_matrix = matrix1.add(matrix2)
            print("Result of Addition:")
        except Exception as e:
            print(f"An error occurred during the operation: {e}")
            return
    elif operation == '2':
        try:
            result_matrix = matrix1.subtract(matrix2)
            print("Result of Subtraction:")
        except Exception as e:
            print(f"An error occurred during the operation: {e}")
            return
    elif operation == '3':
        try:
            result_matrix = matrix1.multiply(matrix2)
            print("Result of Multiplication:")
        except ValueError as ve:
            print(f"An error occurred during the operation: {ve}")
            return
    else:
        print("Invalid operation selected.")
        return

    # Display result (for now, just displaying the non-zero elements)
    for (row, col), value in result_matrix.elements.items():
        print(f"({row}, {col}, {value})")


if __name__ == "__main__":
    main()
