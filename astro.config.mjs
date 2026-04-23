// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	image: {
		responsiveStyles: true,
		layout: 'constrained',
	},
	integrations: [
		mdx(),
		sitemap(),
		icon({
			include: {
				mdi: ['linkedin', 'email', 'weather-sunny', 'weather-night'],
			},
		}),
	],
});
