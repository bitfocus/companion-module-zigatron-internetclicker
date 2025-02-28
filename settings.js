import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// a naive .env file for overriding settings locally during development or testing
function loadDevEnv() {
	try {
		// Look for .env file in the module directory
		const directory = dirname(fileURLToPath(import.meta.url))
		const envPath = join(directory, '.env')

		if (existsSync(envPath)) {
			const envConfig = readFileSync(envPath, 'utf8')
				.split('\n')
				.filter((line) => line.trim() && !line.startsWith('#'))
				.reduce((acc, line) => {
					const [key, value] = line.split('=').map((part) => part.trim())
					acc[key] = value
					return acc
				}, {})
			return envConfig
		}
	} catch (error) {
		// Silently fail if there's an error reading the .env file
		return {}
	}
	return {}
}

const localSettings = loadDevEnv()

const settingsVal = {
	NumberOfPresenters: 10,
	BaseUrl: localSettings.BaseUrl || 'https://www.internetclicker.com',
}

export default settingsVal
