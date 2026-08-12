import React from 'react';
import { User } from '../../types/task';

interface AvatarStackProps {
  users: User[];
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showInviteBadge?: boolean;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  maxCount = 4,
  size = 'md',
  showInviteBadge = false,
}) => {
  const visibleUsers = users.slice(0, maxCount);
  const remainingCount = users.length - maxCount;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  const overlapStyle = {
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
  }[size];

  return (
    <div className="avatar-stack flex items-center">
      {visibleUsers.map((user, idx) => (
        <div
          key={user.id || idx}
          className={`avatar-item relative inline-block rounded-full overflow-hidden border-2 border-white shadow-sm transition-transform hover:z-20 ${
            idx > 0 ? overlapStyle : ''
          } ${sizeClasses}`}
          title={user.name}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback SVG avatar if image fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
            }}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={`avatar-more rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center border-2 border-white shadow-sm z-10 ${overlapStyle} ${sizeClasses}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
