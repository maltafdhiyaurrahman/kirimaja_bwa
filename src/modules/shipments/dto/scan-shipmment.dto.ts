import { z, ZodObject } from "zod";

const scanShipmentDto = z.object({
    tracking_number: z
        .string({
            required_error: 'Tracking number is required',
            invalid_type_error: 'Tracking number must be a string'
        }).min (1, 'Tracking number is required'),
    type: z
        .enum(
            ['IN', 'OUT'],
            {
                required_error: 'Type is required',
                invalid_type_error: 'Type must be either IN or OUT'
            }
        ),
    is_ready_to_pickup: z   
        .boolean()
        .optional()
        .default(false)
})

export class ScanShipmentDto {
    static schema: ZodObject<any> = scanShipmentDto;

    constructor (
        public tracking_number: string,
        public type: 'IN' | 'OUT',
        public is_ready_to_pickup: boolean = false
    ) {}
}