import { z } from 'zod';

export function validateOutput(outputSchema: unknown, output: unknown): unknown {
  const schema = buildZodSchema(outputSchema);
  return schema.parse(output);
}

function buildZodSchema(schema: unknown): z.ZodTypeAny {
  if (!schema || typeof schema !== 'object') return z.unknown();

  const jsonSchema = schema as Record<string, unknown>;
  if (jsonSchema.type === 'object') {
    const properties = asRecord(jsonSchema.properties);
    const required = new Set(Array.isArray(jsonSchema.required) ? jsonSchema.required : []);
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, value] of Object.entries(properties)) {
      const field = buildZodSchema(value);
      shape[key] = required.has(key) ? field : field.optional();
    }

    return z.object(shape).passthrough();
  }

  if (jsonSchema.type === 'array') return z.array(buildZodSchema(jsonSchema.items));
  if (jsonSchema.type === 'string') return z.string();
  if (jsonSchema.type === 'number') return z.number();
  if (jsonSchema.type === 'integer') return z.number().int();
  if (jsonSchema.type === 'boolean') return z.boolean();
  return z.unknown();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
