import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/notes-api'
import {  getNotes,updateNote } from '../api/notes-api'
import { Notes } from './Notes'
import dateFormat from 'dateformat'
enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}


interface EditNoteProps {
  match: {
    params: {
      noteId: string
    }
  }
  auth: Auth
}

interface EditNoteState {
  name :string,
  file: any,
  text: string,
  uploadState: UploadState
}

export class EditNote extends React.PureComponent<
  EditNoteProps,
  EditNoteState
> {
  
  state: EditNoteState = {
    name : this.props.match.params.noteId,
    file: undefined,
    text: "",
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTextChange = (event: any) => {
    this.setState({ text: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {

    event.preventDefault()
    try {
      if(this.state.file){
        try {
          const uploadUrl = await getUploadUrl(
            this.props.auth.getIdToken(),
            this.state.name
          )
          await uploadFile(uploadUrl, this.state.file)
  
          alert('File was uploaded!')
        } catch (e) {
          alert('Could not upload a file: ' + e.message)
        } finally {
          console.log('Uploaded')
        }
      }
      
    } catch {
      alert('Note creation failed')
    }

    await updateNote(this.props.auth.getIdToken(), this.state.name, {
      name: this.state.text,
      dueDate:this.calculateDueDate(),
      done:true,
    })
    alert('Edit successful. Go to home');
    // const notes = await getNotes(this.props.auth.getIdToken())
    // this.setState({
    //   notes,
    //   newNoteName: '',
    //   loadingNotes: false,
    //   file: undefined
    // })
  }

  async fetchNote() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())
      // this.setState({
      //   notes,
      //   loadingNotes: false
      // })
      const note = notes.filter(note=>note.noteId===this.props.match.params.noteId)[0]
      this.setState({
        text:note.name,
      })
      console.log(note)
      return notes.filter(note=>note.noteId===this.props.match.params.noteId)
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
    
  }

  async componentDidMount() {
    try {
      const note=this.fetchNote();
      // const note = await getNotes(this.props.auth.getIdToken())
      // this.setState({
      //   text:note.text,
      //   loadingNotes: false
      // })
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
  }

  render() {
    console.log("test")
    console.log(this.props);
    // const note=this.fetchNote();
    return (
      <div>
        <h1>Edit here </h1>
        

        <Form >
            <Form.Field>
              <label>Enter Notes (*required)</label>
              {/* <input
                placeholder="Note down here"
                onChange={this.handleNameChange}
              value={this.state.text}
              /> */}
              <textarea placeholder="Note down here" value={this.state.text} onChange={this.handleTextChange}>
              </textarea>
            </Form.Field>
            <Form.Field>
              <label>Picture</label>
              <input 
                type="file"
                accept="image/*"
                placeholder="Upload Image"
                onChange={this.handleFileChange}
              />
            </Form.Field>
            <Button type="submit" onClick={this.handleSubmit} color="black" size="huge">
              Edit Note
            </Button>
          </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    // date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

}
