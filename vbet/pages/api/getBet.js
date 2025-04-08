import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing bet ID' });
  }

  const params = {
    TableName: 'vbet-bets',
    Key: { id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    res.status(200).json(result.Item);
  } catch (error) {
    console.error('Error fetching bet:', error);
    res.status(500).json({ error: 'Failed to fetch bet' });
  }
}