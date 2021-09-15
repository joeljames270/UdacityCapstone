import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import { Form } from 'semantic-ui-react'
import { getUploadUrl, uploadFile } from '../api/notes-api'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createNote, deleteNote, getNotes, patchNote } from '../api/notes-api'
import Auth from '../auth/Auth'
import { Note } from '../types/Note'

interface NotesProps {
  auth: Auth
  history: History
}

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface NotesState {
  notes: Note[]
  newNoteName: string
  loadingNotes: boolean
  file: any
  uploadState: UploadState
}

export class Notes extends React.PureComponent<NotesProps, NotesState> {
  state: NotesState = {
    notes: [],
    newNoteName: '',
    loadingNotes: true,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleNameChange = (event: any) => {
    this.setState({ newNoteName: event.target.value })
  }

  handleFileChange = (event: any) => {
    const files = event.target.files
    console.log(files)
    if (!files) return

    this.setState({
      file: files[0]
    })
    console.log(this.state)
  }

  onEditButtonClick = (noteId: string) => {
    this.props.history.push(`/notes/${noteId}/edit`)
  }

  onNoteCreate = async (event: any) => {
    event.preventDefault()
    try {
      this.setState({
        loadingNotes: true
      })

      const dueDate = this.calculateDueDate()
      const newNote = await createNote(this.props.auth.getIdToken(), {
        name: this.state.newNoteName,
        dueDate
      })
      // this.setState({
      //   notes: [...this.state.notes, newNote],
      //   newNoteName: ''
      // })
      if(this.state.file){
        try {
          const uploadUrl = await getUploadUrl(
            this.props.auth.getIdToken(),
            newNote.noteId
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

    const notes = await getNotes(this.props.auth.getIdToken())
    this.setState({
      notes,
      newNoteName: '',
      loadingNotes: false,
      file: undefined
    })
  }

  onNoteDelete = async (noteId: string) => {
    try {
      await deleteNote(this.props.auth.getIdToken(), noteId)
      this.setState({
        notes: this.state.notes.filter((note) => note.noteId != noteId)
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  onNoteCheck = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchNote(this.props.auth.getIdToken(), note.noteId, {
        name: note.name,
        dueDate: note.dueDate,
        done: !note.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { done: { $set: !note.done } }
        })
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())
      this.setState({
        notes,
        loadingNotes: false
      })
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Sticky Notes</Header>

        {this.renderCreateNoteInput()}

        {this.renderNotes()}
      </div>
    )
  }

  renderCreateNoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form >
            <Form.Field>
              <label>Enter Notes (*required)</label>
              <textarea placeholder="Note down here" onChange={this.handleNameChange}>

              </textarea>
              {/* <input
                placeholder="Note down here"
                onChange={this.handleNameChange}
              /> */}
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
            <Button type="submit" onClick={this.onNoteCreate} color="black" size="huge">
              Note
            </Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNotes() {
    if (this.state.loadingNotes) {
      return this.renderLoading()
    }

    return this.renderNotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Notes
        </Loader>
      </Grid.Row>
    )
  }

  renderNotesList() {
    return (
      <Grid padded>
        {this.state.notes.map((note, pos) => {
          return (
            <Grid.Row key={note.noteId}>
              <Grid.Column width={1} verticalAlign="middle">
                {/* <Checkbox
                  onChange={() => this.onNoteCheck(pos)}
                  checked={note.done}
                /> */}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {note.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {note.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onEditButtonClick(note.noteId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onNoteDelete(note.noteId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              {note.attachmentUrl && (
                <Image src={note.attachmentUrl} size="large" wrapped centered />
              )}
              


              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    // date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
