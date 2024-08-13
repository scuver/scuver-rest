const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'Tastic',
  description: 'Tastic Node.js application that runs as a Windows service.',
  script: require('path').join(__dirname, 'print.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});
const svcn = new Service({
    name: 'Tastic Notify',
    description: 'Tastic Node.js application that runs as a Windows service.',
    script: require('path').join(__dirname, 'notify.js'),
    nodeOptions: [
      '--harmony',
      '--max_old_space_size=4096'
    ],
    env: {
      name: "NODE_ENV",
      value: "production"
    }
  });

// Listen for the "install" event, which indicates the service is installed.
svc.on('install', function () {
  svc.start();
  console.log('Print installed and started successfully.');
});
svcn.on('install', function () {
    svcn.start();
    console.log('Notify installed and started successfully.');
  });

// Install the service
svc.install();
svcn.install();