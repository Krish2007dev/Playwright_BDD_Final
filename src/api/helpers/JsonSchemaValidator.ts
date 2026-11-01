import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import userSchema from "../schemas/jsonplaceholder-user.schema.json";
import userListSchema from "../schemas/jsonplaceholder-user-list.schema.json";

const schemas: Record<string, object> = {
  user: userSchema,
  userList: userListSchema,
};

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(userSchema);

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? [])
    .map(
      (error) =>
        `${error.instancePath || "/"} ${error.message ?? "is invalid"}`,
    )
    .join("; ");
}

export function validateJsonSchema(schemaName: string, value: unknown): void {
  const schema = schemas[schemaName];
  if (!schema) {
    throw new Error(
      `Unknown JSON schema "${schemaName}". Available schemas: ${Object.keys(schemas).join(", ")}`,
    );
  }

  const validate: ValidateFunction = ajv.compile(schema);
  if (!validate(value)) {
    throw new Error(
      `JSON schema "${schemaName}" validation failed: ${formatErrors(validate.errors)}`,
    );
  }
}
