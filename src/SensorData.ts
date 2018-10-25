import * as HttpStatus from "http-status-codes";
import { Utils } from "./Utils";

// tslint:disable-next-line:no-submodule-imports
import "source-map-support/register";

import { HumidityData } from "./entities/HumidityData";
import { LightLevelData } from "./entities/LightLevelData";
import { PressureData } from "./entities/PressureData";
import { RainData } from "./entities/RainData";
import { TemperatureData } from "./entities/TemperatureData";

function isUUIDv4(value: string) {
  const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return v4Regex.test(value);
}

async function AddData(event: AWSLambda.APIGatewayEvent) {
  const deviceID = event.pathParameters!.deviceID;
  if (!isUUIDv4(deviceID)) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Device id is invalid");
  }
  const sensor = event.pathParameters!.sensor;
  if (!event.body) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Post request must have a body");
  }
  let body: any;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Post body must be json");
  }
  switch (sensor) {
    case "rain": {
      if (body.raining === null || typeof body.raining !== "boolean") {
        return Utils.respond(HttpStatus.BAD_REQUEST, "Body must have a raining boolean");
      }
      await RainData.Create(deviceID, body.raining);
      break;
    }
    case "humidity": {
      if (body.humidity === null || typeof body.humidity !== "number") {
        return Utils.respond(HttpStatus.BAD_REQUEST, "Body must have a humidity float");
      }
      await HumidityData.Create(deviceID, body.humidity);
      break;
    }
    case "lightLevel": {
      if (body.lightLevel === null || typeof body.lightLevel !== "number") {
        return Utils.respond(HttpStatus.BAD_REQUEST, "Body must have a lightLevel float");
      }
      await LightLevelData.Create(deviceID, body.lightLevel);
      break;
    }
    case "pressure": {
      if (body.pressure === null || typeof body.pressure !== "number") {
        return Utils.respond(HttpStatus.BAD_REQUEST, "Body must have a pressure float");
      }
      await PressureData.Create(deviceID, body.pressure);
      break;
    }
    case "temperature": {
      if (body.temperature === null || typeof body.temperature !== "number") {
        return Utils.respond(HttpStatus.BAD_REQUEST, "Body must have a temperature float");
      }
      await TemperatureData.Create(deviceID, body.temperature);
      break;
    }
    default: {
      return Utils.respond(HttpStatus.NOT_FOUND, "Sensor value is invalid");
    }
  }
  return Utils.respond(HttpStatus.OK, "Data Added");
}

export async function AddDataHandler(event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) {
  try {
    return await AddData(event);
  } catch (e) {
    if (e instanceof RangeError) {
      return Utils.respond(HttpStatus.BAD_REQUEST, { Error: "Data out of range", Message: e.message });
    } else {
      throw e;
    }
  }
}
