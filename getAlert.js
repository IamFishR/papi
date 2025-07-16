
const db = require('./src/database/models');

const getAlertById = async (id) => {
  const alert = await db.Alert.findOne({
    where: {
      id,
    },
    include: [
      { model: db.Stock, as: 'stock', attributes: ['id', 'symbol', 'companyName'] },
      { model: db.TriggerType, as: 'triggerType' },
      { model: db.ThresholdCondition, as: 'thresholdCondition' },
      { model: db.VolumeCondition, as: 'volumeCondition' },
      { model: db.IndicatorType, as: 'indicatorType' },
      { model: db.IndicatorCondition, as: 'indicatorCondition' },
      { model: db.SentimentType, as: 'sentimentType' },
      { model: db.AlertFrequency, as: 'frequency' },
      { model: db.ConditionLogicType, as: 'conditionLogic' }
    ]
  });

  console.log(JSON.stringify(alert, null, 2));
  process.exit(0);
};

getAlertById(8);
