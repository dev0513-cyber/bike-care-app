import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  image,
  onClick,
  hoverable = false 
}) => {
  const cardClass = `card ${className} ${hoverable ? 'card-hoverable' : ''} ${onClick ? 'card-clickable' : ''}`;

  return (
    <div className={cardClass} onClick={onClick}>
      {image && (
        <div className="card-image">
          <img src={image} alt={title} />
        </div>
      )}
      <div className="card-content">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default Card;
