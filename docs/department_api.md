# Department API

## Create Department

**Endpoint**: `POST /admin/department`

**Description**: Creates a new department within the organization.

**Authentication**: Required (Admin or Manager role)

### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | The name of the department (must be unique). |
| `description` | String | No | A brief description of the department. |
| `status` | String | No | Status of the department. Enum: `["active", "inactive"]`. Default: `"active"`. |
| `allowedForms` | Array<String> | No | List of forms this department can access. Allowed values: `"AboveGround"`, `"serviceTicket"`, `"underGround"`, `"workOrder"`, `"customer"`, `"alarm"`. |
| `manager` | Array<ObjectId> | No | List of User IDs who will manage this department. |
| `doc` | Array<String> | No | Optional array of document strings. **Can be skipped.** |

### Example Payload (Skipping `doc`)

```json
{
  "name": "Fire Safety Inspection",
  "description": "Department responsible for all fire safety checks and balances.",
  "status": "active",
  "allowedForms": ["serviceTicket", "workOrder"],
  "manager": ["60d5ecb8b392d7001f8e8e8e"]
}
```

### Response JSON

**Status Code**: `201 Created`

```json
{
  "success": true,
  "data": {
    "department": {
      "name": "Fire Safety Inspection",
      "status": "active",
      "isDeleted": false,
      "doc": [],
      "allowedForms": [
        "serviceTicket",
        "workOrder"
      ],
      "manager": [
        {
          "_id": "60d5ecb8b392d7001f8e8e8e",
          "firstName": "John",
          "lastName": "Doe",
          "username": "jdoe"
        }
      ],
      "_id": "676aa6b8c8d9e0f1a2b3c4d5",
      "createdAt": "2025-12-24T08:15:30.123Z",
      "updatedAt": "2025-12-24T08:15:30.123Z",
      "__v": 0
    }
  },
  "message": "Department created successfully."
}
```

### Error Responses

**409 Conflict** (Duplicate Name)
```json
{
  "code": 409,
  "message": "Department with this name already exists.",
  "stack": "..."
}
```

**400 Bad Request** (Validation Error)
```json
{
  "code": 400,
  "message": "\"name\" is a required field",
  "stack": "..."
}
```
