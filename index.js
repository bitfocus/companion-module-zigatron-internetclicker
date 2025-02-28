import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { HubConnectionState, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

import UpgradeScripts from './upgrades.js'
import UpdateActions from './actions/index.js'
import UpdateFeedbacks from './feedbacks/index.js'
import Variables from './variables.js'
import GetConfigFields from './config.js'
import Presets from './presets.js'
import Settings from './settings.js'
import { ConnectionState } from './enums.js'

// these are signalr dependencies that are loaded dynamically
import WebSocket from 'ws'
import EventSource from 'eventsource'
import ToughCookie from 'tough-cookie'
import FetchCookie from 'fetch-cookie'

// development builds do not have access to require and it works fine without this hack anyway
if (process.env.NODE_ENV === 'production') {
	const originalRequire = require;

	// SignalR has a dependency loading hack to workaround dynamic webpack builds so we need to 
	// override require so it can load these dependencies correctly
	const signalrRequireWrapper = (moduleName) => {
		if (moduleName === 'ws') return WebSocket
		if (moduleName === 'eventsource') return EventSource
		if (moduleName === 'tough-cookie') return ToughCookie
		if (moduleName === 'fetch-cookie') return FetchCookie
		// Fall back to original require for other modules
		return originalRequire?.(moduleName);
	};

	require = signalrRequireWrapper;
}


class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.logger = {
			info: (message) => this.log('info', message),
			debug: (message) => this.log('debug', message),
			warn: (message) => this.log('warn', message),
			error: (message) => this.log('error', message),
		}

		this.connection = null
		this.setupRoom()
	}

	setupRoom() {
		this.room = {
			controlPresenterAccess: false,
			users: [],
		}
	}

	async init(config) {
		this.logger.debug('Initializing internetclicker module')
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.setPresetDefinitions(Presets)

		await this.initConnection()
	}

	async reset() {
		this.setupRoom()
		await this.stopConnection()
		this.refreshVariablesAndFeedbacks()
	}

	// When module gets deleted
	async destroy() {
		await this.reset()
	}

	async configUpdated(config) {
		this.logger.debug('Config updated, setting up new connection')
		await this.reset()
		this.config = config
		await this.initConnection()
	}

	async stopConnection() {
		// if there is an active connection we should disconnect
		if (this.connection) {
			this.logger.info('Disconnecting from hub connection')
			await this.connection.stop()
			this.hubConnectionUpdated()
		}
	}

	hubConnectionUpdated() {
		Variables.Values[Variables.Keys.ConnectionState] = this.getHubConnectionState()
		// update feedback
		this.checkFeedbacks()
		this.setVariableValues(Variables.Values)
	}

	getHubConnectionState() {
		if (!this.connection) return ConnectionState.Disconnected

		switch (this.connection.state) {
			case HubConnectionState.Connected:
			case HubConnectionState.Disconnecting:
				return ConnectionState.Connected
			case HubConnectionState.Connecting:
			case HubConnectionState.Reconnecting:
				return ConnectionState.Connecting
			case HubConnectionState.Disconnected:
			default:
				return ConnectionState.Disconnected
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return GetConfigFields()
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		Variables.SetupDefinitions(this)
	}

	async initConnection() {
		const self = this

		if (!this.config.apikey || !this.config.code) {
			this.updateStatus(InstanceStatus.BadConfig)
		}

		this.logger.info(`Using base url ${Settings.BaseUrl}`)

		this.logger.info('Initializing hub connection')

		const apiKeyEncoded = encodeURIComponent(self.config.apikey)
		const codeEncoded = encodeURIComponent(self.config.code)

		await this.stopConnection()

		this.connection = new HubConnectionBuilder()
			.withUrl(`${Settings.BaseUrl}/keypresshub?isAccount=${codeEncoded}`, {
				headers: {
					'X-ConnectionCode': apiKeyEncoded,
				},
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Information)
			.build()

		this.connection.onreconnecting((error) => {
			self.logger.info('Reconnecting to service...')
			self.hubConnectionUpdated()
		})

		this.connection.onclose(async (error) => {
			//setTimeout(await start, 3000)
			self.hubConnectionUpdated()

			self.logger.info(`Hub connection closed`)

			if (!error) {
				return
			}

			const serverError = error?.message ?? ''

			self.logger.error(`Could not connect to service: ${serverError}`)

			let errorStatus = InstanceStatus.UnknownWarning
			let errorMessage = 'Connection not started'
			if (serverError.includes('Code not found')) {
				errorMessage = 'Code not found'
				errorStatus = InstanceStatus.BadConfig
			}

			if (serverError.includes('Must be logged in')) {
				errorMessage = 'Invalid key'
				errorStatus = InstanceStatus.BadConfig
			}

			self.updateStatus(errorStatus, errorMessage)

			this.setupRoom()
			this.refreshVariablesAndFeedbacks()
		})

		this.connection.on('UserUpdated', async (updatedPresenter) => {
			const presenter = self.room.users.find((e) => e.userName === updatedPresenter.userName)
			if (!presenter) {
				self.logger.error(`Could not update user ${update.userName}: Not found`)
				return
			}

			presenter.isActive = updatedPresenter.isActive
			presenter.displayName = updatedPresenter.displayName

			self.refreshVariablesAndFeedbacks()
		})

		this.connection.on('DisplayNameProvided', (userName, displayName, roomName) => {
			const presenter = self.room.users.find((e) => e.userName === userName)
			presenter.displayName = displayName

			self.refreshVariablesAndFeedbacks()
		})

		this.connection.on('UpdateActivePresenters', async (room) => {
			self.logger.info('Connection received, updating current room state')
			self.room.controlPresenterAccess = room.controlPresenterAccess

			// update presenters
			if (self.room.users.length === 0) {
				self.room.users = room.users
			} else {
				for (let i = 0; i < room.users.length; i++) {
					const updatedPresenter = room.users[i]

					const presenter = self.room.users.find((e) => e.userName === updatedPresenter.userName)

					if (presenter) {
						presenter.isActive = updatedPresenter.isActive
						presenter.displayName = updatedPresenter.displayName

						continue
					}

					const presentersMatchingName = self.room.users.filter((e) => e.displayName == updatedPresenter.displayName)

					if (presentersMatchingName.length === 0) {
						self.room.users.push(updatedPresenter)
					} else if (presentersMatchingName.length === 1) {
						presenter.isActive = updatedPresenter.isActive
						presenter.displayName = updatedPresenter.displayName
					} else {
						self.room.users.push(updatedPresenter)
					}
				}
			}

			self.refreshVariablesAndFeedbacks()
		})

		this.connection.on('UserDisconnected', (username, code) => {
			self.logger.info(`User ${username} disconnected`)
			const index = self.room.users.findIndex((e) => e.userName === username)

			if (index !== -1) {
				self.room.users.splice(index, 1)
				self.refreshVariablesAndFeedbacks()
			}
		})

		this.connection.on('UserConnected', function (username, code, isactive, displayname) {
			self.logger.info(`User ${username} connected`)

			const presenter = self.room.users.find((e) => e.userName === username)

			if (presenter) {
				presenter.displayName = displayname
				presenter.isActive = isactive
			} else {
				self.room.users.push({
					userName: username,
					displayName: displayname,
					isActive: isactive,
				})
			}

			self.refreshVariablesAndFeedbacks()
		})

		this.updatePresenterVariables(Variables.Values)

		this.setVariableValues(Variables.Values)

		// Start the connection.
		await this.startConnection()
	}

	async startConnection() {
		if (!this.connection) {
			await this.initConnection()
			return
		}

		try {
			await this.connection.start()
			this.logger.info('Hub connection started')
			this.hubConnectionUpdated()

			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.hubConnectionUpdated()
			this.logger.error(err.message)
			this.updateStatus(InstanceStatus.UnknownWarning, 'Could not start connection')
		}
	}

	updatePresenterVariables(vars) {
		for (let i = 1; i <= Settings.NumberOfPresenters; i++) {
			// get presenter if they exist
			if (this.room.users.length >= i) {
				const presenter = this.room.users[i - 1]
				// update the values of the variables
				vars[Variables.Keys.PresenterName(i)] = presenter.displayName
			} else {
				vars[Variables.Keys.PresenterName(i)] = this.config.unknownPresenterName ?? ''
			}
		}
	}

	refreshVariablesAndFeedbacks() {
		this.checkFeedbacks('control_presenter_access')
		this.checkFeedbacks('toggle_individual_presenter_access')

		this.updatePresenterVariables(Variables.Values)

		this.setVariableValues(Variables.Values)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
