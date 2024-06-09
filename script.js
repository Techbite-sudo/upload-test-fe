// Set your cloud name and unsigned upload preset here:
const CLOUD_NAME = "dyxrrljec";
const UPLOAD_PRESET = "vkio02u8";

const videoInput = document.getElementById("videoInput");
const uploadButton = document.getElementById("uploadButton");
const serverUploadButton = document.getElementById("serverUploadButton");
const responseDiv = document.getElementById("response");

let videoFile = null;
let cloudinaryResponse = null;

videoInput.addEventListener("change", (event) => {
  videoFile = event.target.files[0];
  uploadButton.disabled = !videoFile;
});

uploadButton.addEventListener("click", async () => {
  uploadButton.disabled = true;

  const uniqueUploadId = generateUniqueUploadId();
  const chunkSize = 10 * 1024 * 1024; // Increased chunk size to 10 MB
  const totalChunks = Math.ceil(videoFile.size / chunkSize);

  const uploadChunk = async (start, end) => {
    const formData = new FormData();
    formData.append("file", videoFile.slice(start, end));
    formData.append("cloud_name", CLOUD_NAME);
    formData.append("upload_preset", UPLOAD_PRESET);
    const contentRange = `bytes ${start}-${end - 1}/${videoFile.size}`;

    console.log(
      `Uploading chunk for uniqueUploadId: ${uniqueUploadId}; start: ${start}, end: ${
        end - 1
      }`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "X-Unique-Upload-Id": uniqueUploadId,
          "Content-Range": contentRange,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Chunk upload failed.");
    }

    return response.json();
  };

  const uploadChunks = async () => {
    const promises = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, videoFile.size);
      promises.push(uploadChunk(start, end));
    }

    try {
      const responses = await Promise.all(promises);
      cloudinaryResponse = responses[responses.length - 1]; // Assuming the last chunk contains the complete response
      console.info("File upload complete.");
      serverUploadButton.disabled = false;
    } catch (error) {
      console.error("Error uploading chunks:", error);
    }
  };

  uploadChunks();
});

serverUploadButton.addEventListener("click", async () => {
  serverUploadButton.disabled = true;

  const {
    secure_url: videoURL,
    duration,
    secure_url: thumbnailURL,
  } = cloudinaryResponse;

  const query = `
    mutation {
      uploadVideo(
        input: {
          title: "Video Title"
          description: "Video Description"
          duration: ${Math.round(duration)}
          thumbnailUrl: "${thumbnailURL}"
          file: "${videoURL}"
        }
      ) {
        id
        title
        description
        duration
        thumbnailUrl
        videoUrl
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch("http://localhost:8080/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  });

  const data = await response.json();
  responseDiv.innerHTML = `<p>Upload response:</p><pre>${JSON.stringify(
    data,
    null,
    2
  )}</pre>`;
});

const generateUniqueUploadId = () => {
  return `uqid-${Date.now()}`;
};

// // Set your cloud name and unsigned upload preset here:
// const CLOUD_NAME = "dyxrrljec";
// const UPLOAD_PRESET = "vkio02u8";

// const videoInput = document.getElementById("videoInput");
// const uploadButton = document.getElementById("uploadButton");
// const serverUploadButton = document.getElementById("serverUploadButton");
// const responseDiv = document.getElementById("response");

// let videoFile = null;
// let cloudinaryResponse = null;

// videoInput.addEventListener("change", (event) => {
//   videoFile = event.target.files[0];
//   uploadButton.disabled = !videoFile;
// });

// uploadButton.addEventListener("click", async () => {
//   uploadButton.disabled = true;

//   const uniqueUploadId = generateUniqueUploadId();
//   const chunkSize = 5 * 1024 * 1024;
//   const totalChunks = Math.ceil(videoFile.size / chunkSize);
//   let currentChunk = 0;

//   const uploadChunk = async (start, end) => {
//     const formData = new FormData();
//     formData.append("file", videoFile.slice(start, end));
//     formData.append("cloud_name", CLOUD_NAME);
//     formData.append("upload_preset", UPLOAD_PRESET);
//     const contentRange = `bytes ${start}-${end - 1}/${videoFile.size}`;

//     console.log(
//       `Uploading chunk for uniqueUploadId: ${uniqueUploadId}; start: ${start}, end: ${
//         end - 1
//       }`
//     );

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "X-Unique-Upload-Id": uniqueUploadId,
//             "Content-Range": contentRange,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Chunk upload failed.");
//       }

//       currentChunk++;

//       if (currentChunk < totalChunks) {
//         const nextStart = currentChunk * chunkSize;
//         const nextEnd = Math.min(nextStart + chunkSize, videoFile.size);
//         uploadChunk(nextStart, nextEnd);
//       } else {
//         const fetchResponse = await response.json();
//         cloudinaryResponse = fetchResponse;
//         console.info("File upload complete.");
//         serverUploadButton.disabled = false;
//       }
//     } catch (error) {
//       console.error("Error uploading chunk:", error);
//     }
//   };

//   const start = 0;
//   const end = Math.min(chunkSize, videoFile.size);
//   uploadChunk(start, end);
// });

// serverUploadButton.addEventListener("click", async () => {
//   serverUploadButton.disabled = true;

//   const {
//     secure_url: videoURL,
//     duration,
//     secure_url: thumbnailURL,
//   } = cloudinaryResponse;

//   const query = `
//     mutation {
//       uploadVideo(
//         input: {
//           title: "Video Title"
//           description: "Video Description"
//           duration: ${Math.round(duration)}
//           thumbnailUrl: "${thumbnailURL}"
//           file: "${videoURL}"
//         }
//       ) {
//         id
//         title
//         description
//         duration
//         thumbnailUrl
//         videoUrl
//         createdAt
//         updatedAt
//       }
//     }
//   `;

//   const response = await fetch("http://localhost:8080/query", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: query,
//     }),
//   });

//   const data = await response.json();
//   responseDiv.innerHTML = `<p>Upload response:</p><pre>${JSON.stringify(
//     data,
//     null,
//     2
//   )}</pre>`;
// });

// const generateUniqueUploadId = () => {
//   return `uqid-${Date.now()}`;
// };
