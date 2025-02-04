module.exports = function (self) {
	return {
		name: 'Add/Minus Timer',
		description: 'Change the timer by adding or taking away the specified amount of time',
		options: [
			{
				id: 'change_type',
				type: 'dropdown',
				label: 'Add or minus',
				choices: [
					{ id: 'add', label: 'Add' },
					{ id: 'minus', label: 'Minus' },
				],
				default: 'add',
			},
			{
				type: 'number',
				label: 'Minutes',
				id: 'minutes',
				default: 0,
				step: 1,
				required: true,
				range: false,
			},
			{
				type: 'number',
				label: 'Seconds',
				id: 'seconds',
				default: 0,
				step: 1,
				required: true,
				range: false,
			},
		],
		callback: (event) => {
			const multiplier = event.options.change_type === 'minus' ? -1 : 1

			const minutes = Math.abs(Math.floor(event.options.minutes ?? 0)) * multiplier
			const seconds = Math.abs(Math.floor(event.options.seconds ?? 0)) * multiplier

			self?.connection
				.invoke('ChangeTimer', self.config.code, minutes, seconds)
				.catch((err) => self.log('error', err.toString()))
		},
	}
}
