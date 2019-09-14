module.exports = {
	pluginOptions: {
		moment: {
			locales: ["en"]
		}
	},
	runtimeCompiler: true,
	css: {
		loaderOptions: {
			sass: {
				data: `
	  			@import "@/scss/tasker.scss";
	  			`
			}
		}
	}
};
