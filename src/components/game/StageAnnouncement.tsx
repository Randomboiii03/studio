
"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface StageAnnouncementProps {
    message: string;
    icon: React.ElementType;
    onComplete: () => void;
}

const StageAnnouncement: React.FC<StageAnnouncementProps> = ({ message, icon: Icon, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 5000); // Duration of the animation

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className={cn(
                "absolute top-0 right-0 flex items-center gap-3 w-80 p-3 rounded-lg border bg-background/80 backdrop-blur-sm animate-announcement-fade"
            )}
        >
            <Icon className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
                <p className="font-mono text-sm text-primary">{message}</p>
            </div>
        </div>
    );
};

export default StageAnnouncement;

    