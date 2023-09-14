import * as React from 'react'
import { Form, Button, Dimmer, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, patchPost, uploadFile } from '../api/todos-api'
import { UpdatePostRequest } from '../types/UpdatePostRequest'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      postId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState,
  newPostTitle: string
  newPostContent: string
  updatingPost: boolean
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    newPostTitle: '',
    newPostContent: '',
    updatingPost: false,
  }
  componentDidMount() {
    const storedValue = localStorage.getItem("selectedPost");
    const selectedUpdatePost: UpdatePostRequest = storedValue !== null ? JSON.parse(storedValue) : null;
    console.log(`selectedPost ${selectedUpdatePost}`)
    this.setState({
      newPostContent: selectedUpdatePost.content,
      newPostTitle: selectedUpdatePost.title
    })
  }

  // const { newPostTitle } = this.props.location.state;
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostContent: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      // validation
      if (this.state.newPostTitle === '' || this.state.newPostContent === '') {
        alert("title or content is blank")
        return
      }
      this.setState({
        updatingPost: true
      })
      await patchPost(this.props.auth.getIdToken(), this.props.match.params.postId, {
        title: this.state.newPostTitle,
        content: this.state.newPostContent
      })
      if (this.state.file) {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.postId)
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)
        alert('File was uploaded!')
      }
      alert("update successfully")
      this.setState({
        updatingPost: false
      })
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleUpdatePost = async () => {
    try {
      // validation
      if (this.state.newPostTitle === '' || this.state.newPostContent === '') {
        alert("title or content is blank")
      } else {
        this.setState({
          updatingPost: true
        })
        // const dueDate = this.calculateDueDate()
        await patchPost(this.props.auth.getIdToken(), this.props.match.params.postId, {
          title: this.state.newPostTitle,
          content: this.state.newPostContent
        })

      }
    } catch {
      alert('Post update failed')
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        {this.state.updatingPost ? (
          <Dimmer active inverted>
            <Loader inverted>updating</Loader>
          </Dimmer>) : <></>}
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Title</label>
            <input placeholder='First Name' onChange={this.handleTitleChange} value={this.state.newPostTitle} />
          </Form.Field>
          <Form.Field>
            <label>Content</label>
            <input placeholder='Last Name' onChange={this.handleContentChange} value={this.state.newPostContent} />
          </Form.Field>
          <Form.Field>
            <label>Upload new image</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          <Button type='submit'>Update</Button>
          {/* {this.renderButton()} */}
        </Form>
      </div>
    )
  }

  //   renderButton() {

  //     return (
  //       <div>
  //         {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
  //         {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
  //         <Button
  //           loading={this.state.uploadState !== UploadState.NoUpload}
  //           type="submit"
  //         >
  //           Upload
  //         </Button>
  //       </div>
  //     )
  //   }
}
