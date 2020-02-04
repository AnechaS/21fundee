module.exports = {
  apps: [
    {
      name: '21FunDee',
      script: 'node ./bin/www',
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
