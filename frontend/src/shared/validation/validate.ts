import { AnyObjectSchema, InferType } from "yup";
import { FieldErrors, mapYupErrors } from "./yup";

export async function validateWithSchema<TSchema extends AnyObjectSchema>(
  schema: TSchema,
  value: unknown
): Promise<{ data: InferType<TSchema> | null; errors: FieldErrors }> {
  try {
    const data = await schema.validate(value, { abortEarly: false });
    return { data, errors: {} };
  } catch (error) {
    return { data: null, errors: mapYupErrors(error) };
  }
}
