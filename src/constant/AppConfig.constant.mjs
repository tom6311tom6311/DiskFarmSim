const SHARD_SIZE = 2000;
const AppConfig = {
  GENERAL: {
    SERVER_PORT: 3001,
    CLEAR_LOG: true,
    LOG_DIR: 'log',
    PRINT_CONN_LOG: false,
    LOG_PAD: 26,
    LOG_PAD_SHORT: 18,
    LOG_PAD_VERY_SHORT: 5,
  },
  ANALYTICS: {
    MONITOR_BUCKET_LOAD: {
      NODES: ['F0', 'F10', 'F20'],
      LOG_FILE_PREFIX: 'bucket_load',
    },
  },
  PEER: {
    UPLOAD_BW: {
      MEAN: 100,
      STD: 20,
    },
    DOWNLOAD_BW: {
      MEAN: 100,
      STD: 20,
    },
    CHURN_PROB: {
      ON_TO_OFF: {
        MEAN: 0.1,
        STD: 0.000,
      },
      OFF_TO_ON: {
        MEAN: 0.1,
        STD: 0.000,
      },
    },
  },
  DATA_OWNER: {
    TOTAL_NUM: 0,
    FILE_TO_UPLOAD_OCCUR_RATE: {
      MEAN: 0.2,
      STD: 0.1,
    },
    FILE_TO_UPLOAD_SIZE: {
      MEAN: 100 * SHARD_SIZE,
      STD: 20 * SHARD_SIZE,
    },
    FILE_LEFT_ONLINE_PERIOD: {
      MEAN: 3 * 24 * 60 * 60,
      STD: 20000,
    },
  },
  SHARD_KEEPER: {
    TOTAL_NUM: 0,
    SHARD_SIZE,
    SHARD_CAPACITY: {
      MEAN: 200,
      STD: 20,
    },
    REDUNDANT_SHARD_RATIO: 0.2,
    REPUB_INTERVAL_SK: 12 * 60 * 60,
  },
  FARMER: {
    TOTAL_NUM: 8,
    FARMER_CAPACITY: 10000 * SHARD_SIZE,
    REPUB_INTERVAL_FARMER: 30 * 60,
  },
  KADEMLIA: {
    ID_LENGTH: 9,
    BUCKET_K: 1,
    NODE_LOOKUP_ALPHA: 3,
    ALLOW_RANDOM_NODE_LOOKUP: true,
    RANDOM_NODE_LOOKUP_AVG_PERIOD: 1000,
  },
};

export default AppConfig;
