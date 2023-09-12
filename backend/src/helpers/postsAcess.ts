import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { PostItem } from '../models/PostItem'
import { PostUpdate } from '../models/PostUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('PostsAccess')

// TODO: Implement the dataLayer logic
const documentClient = new XAWS.DynamoDB.DocumentClient();

const tableName = process.env.POST_TABLE;

export async function findAllPostByUserId(userId: string): Promise<PostItem[]> {
    logger.info("Getting Todo", { userId: userId });
    const params: DocumentClient.QueryInput = {
        TableName: tableName,
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
            '#userId': 'userId'
        },
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };
    const result = await documentClient.query(params).promise();
    const items: PostItem[] = result.Items as PostItem[];
    logger.info("Count Todos", { count: items.length });
    return items;
}

export async function create(item: PostItem): Promise<PostItem> {
    logger.info("Creating Todo");
    const params: DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: item
    };
    await documentClient.put(params).promise();
    logger.info("Created Todo", item);
    return item;
}

export async function update(
    item: PostUpdate,
    userId: string,
    todoId: string
): Promise<PostUpdate> {
    logger.info("Updating Todo", { userId: userId, todoId: todoId });
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: {
            userId,
            todoId
        },
        UpdateExpression: 'set #titleItem = :titleItem, #contentItem = :contentItem',
        ExpressionAttributeNames: {
            '#titleItem': 'title',
            '#contentItem': 'content'
        },
        ExpressionAttributeValues: {
            ':titleItem': item.title,
            ':contentItem': item.content,
        },
        ReturnValues: 'ALL_NEW'
    };
    const result = await documentClient.update(params).promise();
    const updatedTodo: PostUpdate = result.Attributes as PostUpdate;
    logger.info("Updated Todo");
    return updatedTodo;
}

export async function remove(userId: string, todoId: string): Promise<string> {
    logger.info("Removing Todo", { userId: userId, todoId: todoId });
    const params = {
        Key: {
            userId: userId,
            todoId: todoId
        },
        TableName: tableName
    };
    await documentClient.delete(params).promise();
    logger.info("Removed Todo");
    return '';
}