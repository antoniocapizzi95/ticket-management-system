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
      }],
      "paidPrice": 150
    }
    ```

    ```userId```: is the id of the user who is making the ticket purchase (in the mocked implementation only values 1, 2 and 3 are available as userId).

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

## Project Architecture and development stages

To design and implement the back-end project developed in Node, I followed a structured approach. The project is a ticket booking system for events, and I started by identifying the essential entities: users, events, and purchases.
Entities

  1. Users: This entity represents users who make ticket purchases. It consists of an ID and a username.

  2. Events: This entity represents events and contains all the relevant information, such as event ID, event name, date, number of available tickets, ticket price, location, etc.

  3. Purchases: This entity represents a ticket purchase transaction. It includes a purchase ID, the ID of the user making the purchase, a list of event IDs associated with the number of tickets purchased for each event, the date and time of the purchase, and the amount paid.

### Database Schema

When considering the database schema, to represent ```User``` and ```Event``` entities two simple tables are enough, but there are a few options for representing the ```Purchase``` entity:

  1. Relational database: If using a relational database, the user ID associated with the purchase can be a simple foreign key (one-to-many relationship). The list of event IDs associated with a single purchase can be represented in a separate table for mapping purposes. This arrangement allows tickets for an event to be purchased in multiple transactions, and a purchase can include tickets for multiple events.

  2. Non-relational database (e.g., MongoDB): In this case, the schema can be denormalized, and all the relevant information can be stored in a single table/document.

### API Development

The next step was developing the APIs. At a minimum, the project required endpoints for retrieving the list of available events, performing a transaction, and retrieving purchases made by a single user (for verifying that purchases were saved correctly).

Development was carried out incrementally in this way:

  1. First I created a generic project base, where the endpoints call functions present in a controller that then invokes a service with the execution logic. Initially, I implemented the endpoints without a logic, and then created mocked repositories (for users, purchases, and events) used within the services.

  2. Next, I focused on implementing the logic in the services. The ```purchase``` function in the ```PurchaseService``` contains the transaction execution logic, which involves using a mutex to ensure data consistency. This prevents issues where two users attempting transactions concurrently might end up with an incorrect number of available tickets for a specific event.

  3. For repositories, I created interfaces with the necessary method signatures. Then, I implemented the interfaces using mock functions. Notably, I passed the repositories as "agnostic" interfaces within the services. When the application starts, the implemented repositories are injected into the service constructors (it's visibile on ```src/routes.ts``` file). This design allows for transparent use of the repository by the service. If a database needs to be added later, only the repository interfaces need to be reimplemented with functions that read and write to the database. These implementations can then be injected during application startup without impacting the service logic.

  4. Additionally, a Postman repository was created and included with preconfigured requests to test the project. Unit tests with Jest were created specifically for the application's logic (i.e., the services), and the project was dockerized for easier local execution.

Please note that the current stage of the project does not involve an authentication system.