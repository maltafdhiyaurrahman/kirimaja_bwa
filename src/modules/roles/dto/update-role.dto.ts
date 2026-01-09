import { z, ZodObject } from "zod";

const updateRoleSchema = z.object({
    permission_ids: z
    .array(
        z.number({
            required_error: "Permission ID is required",
            invalid_type_error: "Permission ID must be a number",
        })
    ).nonempty({
        message: "At least one permission ID must be provided",
    }),
})

export class UpdateRoleDto {
    static schema: ZodObject<any> = updateRoleSchema;

    constructor(
        public permission_ids: number[],
    ) {}
}