export default function (self) {
	return {
		name: 'Prompt For Names',
		description:
			'Use this if you enable presenter access control after presenters have joined and have not had to enter their names',
		callback: (event) => {
			if (self.connection) {
				self.connection.invoke('promptUnnamedUsers', self.config.code).catch((err) => self.log('error', err.toString()))
			}
		},
	}
}
