const { InstanceBase, Regex, runEntrypoint, InstanceStatus, LogLevel } = require('@companion-module/base')
const SignalR = require('@microsoft/signalr')

const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions/index')
const UpdateFeedbacks = require('./feedbacks/index')
const Variables = require('./variables')
const GetConfigFields = require('./config')
const Presets = require('./presets')
const Settings = require('./settings')

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
		this.setupRoom();
		this.refreshVariablesAndFeedbacks();
		await this.stopConnection();
	}

	// When module gets deleted
	async destroy() {
		await this.stopConnectionO();
	}

	async configUpdated(config) {
		await this.reset();
		this.config = config;
		await this.initConnection();
	}

	async stopConnection() {
		// if there is an active connection we should disconnect
		if (this.connection) {
			this.logger.info("Disconnecting from hub connection")
			await this.connection.stop()
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

		self.logger.debug("noooooo")
		self.log('debug', "yesssssss")

		if (!this.config.apikey || !this.config.code) {
			this.updateStatus(InstanceStatus.BadConfig);
		}
		
		this.logger.info(`Using base url ${Settings.BaseUrl}`)

		this.logger.info('Initializing hub connection')

		const apiKeyEncoded = encodeURIComponent(self.config.apikey)
		const codeEncoded = encodeURIComponent(self.config.code)

		this.connection = new SignalR.HubConnectionBuilder()
			.withUrl(
				`${Settings.BaseUrl}/keypresshub?isAccount=${codeEncoded}`,
				{
					headers: {
						'X-ConnectionCode': apiKeyEncoded,
					},
				},
			)
			.withAutomaticReconnect()
			.configureLogging(SignalR.LogLevel.Information)
			.build()

		async function start() {
			try {
				await self.connection.start()
				self.logger.info('Hub connection started')
				
				self.updateStatus(InstanceStatus.Ok);
			} catch (err) {
				self.logger.error(err.message)
				self.updateStatus(InstanceStatus.UnknownWarning, "Could not start connection");
				
			}
		}

		this.connection.onreconnecting((error) => {
			self.logger.info('Reconnecting to service...')
		})

		this.connection.onclose(async (error) => {
			//setTimeout(await start, 3000)

			self.logger.error(`Could not connect to service: ${error.message}`);

			let errorStatus = InstanceStatus.UnknownWarning
			let errorMessage = "Connection not started"
			if (error.message.includes('Code not found')) {
				errorMessage = 'Code not found'
				errorStatus = InstanceStatus.BadConfig
			}

			if (error.message.includes('Must be logged in')) {
				errorMessage = 'Invalid key'
				errorStatus = InstanceStatus.BadConfig
			}
				
			self.updateStatus(errorStatus, errorMessage);
		})

		this.connection.on('UserUpdated', async (updatedPresenter) => {
			const presenter = self.room.users.find(e => e.userName === updatedPresenter.userName);
			if (!presenter) {
				self.logger.error(`Could not update user ${update.userName}: Not found`)
				return
			}
			
			presenter.isActive = updatedPresenter.isActive
			presenter.displayName = updatedPresenter.displayName

			self.refreshVariablesAndFeedbacks();
		})

		this.connection.on('UpdateActivePresenters', async (room) => {
			self.logger.info('Connection received, updating current room state')
			self.room.controlPresenterAccess = room.controlPresenterAccess

			// update presenters
			if (self.room.users.length === 0) {
				self.room.users = room.users
			} else {
				// for each presenter
				// if username exists, update values
				// if username doesn't exist, get all users with display name
				// if display name doesn't exist, add
				// if single display name, update values
				// if multiple display names exists, we're fucked, add another presenter

				for (let i = 0; i < room.users.length; i++) {
					const updatedPresenter = room.users[i]

					const presenter = self.room.users.find((e) => e.userName === updatedPresenter.userName)

					if (presenter) {
						presenter.isActive = updatedPresenter.isActive
						presenter.displayName = updatedPresenter.displayName

						continue
					}

					const presentersMatchingName = self.room.users.filter(
						(e) => e.displayName == updatedPresenter.displayName,
					)

					if (presentersMatchingName.length === 0) {
						self.room.users.push(updatedPresenter)
					}
					else if (presentersMatchingName.length === 1) {
						presenter.isActive = updatedPresenter.isActive
						presenter.displayName = updatedPresenter.displayName
					}
					else {
						self.room.users.push(updatedPresenter)
					}
				}
			}

			self.refreshVariablesAndFeedbacks();
		})

		this.connection.on('UserDisconnected', (username, code) => {
			self.logger.info(`User ${username} disconnected`)
			const index = self.room.users.findIndex(e => e.userName === username);

			if (index !== -1) {
				self.room.users.splice(index, 1);
				self.refreshVariablesAndFeedbacks();
			}

		})

		this.connection.on("UserConnected", function (username, code, isactive, displayname) {
			self.logger.info(`User ${username} connected`)

			const presenter = self.room.users.find(e => e.userName === username);

			if (presenter) {
				presenter.displayName = displayname;
				presenter.isActive = isactive;
			} else {
				self.room.users.push({
					userName: username,
					displayName: displayname,
					isActive: isactive
				})
			}

			self.refreshVariablesAndFeedbacks();
		});

		this.updatePresenterVariables(Variables.Variables)

		this.setVariableValues(Variables.Variables)

		// Start the connection.
		await start()
	}

	updatePresenterVariables(vars) {
		for (let i = 1; i <= Settings.NumberOfPresenters; i++) {
			// get presenter if they exist
			if (this.room.users.length >= i) {
				const presenter = this.room.users[i - 1];
				// update the values of the variables
				vars[Variables.DefinitionGenerator.PresenterName(i)] = presenter.displayName;
			}
			else {
				vars[Variables.DefinitionGenerator.PresenterName(i)] = this.config.unknownPresenterName ?? '';
			}
		}
	}

	refreshVariablesAndFeedbacks() {
		this.log('debug', "Refreshing variables and feedbacks")
		this.checkFeedbacks('control_presenter_access');
		this.checkFeedbacks('toggle_individual_presenter_access')

		this.updatePresenterVariables(Variables.Variables)

		this.setVariableValues(Variables.Variables)
		this.log('debug', 'Updated variables', Variables.Variables)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)

// const instance_skel = require("../../../instance_skel.js");
// const {
// 	actionList,
// 	executeAction
// } = require("./actions");
// const getFeedback = require("./feedbacks");
// const {
// 	getConfigFields
// } = require("./config.js");
// const signalR = require("@microsoft/signalr");

// class InternetClickerInstance extends instance_skel {

// 	constructor(system, id, config) {
// 		super(system, id, config);

// 		this.connection = null;
// 		this.room = {
// 			controlPresenterAccess: false,
// 			presenters: []
// 		}

// 		this.logger = {
// 			info: (message) => this.log("info", message),
// 			debug: (message) => this.log("debug", message),
// 			error: (message) => this.log("error", message)
// 		}
// 	}

// 	init() {
// 		this.initActions();
// 		this.initFeedbacks();
// 		this.initConnection();
// 	}

// 	destroy() {
// 		if (this.connection) {
// 			this.connection.stop();
// 		}
// 	}

// 	// Process configuration change
// 	updateConfig(config) {
// 		this.config = config;
// 		this.initConnection();
// 	}

// 	// Set fields for instance configuration in the web
// 	config_fields() {
// 		return getConfigFields();
// 	}

// 	initActions() {
// 		this.system.emit('instance_actions', this.id, actionList);
// 	}

// 	initFeedbacks() {
// 		this.setFeedbackDefinitions(getFeedback.bind(this)());
// 	}

// 	initConnection() {
// 		const self = this;
// 		this.logger.info("Initializing hub connection")

// 		const apiKeyEncoded = encodeURIComponent(self.config.apikey);
// 		const codeEncoded = encodeURIComponent(self.config.code);

// 		this.connection = new signalR.HubConnectionBuilder()
// 			.withUrl(`http://localhost:52722/keypresshub?isAccount=${codeEncoded}&apikey=${apiKeyEncoded}`)
// 			.withAutomaticReconnect()
// 			.configureLogging(signalR.LogLevel.Information)
// 			.build();

// 		async function start() {
// 			try {
// 				await self.connection.start();
// 				self.logger.info("Hub connection started")
// 			} catch (err) {
// 				self.logger.error(err.message);
// 				setTimeout(start, 5000);
// 			}
// 		};

// 		this.connection.onclose(async () => {
// 			//await start();
// 			setTimeout(await start, 5000);
// 		});

// 		this.connection.on("UpdateActivePresenters", async (room) => {
// 			self.logger.info("Connection received, updating current room state");
// 			self.room.controlPresenterAccess = room.controlPresenterAccess;

// 			// trigger feedbacks
// 			self.checkFeedbacks('control_presenter_access');
// 		});

// 		// Start the connection.
// 		start();
// 	}

// 	// Execute an action
// 	action(action) {
// 		executeAction.bind(this)(action);
// 	}
// }

// exports = module.exports = InternetClickerInstance;
