import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";

import { UpdateNoteRequest } from "../../requests/UpdateNoteRequest";
import { updateNote } from "../../businessLogic/note";
import { decodeJWTFromAPIGatewayEvent } from "../../auth/utils";
import { parseUserId } from "../../auth/utils";
import { createLogger } from "../../utils/logger";
const logger = createLogger("note");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);

    const noteId = event.pathParameters.noteId;
    const updatedNote: UpdateNoteRequest = JSON.parse(event.body);

    const jwtToken = decodeJWTFromAPIGatewayEvent(event);
    const userId = parseUserId(jwtToken);

    // TODO: Update a TODO item with the provided id using values in the "updatedNote" object

    await updateNote(noteId, updatedNote, userId);

    logger.info("note UPDATED", {
      // Additional information stored with a log statement
      key: noteId,
      userId: userId,
      date: new Date().toISOString,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(true),
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
