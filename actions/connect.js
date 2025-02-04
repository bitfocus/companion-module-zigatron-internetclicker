module.exports = function (self) {
	return {
		name: 'Connect to Code',
		callback: async (event) => {
			await self.startConnection()
		},
	}
}
