module.exports = {
  apps: [
    {
      name: '21FunDee',
      script: 'node ./bin/server',
      watch: true,
      ignore_watch: ['node_modules', './client'],
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: '21FunDee-client',
      script: 'cd ./client && npm run serve'
    }
  ]
};
