import React, { useState, useEffect } from 'react';

export interface CompanyIconProps {
  name: string;
  logo?: string;
  className?: string;
  website?: string;
  linkedin?: string;
  size?: number;
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const CompanyIcon: React.FC<CompanyIconProps> = ({ name, logo, className, website, linkedin, size }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [website, linkedin, logo]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getImgSrc = () => {
    if (website && website.trim() !== '') {
      return `https://www.google.com/s2/favicons?domain=${getDomain(website)}&sz=128`;
    }
    if (linkedin && linkedin.trim() !== '') {
      return `https://www.google.com/s2/favicons?domain=${getDomain(linkedin)}&sz=128`;
    }
    if (logo) return logo;
    return null;
  };

  const imgSrc = getImgSrc();
  
  const customStyle: React.CSSProperties = { margin: '0 auto' };
  if (size) {
    customStyle.width = size;
    customStyle.height = size;
    customStyle.minWidth = size;
    customStyle.minHeight = size;
    customStyle.fontSize = Math.max(10, size * 0.4);
    customStyle.borderRadius = size <= 24 ? '6px' : '10px';
  }

  return (
    <div className={`company-icon ${className || ''}`} style={customStyle}>
      {imgSrc && !imageError ? (
        <img 
          src={imgSrc} 
          alt={name} 
          className="company-logo" 
          onError={() => setImageError(true)}
          style={{ borderRadius: customStyle.borderRadius || '10px' }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
