import * as TodoAccess from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { v4 as uuidv4 } from 'uuid';
import { TodoUpdate } from '../models/TodoUpdate';

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

// TODO: Implement businessLogic
export async function getAllTodo(userId: string): Promise<TodoItem[]> {
    return TodoAccess.findAllTodoByUserId(userId);
}

export async function createTodo(userId: string, request: CreateTodoRequest): Promise<TodoItem> {
    var todoId = uuidv4();
    var imageUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
    return TodoAccess.create({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().getTime().toString(),
        attachmentUrl: imageUrl,
        done: false,
        ...request
    });
}

export async function updateTodo(userId: string, todoId: string, request: UpdateTodoRequest): Promise<TodoUpdate> {
    return TodoAccess.update({ ...request }, userId, todoId);
}

export async function deleteTodo(userId: string, todoId: string): Promise<string> {
    return TodoAccess.remove(userId, todoId);
}