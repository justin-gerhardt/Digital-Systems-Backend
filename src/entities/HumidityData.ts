import {
    Decorator,
    Query,
    Table
} from "dynamo-types";

@Decorator.Table({ name: process.env.HUMIDITY_TABLE })
export class HumidityData extends Table {

    @Decorator.FullPrimaryKey("Device_ID", "Timestamp")
    public static readonly primaryKey: Query.FullPrimaryKey<HumidityData, string, number>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<HumidityData>;

    private static ensureValidValue(value: number) {
        if (value < 0 || value > 100) {
            throw new RangeError("Humidity value must be between 0 and 100");
        }
    }

    public static async Create(DeviceID: string, value: number): Promise<void> {
        const data = new HumidityData();
        data.DeviceID = DeviceID;
        this.ensureValidValue(value);
        data.value = value;
        data.Timestamp = new Date().getTime();
        await data.save();
    }

    @Decorator.Attribute({ name: "Device_ID" })
    public DeviceID!: string;

    @Decorator.Attribute({ name: "Timestamp" })
    public Timestamp!: number;

    @Decorator.Attribute({ name: "Value" })
    public value!: number;
}
