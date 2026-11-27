module.exports = {
    apps: [
        {
            name: 'example-ecommerce',
            script: 'bootstrap/ssr/app.js',
            cwd: __dirname,
            exec_mode: 'fork',
            instances: 1,
            max_memory_restart: '256M',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
