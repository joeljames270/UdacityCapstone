import { Note } from "../models/Note";
import { NoteAccess } from "../dataLayer/NoteAccess";
import { CreateNoteRequest } from "../requests/CreateNoteRequest";
import { UpdateNoteRequest } from "../requests/UpdateNoteRequest";
import { String } from "aws-sdk/clients/appstream";

const noteAccess = new NoteAccess();

export async function getAllNotesForUser(userId: string): Promise<any> {
  return noteAccess.getAllNotesForUser(userId);
}

export async function createNote(
  noteId: String,
  createNoteRequest: CreateNoteRequest,
  userId: string
): Promise<Note> {
  const note = noteAccess.createNote({
    noteId: noteId,
    userId: userId,
    name: createNoteRequest.name,
    dueDate: createNoteRequest.dueDate,
    done: false,
    attachmentUrl: undefined,
  } as Note);

  return note;
}

export async function updateNote(
  noteId: String,
  updatedNote: UpdateNoteRequest,
  userId: String
): Promise<void> {
  noteAccess.updateNote(noteId, updatedNote, userId);
}

export async function deleteNote(
  noteId: String,
  userId: String
): Promise<void> {
  noteAccess.deleteNote(noteId, userId);
}

export async function getPresignedImageUrl(
  noteId: String,
  imageId: String,
  userId: String
): Promise<string> {
  return noteAccess.getPresignedImageUrl(noteId, imageId, userId);
}
