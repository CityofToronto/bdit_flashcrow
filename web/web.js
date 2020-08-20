import config from '@/lib/config/MoveConfig';
import WebServer from '@/web/WebServer';

const webServer = new WebServer({ port: config.port });
webServer.start();
