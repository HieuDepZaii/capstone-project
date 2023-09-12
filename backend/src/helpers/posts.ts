import * as TodoAccess from './postsAcess'
import { PostItem } from '../models/PostItem'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import { v4 as uuidv4 } from 'uuid';
import { PostUpdate } from '../models/PostUpdate';

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

// TODO: Implement businessLogic
export async function getAllPosts(userId: string): Promise<PostItem[]> {
    return TodoAccess.findAllPostByUserId(userId);
}

export async function createPost(userId: string, request: CreatePostRequest): Promise<PostItem> {
    var postId = uuidv4();
    var imageUrl = `https://${bucketName}.s3.amazonaws.com/${postId}`;
    return TodoAccess.create({
        userId: userId,
        postId: postId,
        createdAt: new Date().getTime().toString(),
        attachmentUrl: imageUrl,
        ...request
    });
}

export async function updatePost(userId: string, todoId: string, request: UpdatePostRequest): Promise<PostUpdate> {
    return TodoAccess.update({ ...request }, userId, todoId);
}

export async function deletePost(userId: string, todoId: string): Promise<string> {
    return TodoAccess.remove(userId, todoId);
}