import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`block max-w-7xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${className}`}>
            <main>{children}</main>
        </div>
    );
}