const SHARD_SIZE = 2000;
const AppConfig = {
  GENERAL: {
    LOG_PAD: 26,
    LOG_PAD_SHORT: 18,
    LOG_PAD_VERY_SHORT: 5,
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
        MEAN: 0.00,
        STD: 0.000,
      },
      OFF_TO_ON: {
        MEAN: 0.0,
        STD: 0.00,
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
    TOTAL_NUM: 5,
    FARMER_CAPACITY: 10000 * SHARD_SIZE,
    REPUB_INTERVAL_FARMER: 30 * 60,
  },
  KADEMLIA: {
    ID_LENGTH: 5,
    BUCKET_K: 3,
    NODE_LOOKUP_ALPHA: 3,
  },
};

export default AppConfig;
