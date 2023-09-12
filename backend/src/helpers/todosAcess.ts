import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
const documentClient = new XAWS.DynamoDB.DocumentClient();

const tableName = process.env.TODOS_TABLE;

export async function findAllTodoByUserId(userId: string): Promise<TodoItem[]> {
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
    const items: TodoItem[] = result.Items as TodoItem[];
    logger.info("Count Todos", { count: items.length });
    return items;
}

export async function create(item: TodoItem): Promise<TodoItem> {
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
    item: TodoUpdate,
    userId: string,
    todoId: string
): Promise<TodoUpdate> {
    logger.info("Updating Todo", { userId: userId, todoId: todoId });
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: {
            userId,
            todoId
        },
        UpdateExpression: 'set #nameItem = :nameItem, #dueDateItem = :dueDateItem, #doneItem = :doneItem',
        ExpressionAttributeNames: {
            '#nameItem': 'name',
            '#doneItem': 'done',
            '#dueDateItem': 'dueDate'
        },
        ExpressionAttributeValues: {
            ':nameItem': item.name,
            ':doneItem': item.done,
            ':dueDateItem': item.dueDate
        },
        ReturnValues: 'ALL_NEW'
    };
    const result = await documentClient.update(params).promise();
    const updatedTodo: TodoUpdate = result.Attributes as TodoUpdate;
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