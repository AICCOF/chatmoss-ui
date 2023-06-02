import fetch from "node-fetch";
import {
	getOctokit,
	context
} from "@actions/github";
import {
	resolveUpdateLog
} from "./updatelog.mjs";

const UPDATE_TAG_NAME = "updater";
const UPDATE_JSON_FILE = "update.json";

/// 生成 update.json 文件并更新 github updater release 中的文件
async function resolveUpdater() {
	if (process.env.GITHUB_TOKEN === undefined) {
		throw new Error("GITHUB_TOKEN is required");
	}

	const options = {
		owner: context.repo.owner,
		repo: context.repo.repo
	};
	const github = getOctokit(process.env.GITHUB_TOKEN);

	const {
		data: tags
	} = await github.rest.repos.listTags({
		...options,
		per_page: 10,
		page: 1,
	});

	const tag = tags.find((t) => t.name.startsWith("v"));

	console.log('tag',tag);

	const {
		data: latestRelease
	} = await github.rest.repos.getReleaseByTag({
		...options,
		tag: tag.name,
	});
	console.log('latestRelease', latestRelease);

	// 根据需要选择需更新的平台，应与编译脚本平台选择对应
	const updateData = {
		version: tag.name,
		notes: await resolveUpdateLog(tag.name),
		pub_date: new Date().toISOString(),
		platforms: {
			// comment out as needed
			"windows-x86_64": {
				signature: "",
				url: ""
			},
			// "darwin-aarch64": { signature: "", url: "" },
			"darwin-x86_64": {
				signature: "",
				url: ""
			},
			"linux-x86_64": {
				signature: "",
				url: ""
			},
		},
	};

	const promises = latestRelease.assets.map(async (asset) => {
		const {
			name,
			browser_download_url
		} = asset;

		// windows-x86_64 url
		if (name.endsWith(".msi.zip")) {
			updateData.platforms["windows-x86_64"].url = browser_download_url;
		}

		// windows-x86_64 signature
		if (name.endsWith(".msi.zip.sig")) {
			const sig = await getSignature(browser_download_url);
			updateData.platforms["windows-x86_64"].signature = sig;
		}

		// darwin-x86_64 url (macos intel)
		if (name.endsWith(".app.tar.gz") && !name.includes("aarch")) {
			updateData.platforms["darwin-x86_64"].url = browser_download_url;
		}
		// darwin-x86_64 signature (macos intel)
		if (name.endsWith(".app.tar.gz.sig") && !name.includes("aarch")) {
			const sig = await getSignature(browser_download_url);
			updateData.platforms["darwin-x86_64"].signature = sig;
		}

		// darwin-aarch64 url (macos silicon)
		if (name.endsWith("aarch64.app.tar.gz")) {
			updateData.platforms["darwin-aarch64"].url = browser_download_url;
		}

		// darwin-aarch64 signature (macos silicon)
		if (name.endsWith("aarch64.app.tar.gz.sig")) {
			const sig = await getSignature(browser_download_url);
			updateData.platforms["darwin-aarch64"].signature = sig;
		}

		// linux-x86_64 url
		if (name.endsWith(".AppImage.tar.gz")) {
			updateData.platforms["linux-x86_64"].url = browser_download_url;
		}
		// linux-x86_64 signature
		if (name.endsWith(".AppImage.tar.gz.sig")) {
			const sig = await getSignature(browser_download_url);
			updateData.platforms["linux-x86_64"].signature = sig;
		}
	});

	await Promise.allSettled(promises);
	console.log(updateData);

	Object.entries(updateData.platforms).forEach(([key, value]) => {
		if (!value.url) {
			console.log(`[Error]: failed to parse release for "${key}"`);
			delete updateData.platforms[key];
		}
	});

	// 更新 update.json 文件
	const {
		data: updateRelease
	} = await github.rest.repos.getReleaseByTag({
		...options,
		tag: UPDATE_TAG_NAME,
	});

	for (let asset of updateRelease.assets) {
		if (asset.name === UPDATE_JSON_FILE) {
			await github.rest.repos.deleteReleaseAsset({
				...options,
				asset_id: asset.id,
			});
		}
	}

	await github.rest.repos.uploadReleaseAsset({
		...options,
		release_id: updateRelease.id,
		name: UPDATE_JSON_FILE,
		data: JSON.stringify(updateData, null, 2),
	});
}

async function getSignature(url) {
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/octet-stream"
		},
	});

	return response.text();
}

resolveUpdater().catch(console.error);