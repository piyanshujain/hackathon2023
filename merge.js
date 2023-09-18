const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Replace with your Azure Storage account connection string
const connectionString = '<YourConnectionString>';
// Define the list of container names
//  const containerNames = ['sa1', 'sa2', 'sa3', 'sa4', 'sa5', 'sa6'];
// const containerNames = ['con1', 'con2', 'con3', 'con4', 'con5', 'con6', 'con7', 'con8', 'con9', 'con10'];
// const containerNames = ['large5'];
// const containerNames = ['cont1', 'cont2', 'cont3', 'cont4', 'cont5', 'cont6', 'cont7', 'cont8', 'cont9', 'cont10', 'cont11', 'cont12', 'cont13', 'cont14', 'cont15', 'cont16', 'cont17', 'cont18', 'cont19', 'cont20'];
//  const containerNames = ['sac1', 'sac2', 'sac3'];
var containerNames = [];
// Define the number of containers you want
var numberOfContainers = 100; 
for (var i = 1; i <= numberOfContainers; i++) {
  containerNames.push("contain5" + i);
}

// Define a directory to save downloaded files
const downloadDirectory = 'downloaded_files';

async function downloadContainer(containerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobList = containerClient.listBlobsFlat();

  for await (const blob of blobList) {
    const blobClient = containerClient.getBlobClient(blob.name);
    const downloadPath = path.join(downloadDirectory, blob.name);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });

    // Download the blob to the specified path
    await blobClient.downloadToFile(downloadPath);
    console.log(`Downloaded: ${blob.name}`);
  }
}

async function downloadAllContainers() {
  try {
    const downloadPromises = containerNames.map((containerName) => downloadContainer(containerName));
    await Promise.all(downloadPromises);
    console.log('Download complete.');
    await recompileFilePieces(); //comment this line out if you are downloading a single file
  } catch (error) {
    console.error('Error:', error);
  }
}


// Define the output directory for the recompiled file
const outputDirectory = 'recompiled_files';

// Original file name
const originalFileName = 'resultant.mp4'; //replace with the name of file you want to recompile

// Function to recompile the file pieces
async function recompileFilePieces() {
  try {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Initialize an array to hold the file piece paths
    const piecePaths = [];

    // Iterate through the downloaded file pieces
    //for (const containerName of containerNames) {
      const containerPath = downloadDirectory;// path.join(downloadDirectory, containerName);

      // List all files in the container directory
      const files = fs.readdirSync(containerPath);

      // Sort the files numerically, assuming they are named piece_0, piece_1, piece_2, etc.
      files.sort((a, b) => {
        const numA = parseInt(a.split('_')[1]);
        const numB = parseInt(b.split('_')[1]);
        return numA - numB;
      });

      // Add the full file paths to the array
      const containerPiecePaths = files.map((fileName) => path.join(containerPath, fileName));
      piecePaths.push(...containerPiecePaths);
   // }

    // Create a writable stream for the recompiled file
    const outputFileStream = fs.createWriteStream(path.join(outputDirectory, originalFileName), { flags: 'a' });

    // Iterate through the file pieces and append them to the recompiled file
    for (const piecePath of piecePaths) {
      const pieceContent = fs.readFileSync(piecePath);

      // Append the piece content to the output file
      outputFileStream.write(pieceContent);
    }

    // Close the output file stream
    outputFileStream.end();

    console.log('File recompiled successfully.');
  } catch (error) {
    console.error('Error recompiling file:', error);
  }
}

// Call the function to download all containers
downloadAllContainers();
