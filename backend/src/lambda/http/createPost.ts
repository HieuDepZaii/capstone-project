import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreatePostRequest } from '../../requests/CreatePostRequest'
import { getUserId } from '../utils';
import { createPost } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const newTodo: CreatePostRequest = JSON.parse(event.body);
    // TODO: Implement creating a new TODO item
    const todoItem = await createPost(userId, newTodo);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todoItem
      })
    };
  }
)

handler.use(
  cors({
    credentials: true
  })
)
