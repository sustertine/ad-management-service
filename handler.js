'use-strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:4566',
    region: 'us-east-1'
});

const TABLE_NAME = "ad-management-service-ads";

// Create ad
module.exports.createAd = async (event) => {
    const {title, description, price} = JSON.parse(event.body);
    const id = uuid.v4();
    const newAd = {id, title, description, price};
    await docClient.put({
        TableName: TABLE_NAME,
        Item: newAd
    }).promise();
    return {
        statusCode: 201,
        body: JSON.stringify(newAd)
    };
}

// Get all ads
module.exports.getAds = async () => {
    const data = await docClient.scan({
        TableName: TABLE_NAME
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };
}

// Get ad by id
module.exports.getAdById = async (event) => {
    const {id} = event.pathParameters;
    const data = await docClient.get({
        TableName: TABLE_NAME,
        Key: {id}
    }).promise();

    if (!data.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "Ad not found"})
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(data.Item)
    };
}

// Update ad by id
module.exports.updateEvenet = async (event) => {
    const {id} = event.pathParameters;
    const {title, description, price} = JSON.parse(event.body);
    await docClient.update({
        TableName: TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set title = :title, description = :description, price = :price',
        ExpressionAttributeValues: {
            ':title': title,
            ':description': description,
            ':price': price
        }
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({id, title, description, price})
    };
};

// Delete ad by id
module.exports.deleteAd = async (event) => {
    const {id} = event.pathParameters;
    await docClient.delete({
        TableName: TABLE_NAME,
        Key: {id}
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({message: "Ad deleted successfully"})
    };
}