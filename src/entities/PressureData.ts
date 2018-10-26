import {
    Decorator,
    Query,
    Table
} from "dynamo-types";

@Decorator.Table({ name: process.env.PRESSURE_TABLE })
export class PressureData extends Table {

    @Decorator.FullPrimaryKey("Device_ID", "Timestamp")
    public static readonly primaryKey: Query.FullPrimaryKey<PressureData, string, number>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<PressureData>;

    private static ensureValidValue(value: number) {
        if (value < 0) {
            throw new RangeError("Pressure value must be larger than 0");
        }
    }

    public static async Create(DeviceID: string, value: number): Promise<void> {
        const data = new PressureData();
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
