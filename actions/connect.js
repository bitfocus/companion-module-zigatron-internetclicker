module.exports = function (self) {
	return {
		name: 'Connect to code',
		callback: async (event) => {
			await self.startConnection()
		},
	}
}
