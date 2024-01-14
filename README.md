# Ticket Management System

Ticket Management System is a Node.js project developed with Express and Typescript. It exposes APIs that allow users to consult a list of events and purchase tickets for them.

Currently, the project does not use a real database, but the data is all mocked. In the future, it would be easy to integrate a database thanks to the use of the "dependency inversion" principle, which is used in this project.

## Getting Started

To run and test the project, you will need to follow these steps:

1. Clone the repository:

    ```git clone https://github.com/antoniocapizzi95/ticket-management-system```

2. On project root create a ```.env``` file and copy the contents of the ```.env.sample``` file already present in the repository.

3. Make sure you have Docker installed on your machine.

4. Run the following command to start the project:

    ```docker-compose up```

The project will start on the default port 5000.

## Testing

To run automated tests (developer with Jest), use the following command:

    npm run test

## Postman Collection

In the repository's root folder, you will find a "postman" directory that contains a Postman collection. This collection allows you to test the project locally.

## API Endpoints

### GET /events

This endpoint returns a list of available events.

- **URL:** `/events`
- **Method:** GET
- **Success Response:**
  - **Code:** 200 OK
  - **Body:**
    ```json
    {
      "availableEvents": [
        {
          "id": 1,
          "name": "event1",
          "availableTickets": 200,
          "ticketPrice": 50,
          "eventDate": "2024-06-01T00:00:00.000Z",
          "location": "Milan"
        },
        {
          "id": 2,
          "name": "event2",
          "availableTickets": 100,
          "ticketPrice": 40,
          "eventDate": "2024-07-12T00:00:00.000Z",
          "location": "Turin"
        },
        {
          "id": 3,
          "name": "event3",
          "availableTickets": 5,
          "ticketPrice": 30,
          "eventDate": "2023-12-01T00:00:00.000Z",
          "location": "Rome"
        }
      ]
    }
    ```
- **Error Response:**
  - **Code:** 500 Internal Server Error
  - **Body:**
    ```json
    {
      "error": "error message"
    }
    ```

### POST /purchase

This endpoint allows users to purchase tickets for events.

- **URL:** `/purchase`
- **Method:** POST
- **Body:**
    ```json
    {
        "userId": 1,
        "eventsToPurchase": [
        {
            "eventId": 1,
            "ticketsNumber": 3
        }
        ],
        "paidPrice": 150
    }
    ```

    ```userId```: is the id of the user who is making the ticket purchase (in the mockata implementation only values 1, 2 and 3 are available as userId).
    ```eventsToPurchase```: is an array of objects, each object containing the id of the event to be purchased and the number of tickets purchased for that event. Multiple event tickets can be purchased in a single transaction, but a maximum of 3 tickets can be purchased per event.
    ```paidPrice```: is the amount paid for the entire transaction, it must be consistent with the ticket price of each event and the number of tickets. It is assumed that the payment transaction took place on the front-end, then the paid amount is passed to the back-end (which will be checked to see if it is correct).

    Please note: if you try to purchase some tickets for a passed event, the transaction will be refused. This endpoint has a transactional logic, if one part of the request is incorrect, the entire purchase fails.

- **Success Response:**

    - **Code: 201 Created**
    - **Body:**
        ```json
        {
          "success": true
        }
        ```

- **Error Response:**

    - **Code: 400 Bad Request or 500 Internal Server Error**
    - **Body:**
        ```json
        {
          "success": false,
          "error": "error message"
        }
        ```

### GET /purchase/user/:id

This endpoint allows users to view their purchase history.

- **URL: /purchase/user/:id**
- **Method: GET**
- **URL Parameters:**
    - **id: the user's ID (in the mocked implementation there are available only 1, 2 and 3 userId)**
- **Success Response:**
    - **Code: 200 OK**
    - **Body:**

        ```json
        {
            "purchases": [
            {
                "userId": 1,
                "eventsToPurchase": [
                {
                    "eventId": 1,
                    "ticketsNumber": 3
                }
                ],
                "paidPrice": 150,
                "purchaseDateTime": "2024-01-14T16:12:42.607Z",
                "id": 1
            }
            ]
        }
        ```

- **Error Response:**

    - **Code: 400 Bad Request or 500 Internal Server Error**
    - **Body:**

        ```json
        {
          "error": "error message"
        }
        ```