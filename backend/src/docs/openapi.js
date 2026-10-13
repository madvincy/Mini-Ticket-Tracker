const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Lodwar Services Mini Ticket Tracker API',
    version: '1.0.0',
    description: 'Ticket creation, searchable and sortable listing, status history, updates, and status counts.'
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Tickets', description: 'Ticket operations' },
    { name: 'Health', description: 'Service health' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        responses: {
          200: {
            description: 'API is ready',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } }
          }
        }
      }
    },
    '/tickets': {
      post: {
        tags: ['Tickets'],
        summary: 'Create a ticket',
        description: 'Omitted status and priority default to open and medium.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTicket' } } }
        },
        responses: {
          201: {
            description: 'Ticket created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketResponse' } } }
          },
          400: { $ref: '#/components/responses/ValidationError' }
        }
      },
      get: {
        tags: ['Tickets'],
        summary: 'List tickets',
        description: 'Search title and description, filter by inclusive creation-date range and status, and sort by an allow-listed field.',
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { $ref: '#/components/schemas/TicketStatus' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', required: false, schema: { type: 'string', maxLength: 200 } },
          { name: 'from', in: 'query', required: false, description: 'Inclusive start date (YYYY-MM-DD)', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', required: false, description: 'Inclusive end date (YYYY-MM-DD)', schema: { type: 'string', format: 'date' } },
          { name: 'sortBy', in: 'query', required: false, schema: { type: 'string', enum: ['created_at', 'title', 'priority', 'status'], default: 'created_at' } },
          { name: 'sortOrder', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
        ],
        responses: {
          200: {
            description: 'Paginated ticket list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketListResponse' } } }
          },
          400: { $ref: '#/components/responses/ValidationError' }
        }
      }
    },
    '/tickets/stats': {
      get: {
        tags: ['Tickets'],
        summary: 'Get counts by status',
        responses: {
          200: {
            description: 'Counts for every ticket status',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } } }
          }
        }
      }
    },
    '/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Get ticket details and status history',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[1-9]\\d*$' } }],
        responses: {
          200: {
            description: 'Ticket details with chronological status events',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketDetailsResponse' } } }
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      patch: {
        tags: ['Tickets'],
        summary: 'Update ticket status and/or priority',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', pattern: '^[1-9]\\d*$' }
        }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTicket' } } }
        },
        responses: {
          200: {
            description: 'Ticket updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketResponse' } } }
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    }
  },
  components: {
    schemas: {
      TicketStatus: {
        type: 'string',
        enum: ['open', 'in_progress', 'closed']
      },
      TicketPriority: {
        type: 'string',
        enum: ['low', 'medium', 'high']
      },
      Ticket: {
        type: 'object',
        required: ['id', 'title', 'description', 'status', 'priority', 'created_at'],
        properties: {
          id: { type: 'integer', format: 'int64', example: 7 },
          title: { type: 'string', minLength: 1, maxLength: 255, example: 'Printer offline' },
          description: { type: 'string', nullable: true, maxLength: 5000, example: 'Floor 2' },
          status: { $ref: '#/components/schemas/TicketStatus' },
          priority: { $ref: '#/components/schemas/TicketPriority' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      CreateTicket: {
        type: 'object',
        additionalProperties: false,
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 5000 },
          status: { $ref: '#/components/schemas/TicketStatus' },
          priority: { $ref: '#/components/schemas/TicketPriority' }
        }
      },
      UpdateTicket: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
          status: { $ref: '#/components/schemas/TicketStatus' },
          priority: { $ref: '#/components/schemas/TicketPriority' }
        }
      },
      TicketResponse: {
        type: 'object',
        required: ['data'],
        properties: { data: { $ref: '#/components/schemas/Ticket' } }
      },
      TicketDetailsResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            allOf: [
              { $ref: '#/components/schemas/Ticket' },
              {
                type: 'object',
                required: ['history'],
                properties: {
                  history: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'event_type', 'from_status', 'to_status', 'changed_at'],
                      properties: {
                        id: { type: 'integer', format: 'int64' },
                        event_type: { type: 'string', enum: ['created', 'status_changed', 'baseline'] },
                        from_status: { allOf: [{ $ref: '#/components/schemas/TicketStatus' }], nullable: true },
                        to_status: { $ref: '#/components/schemas/TicketStatus' },
                        changed_at: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      TicketListResponse: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
          meta: {
            type: 'object',
            required: ['page', 'limit', 'total', 'totalPages'],
            properties: {
              page: { type: 'integer', minimum: 1 },
              limit: { type: 'integer', minimum: 1, maximum: 100 },
              total: { type: 'integer', minimum: 0 },
              totalPages: { type: 'integer', minimum: 0 }
            }
          }
        }
      },
      StatsResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['open', 'in_progress', 'closed'],
            properties: {
              open: { type: 'integer', minimum: 0 },
              in_progress: { type: 'integer', minimum: 0 },
              closed: { type: 'integer', minimum: 0 }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['field', 'message'],
                  properties: { field: { type: 'string' }, message: { type: 'string' } }
                }
              }
            }
          }
        }
      },
      HealthResponse: {
        type: 'object',
        required: ['data'],
        properties: { data: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } }
      }
    },
    responses: {
      ValidationError: {
        description: 'Input failed validation',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
      },
      NotFound: {
        description: 'Ticket id is valid but no ticket exists',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
      }
    }
  }
};

module.exports = openapi;