const instance_skel = require("../../../instance_skel.js");
const {
	actionList,
	executeAction
} = require("./actions");
const getFeedback = require("./feedbacks");
const {
	getConfigFields
} = require("./config.js");
const signalR = require("@microsoft/signalr");

class InternetClickerInstance extends instance_skel {

	constructor(system, id, config) {
		super(system, id, config);

		this.connection = null;
		this.room = {
			controlPresenterAccess: false,
			presenters: []
		}

		this.logger = {
			info: (message) => this.log("info", message),
			debug: (message) => this.log("debug", message),
			error: (message) => this.log("error", message)
		}
	}

	init() {
		this.initActions();
		this.initFeedbacks();
		this.initConnection();
	}

	destroy() {
		if (this.connection) {
			this.connection.stop();
		}
	}

	// Process configuration change
	updateConfig(config) {
		this.config = config;
		this.initConnection();
	}

	// Set fields for instance configuration in the web
	config_fields() {
		return getConfigFields();
	}

	initActions() {
		this.system.emit('instance_actions', this.id, actionList);
	}

	initFeedbacks() {
		this.setFeedbackDefinitions(getFeedback.bind(this)());
	}

	initConnection() {
		const self = this;
		this.logger.info("Initializing hub connection")

		const apiKeyEncoded = encodeURIComponent(self.config.apikey);
		const codeEncoded = encodeURIComponent(self.config.code);

		this.connection = new signalR.HubConnectionBuilder()
			.withUrl(`http://localhost:52722/keypresshub?isAccount=${codeEncoded}&apikey=${apiKeyEncoded}`)
			.withAutomaticReconnect()
			.configureLogging(signalR.LogLevel.Information)
			.build();

		async function start() {
			try {
				await self.connection.start();
				self.logger.info("Hub connection started")
			} catch (err) {
				self.logger.error(err.message);
				setTimeout(start, 5000);
			}
		};

		this.connection.onclose(async () => {
			//await start();
			setTimeout(await start, 5000);
		});

		this.connection.on("UpdateActivePresenters", async (room) => {
			self.logger.info("Connection received, updating current room state");
			self.room.controlPresenterAccess = room.controlPresenterAccess;

			// trigger feedbacks
			self.checkFeedbacks('control_presenter_access');
		});

		// Start the connection.
		start();
	}

	// Execute an action
	action(action) {
		executeAction.bind(this)(action);
	}
}

exports = module.exports = InternetClickerInstance;