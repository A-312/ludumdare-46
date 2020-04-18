const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Path = require('path');

const start = async () => {
  const server = Hapi.server({
    port: 5000,
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'build')
      }
    }
  });

  console.log(Path.join(__dirname, 'build'))

  await server.register(Inert);

  server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
          directory: {
              path: '.',
              redirectToSlash: true
          }
      }
  });

  await server.start();

  console.log('Server running at:', server.info.uri);
};

start();
