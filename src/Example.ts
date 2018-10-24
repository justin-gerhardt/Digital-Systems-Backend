import * as HttpStatus from "http-status-codes";
import { Utils } from "./Utils";

// tslint:disable-next-line:no-submodule-imports
import "source-map-support/register";

export async function Example(event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) {
  return Utils.respond(HttpStatus.OK, "Hello World!");
}
