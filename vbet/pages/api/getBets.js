import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  try {
    const params = {
      TableName: 'vbet-bets', 
    };
    const result = await dynamoDB.scan(params).promise();
    res.status(200).json(result.Items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
