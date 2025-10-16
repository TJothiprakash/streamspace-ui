import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const VideoService = {
  // Get presigned URL for video upload
  async getPresignedUrl(
    filename,
    uploadedBy,
    isPrivate = false,
    title = "",
    description = ""
  ) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/videos/presign`,
        {
          filename,
          uploadedBy,
          isPrivate,
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      console.log(response.data);
      console.log(response.data.url);
      console.log(response.data.videoId);
      console.log(response.data.s3Key);

      // Check if required data exists in response
      if (
        !response.data ||
        !response.data.presignedUrl ||
        !response.data.videoId ||
        !response.data.s3Key
      ) {
        return {
          success: false,
          message:
            "Incomplete response from server. Missing upload information.",
        };
      }

      return {
        success: true,
        videoId: response.data.videoId,
        presignedUrl: response.data.presignedUrl,
        s3Key: response.data.s3Key,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to get presigned URL",
      };
    }
  },

  // Notify backend after upload completion
  async notifyUpload(videoId, s3Key) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/videos/notify-upload`,
        {
          videoId,
          s3Key,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        message: "Upload notification sent",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to notify upload completion",
      };
    }
  },

  // Get all videos for a user with pagination
  async getUserVideos(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/videos/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      });

      return {
        success: true,
        videos: response.data.videos,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch user videos",
      };
    }
  },

  // Get all public videos with pagination
  async getAllVideos(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      });

      return {
        success: true,
        videos: response.data.videos,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch videos",
      };
    }
  },

  // Get private videos for a user with pagination
  async getPrivateVideos(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/videos/private`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      });

      return {
        success: true,
        videos: response.data.videos,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to fetch private videos",
      };
    }
  },

  // Get presigned URL for video streaming
  async getStreamingUrl(videoId) {
    try {
      const token = localStorage.getItem("token");
      console.log(`Requesting streaming URL for videoId: ${videoId}`);
      console.log(`API URL: ${API_BASE_URL}/api/videos/stream/${videoId}`);

      const response = await axios.get(
        `${API_BASE_URL}/api/videos/mp4/stream/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Streaming URL response:", response);

      // ✅ Handle both raw string or JSON response
      const url =
        typeof response.data === "string"
          ? response.data
          : response.data.presignedUrl;

      if (!url) {
        console.error("Invalid response structure:", response.data);
        return {
          success: false,
          message: "Invalid response from server. Missing presigned URL.",
        };
      }

      return {
        success: true,
        streamingUrl: url,
      };
    } catch (error) {
      console.error("Error getting streaming URL:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to get streaming URL",
      };
    }
  },
};

export default VideoService;
