import {
    Decorator,
    Query,
    Table
} from "dynamo-types";

@Decorator.Table({ name: process.env.TEMPERATURE_TABLE })
export class TemperatureData extends Table {

    @Decorator.FullPrimaryKey("Device_ID", "Timestamp")
    public static readonly primaryKey: Query.FullPrimaryKey<TemperatureData, string, number>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<TemperatureData>;

    public static async Create(DeviceID: string, value: number): Promise<void> {
        const data = new TemperatureData();
        data.DeviceID = DeviceID;
        data.value = value;
        data.Timestamp = new Date().getTime();
        await data.save();
    }

    @Decorator.Attribute({ name: "Device_ID" })
    public DeviceID: string | undefined;

    @Decorator.Attribute({ name: "Timestamp" })
    public Timestamp: number | undefined;

    @Decorator.Attribute({ name: "Value" })
    public value: number | undefined;
}
