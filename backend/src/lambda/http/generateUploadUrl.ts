import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { getPresignedImageUrl } from "../../businessLogic/note";
import { decodeJWTFromAPIGatewayEvent, parseUserId } from "../../auth/utils";
import { createLogger } from "../../utils/logger";
const logger = createLogger("note");
import * as uuid from "uuid";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);
    const noteId = event.pathParameters.noteId;

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    const jwtToken = decodeJWTFromAPIGatewayEvent(event);

    const userId = parseUserId(jwtToken);

    const imageId = uuid.v4();

    const signedUrl: String = await getPresignedImageUrl(
      noteId,
      imageId,
      userId
    );

    logger.info("note IMAGE URL CREATED", {
      // Additional information stored with a log statement
      key: noteId,
      userId: userId,
      imageId: imageId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: signedUrl }),
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
