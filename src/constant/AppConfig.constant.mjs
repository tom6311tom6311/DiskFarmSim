const SHARD_SIZE = 2000;
const AppConfig = {
  GENERAL: {
    LOG_PAD: 26,
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
        MEAN: 0.001,
        STD: 0.0001,
      },
      OFF_TO_ON: {
        MEAN: 0.01,
        STD: 0.001,
      },
    },
  },
  DATA_OWNER: {
    TOTAL_NUM: 3,
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
    TOTAL_NUM: 3,
    SHARD_SIZE,
    SHARD_CAPACITY: {
      MEAN: 200,
      STD: 20,
    },
    REDUNDANT_SHARD_RATIO: 0.2,
    REPUB_INTERVAL_SK: 12 * 60 * 60,
  },
  FARMER: {
    TOTAL_NUM: 3,
    ID_LENGTH: 5,
    BUCKET_K: 3,
    FARMER_CAPACITY: 10000 * SHARD_SIZE,
    NODE_LOOKUP_ALPHA: 5,
    REPUB_INTERVAL_FARMER: 30 * 60,
  },
};

export default AppConfig;
