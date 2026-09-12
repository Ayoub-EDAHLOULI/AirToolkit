export interface HttpStatusCode {
  code: number;
  label: string;
  description: string;
}

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  {
    code: 100,
    label: "Continue",
    description:
      "The initial part of the request has been received and the client should continue.",
  },
  {
    code: 101,
    label: "Switching Protocols",
    description:
      "The server is switching protocols as requested by the client.",
  },
  { code: 200, label: "OK", description: "The request succeeded." },
  {
    code: 201,
    label: "Created",
    description: "The request succeeded and a new resource was created.",
  },
  {
    code: 202,
    label: "Accepted",
    description:
      "The request was accepted for processing, but processing is not complete.",
  },
  {
    code: 204,
    label: "No Content",
    description: "The request succeeded but there is no content to return.",
  },
  {
    code: 206,
    label: "Partial Content",
    description:
      "Only part of the resource is being returned, per a Range header.",
  },
  {
    code: 301,
    label: "Moved Permanently",
    description: "The resource has been permanently moved to a new URL.",
  },
  {
    code: 302,
    label: "Found",
    description: "The resource temporarily resides at a different URL.",
  },
  {
    code: 303,
    label: "See Other",
    description: "The response can be found under a different URL using GET.",
  },
  {
    code: 304,
    label: "Not Modified",
    description:
      "The resource has not changed since the last request (cache is valid).",
  },
  {
    code: 307,
    label: "Temporary Redirect",
    description: "Temporary redirect; the method and body must not change.",
  },
  {
    code: 308,
    label: "Permanent Redirect",
    description: "Permanent redirect; the method and body must not change.",
  },
  {
    code: 400,
    label: "Bad Request",
    description:
      "The server could not understand the request due to invalid syntax.",
  },
  {
    code: 401,
    label: "Unauthorized",
    description:
      "Authentication is required and has failed or not been provided.",
  },
  {
    code: 403,
    label: "Forbidden",
    description: "The client does not have access rights to the content.",
  },
  {
    code: 404,
    label: "Not Found",
    description: "The server can not find the requested resource.",
  },
  {
    code: 405,
    label: "Method Not Allowed",
    description:
      "The request method is known but not supported by the target resource.",
  },
  {
    code: 406,
    label: "Not Acceptable",
    description: "No content matching the request's Accept headers was found.",
  },
  {
    code: 408,
    label: "Request Timeout",
    description: "The server timed out waiting for the request.",
  },
  {
    code: 409,
    label: "Conflict",
    description: "The request conflicts with the current state of the server.",
  },
  {
    code: 410,
    label: "Gone",
    description:
      "The requested content has been permanently deleted and will not return.",
  },
  {
    code: 411,
    label: "Length Required",
    description:
      "The server rejected the request because Content-Length is missing.",
  },
  {
    code: 413,
    label: "Payload Too Large",
    description:
      "The request entity is larger than limits defined by the server.",
  },
  {
    code: 414,
    label: "URI Too Long",
    description:
      "The URI requested by the client is longer than the server can interpret.",
  },
  {
    code: 415,
    label: "Unsupported Media Type",
    description: "The media format of the requested data is not supported.",
  },
  {
    code: 422,
    label: "Unprocessable Entity",
    description: "The request was well-formed but semantically incorrect.",
  },
  {
    code: 425,
    label: "Too Early",
    description:
      "The server is unwilling to process a request that might be replayed.",
  },
  {
    code: 426,
    label: "Upgrade Required",
    description: "The client should switch to a different protocol.",
  },
  {
    code: 428,
    label: "Precondition Required",
    description: "The origin server requires the request to be conditional.",
  },
  {
    code: 429,
    label: "Too Many Requests",
    description:
      "The user has sent too many requests in a given amount of time.",
  },
  {
    code: 431,
    label: "Request Header Fields Too Large",
    description: "Header fields are too large for the server to process.",
  },
  {
    code: 451,
    label: "Unavailable For Legal Reasons",
    description: "The resource is unavailable for legal reasons.",
  },
  {
    code: 500,
    label: "Internal Server Error",
    description: "The server encountered an unexpected condition.",
  },
  {
    code: 501,
    label: "Not Implemented",
    description: "The request method is not supported by the server.",
  },
  {
    code: 502,
    label: "Bad Gateway",
    description:
      "The server, acting as a gateway, received an invalid response.",
  },
  {
    code: 503,
    label: "Service Unavailable",
    description:
      "The server is not ready to handle the request (overloaded or down).",
  },
  {
    code: 504,
    label: "Gateway Timeout",
    description:
      "The server, acting as a gateway, did not get a response in time.",
  },
  {
    code: 505,
    label: "HTTP Version Not Supported",
    description: "The HTTP version used in the request is not supported.",
  },
  {
    code: 507,
    label: "Insufficient Storage",
    description:
      "The server is unable to store the representation needed to complete the request.",
  },
  {
    code: 511,
    label: "Network Authentication Required",
    description: "The client needs to authenticate to gain network access.",
  },
];
