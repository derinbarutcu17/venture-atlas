import type { Startup } from '../types';

export interface TreemapNode {
    name: string;
    value?: number;
    children?: TreemapNode[];
    color?: string;
    id?: string;
    url?: string;
}

export function transformStartupsToHierarchy(startups: Startup[]): TreemapNode {
    const root: TreemapNode = {
        name: 'Ecosystem',
        children: []
    };

    const sectorMap: Record<string, TreemapNode> = {};

    startups.forEach(startup => {
        if (!sectorMap[startup.sector]) {
            sectorMap[startup.sector] = {
                name: startup.sector,
                children: []
            };
            root.children!.push(sectorMap[startup.sector]);
        }

        const sectorNode = sectorMap[startup.sector];

        // Let's also group by vertical
        let verticalNode = sectorNode.children!.find(c => c.name === startup.vertical);
        if (!verticalNode) {
            verticalNode = {
                name: startup.vertical,
                children: []
            };
            sectorNode.children!.push(verticalNode);
        }

        verticalNode.children!.push({
            id: startup.id,
            name: startup.name,
            value: startup.funding,
            url: startup.url
        });
    });

    return root;
}
