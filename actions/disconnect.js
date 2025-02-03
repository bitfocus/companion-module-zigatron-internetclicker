module.exports = function (self) {
	return {
		name: 'Disconnect from code',
		callback: async (event) => {
			await self.reset();
		},
	}
}
