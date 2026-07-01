# API DESIGN OVERVIEW

## Host & Protocol
All API endpoints communicate over HTTPS.
- **Base Endpoint**: `https://api.aetherorganic.com/v1`
- **Default Format**: JSON (`Content-Type: application/json`)

## Global Headers
| Header | Description | Required |
|--------|-------------|----------|
| `Authorization` | JWT Token in format: `Bearer <token>` | Yes (for protected endpoints) |
| `Accept-Language` | Language fallback picker: `en` (English) or `ta` (Tamil) | No (defaults to `en`) |
| `X-Client-Platform` | Identifier client: `web` | No |

## Standard Error Response
All non-200 responses return a unified error body:
```json
{
  "success": false,
  "code": "VALIDATION_FAILED",
  "message": "One or more input fields were invalid.",
  "errors": [
    { "field": "email", "issue": "Invalid email formatting" }
  ]
}
```

## HTTP Status Reference
* `200 OK` / `201 Created` &rarr; Success queries.
* `400 Bad Request` &rarr; Malformed parameter payloads.
* `401 Unauthorized` &rarr; Missing/expired authentication tokens.
* `403 Forbidden` &rarr; Insufficient role rights (e.g. customer accessing admin).
* `404 Not Found` &rarr; Resource does not exist.
* `429 Too Many Requests` &rarr; Rate limit exceeded (e.g. login brute force).
* `500 Server Error` &rarr; Fallback internal failure.
