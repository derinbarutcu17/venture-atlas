import React from 'react';
import { Composition } from 'remotion';
import { HelloWorld } from './MyComposition';
import { Showcase } from './Showcase';

export const RemixRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Showcase"
                component={Showcase}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="MyVideo"
                component={HelloWorld}
                durationInFrames={120}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
