NOVA-BLOCKS Deployment Instructions

1. Copy deployment-package.zip to your server
2. Unzip the package: Expand-Archive -Path deployment-package.zip -DestinationPath .
3. Install Node.js if not already installed (download from https://nodejs.org)
4. Install serve globally: npm install -g serve
5. Run the application: serve -s build -l 3000
6. Configure firewall to allow traffic on port 3000
7. Access the application at http://your-server-ip:3000

For production use:
- Consider using PM2 for process management: npm install -g pm2
- Run with PM2: pm2 serve build 3000 --spa
- Save process list: pm2 save
- Configure startup: pm2 startup
