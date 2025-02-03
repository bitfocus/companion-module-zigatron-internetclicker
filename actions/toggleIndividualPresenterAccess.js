const Settings = require('../settings')

const buildOptions = () =>
	Array.from({ length: Settings.NumberOfPresenters }, (_, i) => ({
		id: i,
		label: i + 1,
	}))

module.exports = function (self) {
	return {
		name: 'Toggle Individual Presenter Access',
		options: [
			{
				id: 'presenter_index',
				type: 'dropdown',
				label: 'Presenter Index',
				choices: buildOptions(),
				default: 0,
			},
		],
		callback: async (event) => {
			if (!self.connection) return

			if (!self.room.controlPresenterAccess) {
				self.logger.info('Cannot toggle presenter access while control presenter access is disabled')

				return
			}

			const presenter = self.room.users?.[event.options.presenter_index]

			if (!presenter) return

			self.connection
				.invoke('switchActiveStatus', self.config.code, presenter.userName)
				.then(() => {
					presenter.isActive = !presenter.isActive
					self.checkFeedbacks('toggle_individual_presenter_access')
				})
				.catch((err) => self.log('error', err.toString()))
		},
	}
}
