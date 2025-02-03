module.exports = function () {
	return [
		{
			type: 'textinput',
			id: 'apikey',
			label: 'Key',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'code',
			label: 'Code',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'unknownPresenterName',
			label: 'Unknown Presenter Name',
			tooltip:
				'Displayed when a presenter has given no name because Control Presenter Access was not enabled when the presenter joined',
			width: 12,
			default: '',
		},
	]
}
