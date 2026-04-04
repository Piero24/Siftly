import React, { useState, useEffect } from 'react';
import {
  getIconBackgroundColor,
  NEUTRAL_ICON_BACKGROUND,
} from '../../lib/iconColor';

export interface CompanyIconProps {
  name: string;
  logo?: string;
  className?: string;
  website?: string;
  linkedin?: string;
  size?: number;
  useAverageBg?: boolean;
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const CompanyIcon: React.FC<CompanyIconProps> = ({
  name,
  logo,
  className,
  website,
  linkedin,
  size,
  useAverageBg = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    useAverageBg ? NEUTRAL_ICON_BACKGROUND : 'var(--apple-blue)'
  );

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
  const cacheSource = website?.trim() || linkedin?.trim() || logo?.trim() || imgSrc || '';

  useEffect(() => {
    let isMounted = true;
    const fallback = useAverageBg ? NEUTRAL_ICON_BACKGROUND : 'var(--apple-blue)';
    setBackgroundColor(fallback);

    if (!useAverageBg || !imgSrc || imageError) {
      return () => {
        isMounted = false;
      };
    }

    getIconBackgroundColor(imgSrc, {
      cacheSource,
      fallbackColor: NEUTRAL_ICON_BACKGROUND,
    }).then((color) => {
      if (isMounted) {
        setBackgroundColor(color);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cacheSource, imageError, imgSrc, useAverageBg]);
  
  const iconBorderRadius = size && size <= 24 ? '6px' : '10px';
  const customStyle: React.CSSProperties = { margin: '0 auto', backgroundColor };
  if (size) {
    customStyle.width = size;
    customStyle.height = size;
    customStyle.minWidth = size;
    customStyle.minHeight = size;
    customStyle.fontSize = Math.max(10, size * 0.4);
    customStyle.borderRadius = iconBorderRadius;
  } else {
    customStyle.borderRadius = iconBorderRadius;
  }

  const rootClassName = `company-icon ${useAverageBg ? 'company-icon--soft' : ''} ${className || ''}`.trim();

  return (
    <div className={rootClassName} style={customStyle}>
      {imgSrc && !imageError ? (
        useAverageBg ? (
          <div className="company-logo-frame" style={{ borderRadius: size && size <= 24 ? '4px' : '7px' }}>
            <img
              src={imgSrc}
              alt={name}
              className="company-logo"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={name}
            className="company-logo"
            onError={() => setImageError(true)}
            style={{ borderRadius: iconBorderRadius }}
          />
        )
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
