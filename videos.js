document.addEventListener("DOMContentLoaded", async () => {
  const videosContainer = document.getElementById("videosContainer");

  const query = `
        {
            videos {
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

  try {
    const response = await fetch("https://upload-simple-backend.onrender.com/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    });

    const { data } = await response.json();

    if (data && data.videos) {
      data.videos.forEach((video) => {
        const videoItem = document.createElement("div");
        videoItem.className = "video-item";
        videoItem.innerHTML = `
                    <h2>${video.title}</h2>
                    <p>${video.description}</p>
                    <p>Duration: ${video.duration} seconds</p>
                    <video controls>
                        <source src="${video.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
        videosContainer.appendChild(videoItem);
      });
    } else {
      videosContainer.innerHTML = "<p>No videos found.</p>";
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    videosContainer.innerHTML = "<p>Error fetching videos.</p>";
  }
});
