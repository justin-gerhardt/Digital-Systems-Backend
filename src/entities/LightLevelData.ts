import {
    Decorator,
    Query,
    Table
} from "dynamo-types";

@Decorator.Table({ name: process.env.LIGHT_LEVEL_TABLE })
export class LightLevelData extends Table {

    @Decorator.FullPrimaryKey("Device_ID", "Timestamp")
    public static readonly primaryKey: Query.FullPrimaryKey<LightLevelData, string, number>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<LightLevelData>;

    private static ensureValidValue(value: number) {
        if (value < 0) {
            throw new RangeError("Light level value must be larger than 0");
        }
    }

    public static async Create(DeviceID: string, value: number): Promise<void> {
        const data = new LightLevelData();
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
