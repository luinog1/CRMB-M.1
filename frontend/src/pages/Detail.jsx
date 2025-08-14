import React from 'react';
import { useParams } from 'react-router-dom';

function Detail() {
  const { id } = useParams();

  return (
    <div className="detail-page">
      <h1>Content Detail</h1>
      <p>Details for content ID: {id}</p>
      <div className="content-details">
        <p>Content details will appear here</p>
      </div>
    </div>
  );
}

export default Detail;