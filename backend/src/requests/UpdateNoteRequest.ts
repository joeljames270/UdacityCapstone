/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateNoteRequest {
  name: string
  dueDate: string
  done: boolean
}