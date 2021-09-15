import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Note } from "../models/Note";
import { UpdateNoteRequest } from "../requests/UpdateNoteRequest";

const XAWS = AWSXRay.captureAWS(AWS);

export class NoteAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly noteTable = process.env.NOTES_TABLE,
    private readonly noteIndex = process.env.NOTE_USER_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.S3_URL_EXPIRATION,
    private readonly s3 = new XAWS.S3({
      signatureVersion: "v4",
    })
  ) {}

  async getAllNotesForUser(userId: String): Promise<any> {
    const result = this.docClient
      .query({
        TableName: this.noteTable,
        IndexName: this.noteIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    return result;
  }

  async createNote(note: Note): Promise<Note> {
    this.docClient
      .put({
        TableName: this.noteTable,
        Item: note,
      })
      .promise();

    return note;
  }

  async updateNote(
    noteId: String,
    updatedNote: UpdateNoteRequest,
    userId: String
  ): Promise<void> {
    console.log("Updating noteId: ", noteId, " userId: ", userId);

    this.docClient.update(
      {
        TableName: this.noteTable,
        Key: {
          noteId,
          userId,
        },
        UpdateExpression: "set #name = :n, #dueDate = :due, #done = :d",
        ExpressionAttributeValues: {
          ":n": updatedNote.name,
          ":due": updatedNote.dueDate,
          ":d": updatedNote.done,
        },
        ExpressionAttributeNames: {
          "#name": "name",
          "#dueDate": "dueDate",
          "#done": "done",
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
  }

  async deleteNote(noteId: String, userId: String): Promise<void> {
    this.docClient.delete(
      {
        TableName: this.noteTable,
        Key: {
          noteId,
          userId,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element deleted " + data);
        }
      }
    );
  }
  async getPresignedImageUrl(
    noteId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    const attachmentUrl = await this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration,
    });

    this.docClient.update(
      {
        TableName: this.noteTable,
        Key: {
          noteId,
          userId,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    return attachmentUrl;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new AWS.DynamoDB.DocumentClient();
}
