import {
    Decorator,
    Query,
    Table
} from "dynamo-types";

@Decorator.Table({ name: process.env.RAIN_TABLE })
export class RainData extends Table {

    @Decorator.FullPrimaryKey("Device_ID", "Timestamp")
    public static readonly primaryKey: Query.FullPrimaryKey<RainData, string, number>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<RainData>;

    public static async Create(DeviceID: string, value: boolean): Promise<void> {
        const data = new RainData();
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
    public value: boolean | undefined;
}
