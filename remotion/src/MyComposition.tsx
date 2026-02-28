import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const HelloWorld: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: {
            damping: 10.5,
        },
    });

    const scale = interpolate(entrance, [0, 1], [0.8, 1]);
    const opacity = interpolate(entrance, [0, 1], [0, 1]);

    return (
        <div
            style={{
                flex: 1,
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                color: '#fff',
                fontSize: '80px',
                fontWeight: 'black',
                padding: '100px',
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    textAlign: 'center',
                    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                }}
            >
                Vibes In Motion
            </div>

            {/* Subtle glow layer */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: -1,
                opacity: opacity
            }} />
        </div>
    );
};
