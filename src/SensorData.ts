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

async function AddData(deviceID: string, sensor: string, body: any) {
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
  const deviceID = event.pathParameters!.deviceID;
  if (!isUUIDv4(deviceID)) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Device id is invalid");
  }
  if (!event.body) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Post request must have a body");
  }
  let body: any;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Post body must be json");
  }
  const sensor = event.pathParameters!.sensor;
  try {
    return await AddData(deviceID, sensor, body);
  } catch (e) {
    if (e instanceof RangeError) {
      return Utils.respond(HttpStatus.BAD_REQUEST, { Error: "Data out of range", Message: e.message });
    } else {
      throw e;
    }
  }
}

export async function GetDataHandler(event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) {
  const deviceID = event.pathParameters!.deviceID;
  if (!isUUIDv4(deviceID)) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Device id is invalid");
  }
  const sensor = event.pathParameters!.sensor;
  let limitCount: number | null = null;
  let limitTime: number | null = null;
  if (event.queryStringParameters) {
    limitCount = parseInt(event.queryStringParameters!.limitCount, 10) || null;
    if (limitCount !== null && limitCount < 1) {
      return Utils.respond(HttpStatus.BAD_REQUEST, "limitCount must be at least one");
    }
    limitTime = parseInt(event.queryStringParameters!.limitTime, 10) || null;
    if (limitTime !== null && limitTime < 0) {
      return Utils.respond(HttpStatus.BAD_REQUEST, "limitTime must be greater than or equal to zero");
    }
  }

  let results = await GetData(deviceID, sensor);
  if (results == null) {
    return Utils.respond(HttpStatus.NOT_FOUND, "Sensor value is invalid");
  }
  if (limitTime !== null) {
    const now = new Date().getTime() / 1000;
    const after = now - limitTime;
    results = results.filter((x) => x.time >= after);
  }
  results.sort((a, b) => b.time - a.time);
  if (limitCount !== null) {
    results = results.slice(0, limitCount);
  }
  return Utils.respond(HttpStatus.OK, results);
}

async function GetData(deviceID: string, sensor: string) {
  let results: Array<{ time: number }> = [];
  switch (sensor) {
    case "rain": {
      const dbResponse = await RainData.primaryKey.query({ hash: deviceID });
      results = dbResponse.records.map((x) => ({
        raining: x.value,
        time: Math.floor(x.Timestamp / 1000)
      }));
      break;
    }
    case "humidity": {
      const dbResponse = await HumidityData.primaryKey.query({ hash: deviceID });
      results = dbResponse.records.map((x) => ({
        humidity: x.value,
        time: Math.floor(x.Timestamp / 1000)
      }));
      break;
    }
    case "lightLevel": {
      const dbResponse = await LightLevelData.primaryKey.query({ hash: deviceID });
      results = dbResponse.records.map((x) => ({
        lightLevel: x.value,
        time: Math.floor(x.Timestamp / 1000)
      }));
      break;
    }
    case "pressure": {
      const dbResponse = await PressureData.primaryKey.query({ hash: deviceID });
      results = dbResponse.records.map((x) => ({
        pressure: x.value,
        time: Math.floor(x.Timestamp / 1000)
      }));
      break;
    }
    case "temperature": {
      const dbResponse = await TemperatureData.primaryKey.query({ hash: deviceID });
      results = dbResponse.records.map((x) => ({
        temperature: x.value,
        time: Math.floor(x.Timestamp / 1000)
      }));
      break;
    }
    default: {
      return null;
    }
  }
  return results;
}

export async function StatusHandler(event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) {
  const deviceID = event.pathParameters!.deviceID;
  if (!isUUIDv4(deviceID)) {
    return Utils.respond(HttpStatus.BAD_REQUEST, "Device id is invalid");
  }

  const sensors = ["rain", "humidity", "pressure", "lightLevel", "temperature"];
  const results = await Promise.all(sensors.map((sensor) => {
    return GetData(deviceID, sensor).then((x) => {
      return x!.sort((a, b) => b.time - a.time)[0] || null;
    });
  }));

  if (results.every((x) => x === null)) {
    return Utils.respond(HttpStatus.NOT_FOUND, { ErrorMessage: "That device ID has never submitted any data" });
  }

  let maxTime = 0;
  for (const result of results) {
    if (result !== null && result.time > maxTime) {
      maxTime = result.time;
    }
  }

  const output = { MostRecentUpdate: maxTime };
  for (let i = 0; i < sensors.length; i++) {
    output[sensors[i]] = results[i];
  }

  return Utils.respond(HttpStatus.OK, output);
}
