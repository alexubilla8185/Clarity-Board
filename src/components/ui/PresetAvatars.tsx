import React from 'react';

const Avatar1: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#60a5fa" />
        <circle cx="50" cy="50" r="35" fill="#3b82f6" />
        <circle cx="50" cy="50" r="20" fill="#93c5fd" />
    </svg>
);

const Avatar2: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#4ade80"/>
        <rect x="25" y="25" width="50" height="50" rx="10" fill="#22c55e"/>
        <rect x="40" y="40" width="20" height="20" rx="5" fill="#86efac"/>
    </svg>
);

const Avatar3: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#c084fc"/>
        <path d="M0 100 L50 0 L100 100 Z" fill="#a855f7"/>
        <path d="M25 100 L50 50 L75 100 Z" fill="#d8b4fe"/>
    </svg>
);

const Avatar4: React.FC<{ className?: string }> = ({ className }) => (
   <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#fb7185"/>
        <path d="M50,0 A50,50 0 0,1 100,50 L50,50 Z" fill="#f43f5e"/>
        <path d="M50,0 A50,50 0 0,0 0,50 L50,50 Z" fill="#fda4af"/>
    </svg>
);

const Avatar5: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#fb923c"/>
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#f97316" strokeWidth="10"/>
        <rect x="25" y="25" width="50" height="50" fill="none" stroke="#fdba74" strokeWidth="10"/>
    </svg>
);

const Avatar6: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#2dd4bf"/>
        <circle cx="25" cy="25" r="15" fill="#14b8a6"/>
        <circle cx="75" cy="25" r="15" fill="#14b8a6"/>
        <circle cx="25" cy="75" r="15" fill="#14b8a6"/>
        <circle cx="75" cy="75" r="15" fill="#14b8a6"/>
        <circle cx="50" cy="50" r="20" fill="#99f6e4"/>
    </svg>
);

export const PRESET_AVATAR_COMPONENTS: { [key: string]: React.FC<{ className?: string }> } = {
    'abstract-1': Avatar1,
    'abstract-2': Avatar2,
    'abstract-3': Avatar3,
    'abstract-4': Avatar4,
    'abstract-5': Avatar5,
    'abstract-6': Avatar6,
};

export const PRESET_AVATAR_KEYS = Object.keys(PRESET_AVATAR_COMPONENTS);