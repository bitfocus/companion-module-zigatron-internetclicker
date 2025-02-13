export default function (self) {
	return {
		name: 'Disconnect from Code',
		callback: async (event) => {
			await self.reset()
		},
	}
}
