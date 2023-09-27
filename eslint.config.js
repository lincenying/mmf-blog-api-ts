const lincy = require('@lincy/eslint-config').lincy

const config = lincy(
    {
        vue: false,
        overrides: {
            ignores: [
                '**/assets',
                '**/static',
            ],
        },
    },
)

module.exports = config
