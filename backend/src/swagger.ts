import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Oulu Smart Campus Manage',
            version: '0.0.1',
            description:
                'REST API for Smart Campus user and device management',
            license: {
                name: 'MIT license',
                url: '',
            },
            contact: {
                name: 'Smart Campus Project',
                url: 'https://smartcampus.oulu.fi/',
                email: '',
            },
        },
        servers: [
            {
                url: 'https://smartcampus.oulu.fi/manage/api/',
                description: 'Production environment',
            },
            {
                url: 'http://localhost:3000/',
                description: 'Your local instance',
            },
        ],
    },
    apis: [
        './src/swagger.yaml',
        './src/routes/apikeys.js',
        './src/routes/audit.js',
        './src/routes/devices.js',
        './src/routes/download.js',
        './src/routes/users.js',
    ],
};

module.exports = swaggerJsdoc(options);
