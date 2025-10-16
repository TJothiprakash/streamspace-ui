import { useState, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import VideoService from "../services/VideoService";

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a video file to upload");
      return;
    }

    if (!user) {
      setError("You must be logged in to upload videos");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");
    setMessage("");

    try {
      // Step 1: Get presigned URL from backend
      setMessage("Getting upload URL...");
      const presignResult = await VideoService.getPresignedUrl(
        file.name,
        user.userId,
        isPrivate,
        title,
        description
      );

      if (!presignResult.success) {
        setError(presignResult.message);
        setIsUploading(false);
        return;
      }

      const { videoId, presignedUrl, s3Key } = presignResult;

      if (!presignedUrl) {
        setError("Failed to get upload URL. Please try again.");
        setIsUploading(false);
        return;
      }

      // Step 2: Upload file directly to Wasabi
      setMessage("Uploading video to storage...");
      const uploadResult = await uploadFileToWasabi(file, presignedUrl);

      if (!uploadResult.success) {
        setError(uploadResult.message);
        setIsUploading(false);
        return;
      }

      // Step 3: Notify backend upload complete
      setMessage("Notifying backend of upload completion...");
      const notifyResult = await VideoService.notifyUpload(videoId, s3Key);

      if (!notifyResult.success) {
        setError(notifyResult.message);
        setIsUploading(false);
        return;
      }

      setMessage(
        "✅ Video uploaded successfully! It will be processed shortly."
      );
      setUploadProgress(100);

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setIsPrivate(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Streamed upload with progress + Wasabi headers
  const uploadFileToWasabi = (file, presignedUrl) => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            message: `Upload failed with status: ${xhr.status}`,
          });
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          message: "Network error occurred during upload",
        });
      };

      xhr.open("PUT", presignedUrl);

      // ✅ Must match backend presigned headers
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      xhr.setRequestHeader("x-amz-acl", "public-read");
      xhr.setRequestHeader(
        "host",
        "streamspace08.s3.ap-southeast-2.wasabisys.com"
      );

      xhr.send(file);
    });
  };

  return (
    <div className="upload-container">
      <h2>Upload Video</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="info-message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Video File:</label>
          <input
            type="file"
            id="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            required
            disabled={isUploading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={isUploading}
            />
            Private Video
          </label>
        </div>

        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="progress-text">{uploadProgress}%</div>
          </div>
        )}

        <button type="submit" disabled={isUploading} className="upload-button">
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default UploadVideo;
