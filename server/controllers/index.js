var _ = require('underscore')

module.exports = {
	set: (app) => {
		return _.extend({}, 
			require('./main')(app),
			require('./profile')(app),
			require('./shopCart')(app),
			require('./shopHistory')(app),
			require('./checkOut')(app)
		);
	}
}


