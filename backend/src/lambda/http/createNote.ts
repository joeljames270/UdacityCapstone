import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { CreateNoteRequest } from "../../requests/CreateNoteRequest";
import { createNote } from "../../businessLogic/note";
import { decodeJWTFromAPIGatewayEvent } from "../../auth/utils";
import * as uuid from "uuid";
import { parseUserId } from "../../auth/utils";
import { createLogger } from "../../utils/logger";
const logger = createLogger("note");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);

    // TODO: Implement creating a new TODO item
    const noteRequest: CreateNoteRequest = JSON.parse(event.body);
    if(noteRequest.name===""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Cannot create empty ToDo",
        }),
      };
    }

    const noteId = uuid.v4();
    const jwtToken = decodeJWTFromAPIGatewayEvent(event);

    const userId = parseUserId(jwtToken);

    const newNote = await createNote(noteId, noteRequest, userId);

    logger.info("note CREATED", {
      // Additional information stored with a log statement
      key: noteId,
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newNote,
      }),
    };
  }
);

handler
  .use(
    cors({
      credentials: true,
    })
  )
  .use(httpErrorHandler());
