import { BrowserWindow } from "electrobun/bun";

const DEV_SERVER_PORT = 3000;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

async function getMainViewUrl(): Promise<string> {
	// Always try the dev server first in development
	try {
		await fetch(DEV_SERVER_URL, { method: "HEAD" });
		console.log(`Using Nuxt dev server at ${DEV_SERVER_URL}`);
		return DEV_SERVER_URL;
	} catch {
		console.log("Nuxt dev server not running. Using production build.");
		return "views://mainview/index.html";
	}
}

const url = await getMainViewUrl();

const mainWindow = new BrowserWindow({
	title: "NHL Stats",
	url,
	frame: {
		width: 1200,
		height: 800,
		x: 100,
		y: 100,
	},
});

console.log("NHL Stats desktop app started!");
