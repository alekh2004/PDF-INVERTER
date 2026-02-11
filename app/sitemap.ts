import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://pdf-inverter.vercel.app' // User should update this if they get a custom domain

    const tools = [
        '',
        '/merge',
        '/split',
        '/compress',
        '/invert',
        '/organize',
        '/convert',
        '/page-numbers',
        '/optimize',
        '/sign',
    ]

    return tools.map((tool) => ({
        url: `${baseUrl}${tool}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: tool === '' ? 1 : 0.8,
    }))
}
