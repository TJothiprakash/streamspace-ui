import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import VideoService from "../services/VideoService";
import { useAuth } from "../auth/AuthContext";

const WatchVideo = () => {
  const { videoId } = useParams();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadVideo();
    }
  }, [user, videoId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError("");

      // Get streaming URL from backend
      const result = await VideoService.getStreamingUrl(videoId);
      console.log("Backend response:", result);

      if (result.success && result.streamingUrl) {
        // Validate the URL before setting it
        try {
          new URL(result.streamingUrl);
          setVideoUrl(result.streamingUrl);
          console.log("Streaming URL:", result.streamingUrl);

          // Set placeholder video info since we don't have an endpoint to fetch it
          setVideoInfo({
            id: videoId,
            title: `Video ${videoId}`,
            description: "This is a sample video description",
            createdAt: new Date().toISOString(),
          });
        } catch (urlError) {
          setError("Invalid streaming URL received from server");
          console.error("Invalid URL:", result.streamingUrl, urlError);
        }
      } else {
        setError(result.message || "Failed to get valid streaming URL");
        console.error("Failed to get streaming URL:", result);
      }
    } catch (err) {
      setError("Failed to load video");
      console.error("Error loading video:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="watch-video-container">
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading video...</div>
      ) : (
        <>
          <div className="video-player-container">
            <video
              ref={videoRef}
              controls
              className="video-player"
              poster={videoInfo?.thumbnailUrl || ""}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {videoInfo && (
            <div className="video-details">
              <h2>{videoInfo.title}</h2>
              <p className="video-description">{videoInfo.description}</p>
              <div className="video-meta">
                <span>Uploaded on: {formatDate(videoInfo.createdAt)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WatchVideo;
