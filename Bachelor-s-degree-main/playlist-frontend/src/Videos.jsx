import { useEffect, useState } from 'react';

const Videos = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetch('/api/videos', {
            headers: { Authorization: `Bearer YOUR_ACCESS_TOKEN` },
        })
            .then((response) => response.json())
            .then((data) => setVideos(data));
    }, []);

    return (
        <div>
            <h1>Your Videos</h1>
            {videos.map((video) => (
                <div key={video.id}>{video.title}</div>
            ))}
        </div>
    );
};

export default Videos;
