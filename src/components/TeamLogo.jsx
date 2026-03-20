import React, { useState } from 'react';
import { getTeamInfo } from '../data/teams';

/**
 * Renders a team's logo image, falling back to a coloured circle with
 * abbreviation text if the image fails to load or doesn't exist.
 *
 * size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export default function TeamLogo({ teamKey, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const info = getTeamInfo(teamKey);

  const sizeMap = {
    xs: { outer: 'w-5 h-5',  text: 'text-[7px]'  },
    sm: { outer: 'w-7 h-7',  text: 'text-[9px]'  },
    md: { outer: 'w-9 h-9',  text: 'text-xs'     },
    lg: { outer: 'w-14 h-14', text: 'text-sm'    },
    xl: { outer: 'w-20 h-20', text: 'text-base'  },
  };
  const { outer, text } = sizeMap[size] || sizeMap.md;

  // Logo path: /teams/{teamKey}.png  (served from public/teams/)
  const logoSrc = `${import.meta.env.BASE_URL}teams/${teamKey}.png`;

  if (!imgFailed) {
    return (
      <img
        src={logoSrc}
        alt={info.name}
        title={info.name}
        className={`${outer} object-contain flex-shrink-0 ${className}`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  // Fallback: coloured circle
  return (
    <div
      className={`${outer} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: info.colors.primary }}
      title={info.name}
    >
      <span className={text}>{info.abbr.substring(0, 3)}</span>
    </div>
  );
}
