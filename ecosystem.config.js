module.exports = {
  apps: [
    {
      name: '21FunDee',
      script: 'node ./bin/server',
      watch: true,
      ignore_watch: ['node_modules', './client'],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
