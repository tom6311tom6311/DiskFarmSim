import http from 'http';
import io from 'socket.io';
import AppConfig from '../constant/AppConfig.constant.mjs';
import ServerEvents from '../constant/ServerEvents.constant.mjs';

class Server {
  constructor() {
    if (!AppConfig.GENERAL.TURN_ON_SERVER) {
      return;
    }
    console.log('start listen');
    this.app = http.createServer();
    this.io = io.listen(this.app);
    this.app.listen(AppConfig.GENERAL.SERVER_PORT);
    this.connected = false;
    this.eventQueue = [];

    this.io.on('connection', () => {
      console.log('[SERVER] Client Connected.');
      this.connected = true;
      while (this.eventQueue.length !== 0) {
        const { eventName, data } = this.eventQueue.shift();
        this.io.emit(eventName, data);
      }
    });
    this.io.on('disconnect', () => {
      console.log('[SERVER] Client Disconnected.');
      this.connected = false;
    });
  }

  updateBucketLoadChart(chartData) {
    this.emit(ServerEvents.UPDATE_BUCKET_LOAD_CHART, chartData);
  }

  addTopoGraphNode(nodeName) {
    this.emit(ServerEvents.ADD_TOPO_GRAPH_NODE, nodeName);
  }

  topoGraphNodeStatusChanged(nodeName, isOnline) {
    if (nodeName[0] === 'F') {
      this.emit(ServerEvents.TOPO_GRAPH_NODE_STATUS_CHANGED, { name: nodeName, isOnline });
    }
  }

  addTopoGraphEdge(from, to) {
    this.emit(ServerEvents.ADD_TOPO_GRAPH_EDGE, { from, to });
  }

  deleteTopoGraphEdge(from, to) {
    this.emit(ServerEvents.DELETE_TOPO_GRAPH_EDGE, { from, to });
  }

  cleanTopoGraph() {
    this.emit(ServerEvents.CLEAN_TOPO_GRAPH);
  }

  emit(eventName, data) {
    if (!AppConfig.GENERAL.TURN_ON_SERVER) {
      return;
    }
    if (this.connected && this.eventQueue.length === 0) {
      this.io.emit(eventName, data);
    } else {
      this.eventQueue.push({ eventName, data });
    }
  }
}

export default new Server();
