import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { deleteNote } from "../../businessLogic/note";
import { createLogger } from "../../utils/logger";
import { decodeJWTFromAPIGatewayEvent } from "../../auth/utils";
import { parseUserId } from "../../auth/utils";

const logger = createLogger("note");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);
    const noteId = event.pathParameters.noteId;

    const jwtToken = decodeJWTFromAPIGatewayEvent(event);

    const userId = parseUserId(jwtToken);

    // TODO: Remove a TODO item by id
    await deleteNote(noteId, userId);

    logger.info("note DELETED", {
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
