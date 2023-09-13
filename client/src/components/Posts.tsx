import { History } from 'history'
// import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  // Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader, Form, TextArea, Label, Item, Card, Segment, Dimmer
} from 'semantic-ui-react'

import { createPost, deletePost, getPosts, patchPost } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'
import '../css/custom.css'
import { UpdatePostRequest } from '../types/UpdatePostRequest'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  todos: Post[]
  newPostTitle: string
  newPostContent: string
  loadingTodos: boolean
  deletingPost: boolean
  creatingPost: boolean
}

export class Todos extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    todos: [],
    newPostTitle: '',
    newPostContent: '',
    loadingTodos: true,
    deletingPost: false,
    creatingPost: false,
  }


  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostContent: event.target.value })
  }

  onEditButtonClick = (postId: string, title: string, content: string) => {
    const selectedPost: UpdatePostRequest = {
      title: title,
      content: content
    }
    localStorage.setItem("selectedPost", JSON.stringify(selectedPost));
    this.props.history.push({
      pathname: `/posts/${postId}/edit`
    })
  }

  convertTime = (timestamp: number) => {
    // Convert to seconds by dividing by 1000
    const timestampInSeconds = Math.floor(timestamp / 1000);

    // Create a Date object from the timestamp in seconds
    const date = new Date(timestampInSeconds * 1000);

    // Extract the year, month, and day
    // Extract the year, month, day, hours, minutes, and seconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the date as YYYY-mm-dd hh:mm:ss
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDateTime;
  }
  onTodoCreate = async () => {
    try {
      // validation
      if (this.state.newPostTitle === '' || this.state.newPostContent === '') {
        alert("title or content is blank")
        return
      }
      this.setState({
        creatingPost: true
      })
      const newTodo = await createPost(this.props.auth.getIdToken(), {
        title: this.state.newPostTitle,
        content: this.state.newPostContent
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newPostTitle: '',
        newPostContent: '',
        creatingPost: false
      })
    } catch {
      alert('Post creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      if (window.confirm("Do you want to delete this post ?")) {
        this.setState({
          deletingPost: true
        })
        await deletePost(this.props.auth.getIdToken(), todoId)
        this.setState({
          todos: this.state.todos.filter(todo => todo.postId !== todoId),
          deletingPost: false
        })
      }
    } catch {
      alert('Todo deletion failed')
    }
  }

  // onTodoCheck = async (pos: number) => {
  //   try {
  //     const todo = this.state.todos[pos]
  //     await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
  //       name: todo.name,
  //       dueDate: todo.dueDate,
  //       done: !todo.done
  //     })
  //     this.setState({
  //       todos: update(this.state.todos, {
  //         [pos]: { done: { $set: !todo.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Todo deletion failed')
  //   }
  // }

  async componentDidMount() {
    try {
      const todos = await getPosts(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {

    return (
      <div>
        <Header as="h1">Posting</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Form onSubmit={this.onTodoCreate}>
          <Form.Field>
            <label>Title</label>
            <input placeholder='title' onChange={this.handleTitleChange} value={this.state.newPostTitle} />
          </Form.Field>
          <Form.Field>
            <label>Content</label>
            <input placeholder='content' onChange={this.handleContentChange} value={this.state.newPostContent} />
          </Form.Field>
          <Button type='submit'>Post</Button>
        </Form>
        <Grid.Column width={16}>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading...
        </Loader>
      </Grid.Row>
    )
  }


  renderTodosList() {
    return (
      <div>
        {this.state.deletingPost ? (
          <Dimmer active inverted>
            <Loader inverted>deleting</Loader>
          </Dimmer>) : <></>}
        {this.state.creatingPost ? (
          <Dimmer active inverted>
            <Loader inverted>creating</Loader>
          </Dimmer>) : <></>}
        <Grid padded>
          <Item.Group>
            {this.state.todos.map((todo, pos) => {
              return (
                <div className="post-item">
                  <Card>
                    <Image src={todo.attachmentUrl} wrapped ui={false} />
                    <Card.Content>
                      <Card.Header>{todo.title}</Card.Header>
                      <Card.Meta>
                        <span className='date'>{this.convertTime(parseInt(todo.createdAt))}</span>
                      </Card.Meta>
                      <Card.Description>
                        {todo.content}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Button icon="edit" color="blue" onClick={() => this.onEditButtonClick(todo.postId, todo.title, todo.content)} ></Button>
                      <Button icon="delete" color='red' onClick={() => this.onTodoDelete(todo.postId)}></Button>
                    </Card.Content>
                  </Card>
                </div>
              )
            })}
          </Item.Group>
        </Grid>
      </div>
    )
  }

}
