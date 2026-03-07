import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "NHL Stats",
		identifier: "nhlstats.electrobun.dev",
		version: "1.0.0",
	},
	build: {
		// Nuxt builds to dist/, we copy from parent project
		copy: {
			"../dist/player-stats/index.html": "views/mainview/index.html",
			"../dist/standings/index.html": "views/mainview/standings.html",
			"../dist/teams/index.html": "views/mainview/teams.html",
			"../dist/about/index.html": "views/mainview/about.html",
			"../dist/_nuxt": "views/mainview/_nuxt",
			"../dist/icons": "views/mainview/icons",
			"../dist/logos": "views/mainview/logos",
		},
		// Ignore Nuxt output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
