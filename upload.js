const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Replace with your Azure Storage account connection string
const connectionString = '<YourConnectionString>';
// Define the directory containing the files you want to upload
const uploadDirectory = 'output_pieces';

// Define the names of the 8 containers
//const containerNames = ['sac51', 'sac52', 'sac53'];
// const containerNames = ['con51', 'con52', 'con53', 'con54', 'con55', 'con56', 'con57', 'con58', 'con59', 'con510'];
//const containerNames = ['cont51', 'cont52', 'cont53', 'cont54', 'cont55', 'cont56', 'cont57', 'cont58', 'cont59', 'cont10', 'cont11', 'cont12', 'cont13', 'cont14', 'cont15', 'cont16', 'cont17', 'cont18', 'cont19', 'cont20'];
// Initialize the BlobServiceClient
var containerNames = [];

// Define the number of containers you want
var numberOfContainers = 100; // Change this value to the desired number of containers

// Use a for loop to populate the array
for (var i = 1; i <= numberOfContainers; i++) {
  containerNames.push('contain5' + i);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
// const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadFilesToContainers() {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // List all files in the upload directory
    const files = fs.readdirSync(uploadDirectory);

    // Calculate the number of files to put in each container
    const filesPerContainer = Math.ceil(files.length / containerNames.length);

    for (let i = 0; i < containerNames.length; i++) {
      const containerName = containerNames[i];
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Create the container if it doesn't exist
      await containerClient.createIfNotExists();

      // Select files for the current container based on index range
      const startIndex = i * filesPerContainer;
      const endIndex = Math.min(startIndex + filesPerContainer, files.length);
      const filesToUpload = files.slice(startIndex, endIndex);

      // Upload each file to the current container
      for (const fileName of filesToUpload) {
        const filePath = path.join(uploadDirectory, fileName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        // Upload the file to the container
        await blockBlobClient.uploadFile(filePath);
        console.log(`Uploaded ${fileName} to ${containerName}`);
      }
    }

    console.log('Upload complete.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to upload files to containers
uploadFilesToContainers();
