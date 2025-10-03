import React from 'react';
import { UserSettings } from '../../types';
import { UserIcon } from './Icons';
import { PRESET_AVATAR_COMPONENTS } from './PresetAvatars';

interface AvatarProps {
  userSettings: UserSettings;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ userSettings, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-24 h-24 text-3xl',
  };

  const baseClasses = `rounded-full flex items-center justify-center font-bold object-cover flex-shrink-0`;

  if (userSettings.avatar) {
    if (userSettings.avatar.type === 'custom') {
      return (
        <img
          src={userSettings.avatar.value}
          alt={userSettings.name}
          className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        />
      );
    }
    if (userSettings.avatar.type === 'preset') {
      const AvatarComponent = PRESET_AVATAR_COMPONENTS[userSettings.avatar.value];
      if (AvatarComponent) {
        return <AvatarComponent className={`${baseClasses} ${sizeClasses[size]} ${className}`} />;
      }
    }
  }

  // Fallback to initials or icon
  const initials = getInitials(userSettings.name);
  if (initials && initials !== '?') {
    return (
      <div
        className={`${baseClasses} ${sizeClasses[size]} bg-primary/20 text-primary ${className}`}
      >
        {initials.toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} bg-surface-container text-on-surface-variant ${className}`}
    >
      <UserIcon className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;