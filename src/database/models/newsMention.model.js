/**
 * NewsMention model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NewsMention = sequelize.define('NewsMention', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_id',
      references: {
        model: 'st_stocks',
        key: 'id',
      },
    },
    newsSourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'news_source_id',
      references: {
        model: 'st_news_sources',
        key: 'id',
      },
    },
    sentimentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sentiment_type_id',
      references: {
        model: 'st_sentiment_types',
        key: 'id',
      },
    },
    articleUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'article_url',
      validate: {
        isUrl: true,
      },
    },
    articleTitle: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'article_title',
      validate: {
        notEmpty: true,
        len: [1, 500],
      },
    },
    publicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'publication_date',
      validate: {
        isDate: true,
      },
    },
    sentimentScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'sentiment_score',
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isMajorNews: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_major_news',
    },
  }, {
    tableName: 'st_news_mentions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['stock_id'],
      },
      {
        fields: ['news_source_id'],
      },
      {
        fields: ['sentiment_type_id'],
      },
      {
        fields: ['publication_date'],
      },
      {
        fields: ['is_major_news'],
      },
      {
        fields: ['sentiment_score'],
      },
    ],
  });
  NewsMention.associate = (models) => {
    // Check if the models exist before creating associations
    if (models.Stock) {
      // NewsMention belongs to a stock
      NewsMention.belongsTo(models.Stock, {
        foreignKey: 'stock_id',
        as: 'stock',
      });
    }

    if (models.NewsSource) {
      // NewsMention belongs to a news source
      NewsMention.belongsTo(models.NewsSource, {
        foreignKey: 'news_source_id',
        as: 'newsSource',
      });
    }

    if (models.SentimentType) {
      // NewsMention belongs to a sentiment type
      NewsMention.belongsTo(models.SentimentType, {
        foreignKey: 'sentiment_type_id',
        as: 'sentimentType',
      });
    }
  };

  return NewsMention;
};
