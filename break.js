const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to break a file into pieces with metadata
function splitFile(inputFile, outputDirectory, pieceSize) {
  try {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const fileStats = fs.statSync(inputFile);
    const totalFileSize = fileStats.size;
    const totalPieces = Math.ceil(totalFileSize / pieceSize);

    const fileExtension = path.extname(inputFile);

    const buffer = Buffer.alloc(pieceSize);
    const fileDescriptor = fs.openSync(inputFile, 'r');
    let bytesRead, pieceNumber = 0;

    while ((bytesRead = fs.readSync(fileDescriptor, buffer, 0, pieceSize, null)) !== 0) {
      const pieceFilePath = path.join(outputDirectory, `piece_${pieceNumber}`);
      
      // Create a piece metadata object for this piece
      const pieceMetadata = {
        pieceNumber,
        totalPieces,
        dataLength: bytesRead,
        pieceHash: crypto.createHash('sha256').update(buffer.slice(0, bytesRead)).digest('hex'),
      };

      // Serialize piece metadata to a JSON string
      const pieceMetadataJSON = JSON.stringify(pieceMetadata);

      // Create a new buffer for the piece data with metadata
      const pieceBuffer = Buffer.concat([
        Buffer.from(pieceMetadataJSON),
        Buffer.from('\n'), // Add a newline separator
        buffer.slice(0, bytesRead),
      ]);

      // Write the piece (including metadata and newline separator) to the output file
      fs.writeFileSync(pieceFilePath, pieceBuffer);

      pieceNumber++;
    }

    fs.closeSync(fileDescriptor);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

// Example usage
const inputFile = 'sample.mp4';  // Replace with your input file
const outputDirectory = 'output_pieces';  // Replace with the desired output directory
const pieceSize = 1024 * 1024;  // Set the piece size in bytes (e.g., 1 MB)

splitFile(inputFile, outputDirectory, pieceSize);
