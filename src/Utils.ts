
export class Utils {
  public static respond(code: number, message: any) {
    if (typeof message === "string" || message instanceof String) {
      message = { Message: message };
    }
    message.ResponseCode = code;
    console.log(JSON.stringify(message));
    delete message.ResponseCode;
    message = JSON.stringify(message);
    return {
      body: message,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: code
    };
  }

  public static respondRaw(code: number, message: any) {
    console.log(JSON.stringify({ ResponseCode: code, Message: message }));
    return {
      body: message,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      },
      statusCode: code
    };
  }

  public static redirect(url: string) {
    console.log(`Redirecting to "${url}"`);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        Location: url
      },
      statusCode: 307
    };
  }
}
