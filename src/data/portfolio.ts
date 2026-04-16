export interface Project {
	id: string;
	title: string;
	description: string;
	longDescription?: string;
	skills: string[];
	links: {
		github?: string;
		demo?: string;
		website?: string;
	};
	impact?: {
		metric: string;
		description: string;
	};
	imageUrl?: string;
	order: number;
}

export const projects: Project[] = [
	{
		id: 'weather-dashboard',
		title: 'Weather Dashboard',
		description: 'Real-time weather application with location search and 7-day forecast predictions.',
		skills: ['React', 'TypeScript', 'OpenWeather API', 'Tailwind CSS'],
		links: {
			github: 'https://github.com',
			demo: 'https://example.com',
		},
		impact: {
			metric: '50K+ users',
			description: '4.8-star rating with 500+ reviews',
		},
		order: 1,
	},
	{
		id: 'task-manager',
		title: 'Collaborative Task Manager',
		description: 'Team task management tool with real-time collaboration features, progress tracking, and notifications.',
		skills: ['Next.js', 'PostgreSQL', 'WebSockets', 'Prisma'],
		links: {
			github: 'https://github.com',
			demo: 'https://example.com',
		},
		impact: {
			metric: '200+ teams',
			description: '99.9% uptime, 100+ daily active users',
		},
		order: 2,
	},
	{
		id: 'analytics-dashboard',
		title: 'Analytics Dashboard',
		description: 'Interactive analytics dashboard for visualizing business metrics, KPIs, and real-time data insights.',
		skills: ['Vue.js', 'D3.js', 'Node.js', 'MongoDB'],
		links: {
			github: 'https://github.com',
			website: 'https://example.com',
		},
		impact: {
			metric: '60% faster',
			description: 'Reduced reporting time and improved decision-making',
		},
		order: 3,
	},
	{
		id: 'react-utils',
		title: 'React Utilities Library',
		description: 'Open-source library of composable utility functions and hooks for React development.',
		skills: ['TypeScript', 'React', 'Jest', 'npm'],
		links: {
			github: 'https://github.com',
			website: 'https://example.com',
		},
		impact: {
			metric: '100K+ weekly',
			description: 'Downloads from npm, trusted by developers worldwide',
		},
		order: 4,
	},
];
