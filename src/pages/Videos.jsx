import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import VideoService from '../services/VideoService';
import { Link } from 'react-router-dom';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'private'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchVideos(currentPage);
  }, [user, activeTab, currentPage]);

  const fetchVideos = async (page) => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let result;
      switch (activeTab) {
        case 'my':
          result = await VideoService.getUserVideos(page, 10);
          break;
        case 'private':
          result = await VideoService.getPrivateVideos(page, 10);
          break;
        case 'all':
        default:
          result = await VideoService.getAllVideos(page, 10);
          break;
      }
      
      if (result.success) {
        setVideos(result.videos);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? 'pagination-button active' : 'pagination-button'}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        {pages}
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="videos-container">
      <div className="videos-navigation">
        <button 
          className={activeTab === 'all' ? 'nav-button active' : 'nav-button'}
          onClick={() => handleTabChange('all')}
        >
          Videos
        </button>
        <button 
          className={activeTab === 'my' ? 'nav-button active' : 'nav-button'}
          onClick={() => handleTabChange('my')}
        >
          My Videos
        </button>
        <button 
          className={activeTab === 'private' ? 'nav-button active' : 'nav-button'}
          onClick={() => handleTabChange('private')}
        >
          Private Videos
        </button>
      </div>

      <h2>
        {activeTab === 'all' && 'All Videos'}
        {activeTab === 'my' && 'My Videos'}
        {activeTab === 'private' && 'Private Videos'}
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="no-videos">
          <p>No videos found.</p>
          {activeTab === 'my' && (
            <Link to="/upload" className="upload-link">Upload your first video</Link>
          )}
        </div>
      ) : (
        <>
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-card">
                <Link to={`/watch/${video.id}`} className="video-link">
                  <div className="video-thumbnail">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} />
                    ) : (
                      <div className="placeholder-thumbnail">
                        <div className="play-icon">▶</div>
                      </div>
                    )}
                    <div className="video-duration">
                      {formatDuration(video.durationSeconds)}
                    </div>
                  </div>
                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>
                    <div className="video-meta">
                      <span className="video-date">{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Videos;
