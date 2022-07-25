let render = () => {
	let title = require('./title.js')
	root.innerText = title
}

render()

if (module.hot) {
	module.hot.accept(['./title.js'], render)
}
