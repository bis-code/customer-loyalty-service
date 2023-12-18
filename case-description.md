# Test case: Customer Loyalty Program

You are tasked with implementing a new service to support our customer loyalty program.

With the new loyalty program, customers are rewarded with points when they place orders at Whiteaway. These points can be used to buy products free of charge.

The service is responsible for keeping track of how many points the customer has saved up with us.

For every 50 kroner the customer spends at Whiteaway, it earns 1 loyalty point. Loyalty points expire after 6 months.


## Endpoints

The service must implement 3 HTTP endpoints:

### 1. Event webhook

POST /webhook

Various events, formatted as JSON, are posted to this endpoint in the body of the HTTP request. 
Look further down for a list of events, which could be posted to this endpoint.


### 2. Get loyalty points for customer

GET /${CUSTOMER_ID}/points

Will return the sum of saved-up loyalty points for a given customer.


### 3. Consume loyalty points

POST /${CUSTOMER_ID}/consume

When this endpoint is invoked, it will subtract the provided loyalty point value from the sum of points 
for the given customer and return the new sum.


## Events

Events will be fired at the webhook out of order and with an "at least once guarantee", 
meaning that the same event may be fired multiple times. 
The following list of events can be expected:

1. [Customer Created](event-samples/CustomerCreated.json)

    This event is sent when a new customer is created.


2. [Customer Deleted](event-samples/CustomerDeleted.json)

    Sent when the customer is deleted. You can expect no further activity from this customer 
    following this event.


3. [Order Placed](event-samples/OrderPlaced.json)

    This indicates that an order has been placed. The order contains an ID, a customer ID 
    and the total order amount.


4. [Order Returned](event-samples/OrderReturned.json)
    
    Sent when an order has been returned and reimbursed.
    

5. [Order Canceled](event-samples/OrderCanceled.json)
    
    Sent when an order is cancelled.


## Testing your code

A binary has been provided, which can be used to fire events at your event webhook endpoint.

Multiple binaries are available, select the one, which suits your system. 
If you have any problems running the application, please let us know immediately.

You may use the following command to start posting events at your endpoint:
`./bin/${YOUR_OS}/${YOUR_ARCH}/loyalty --target=http://localhost/webhook --concurrency=1 --delay=500ms`

You may tweak the concurrency and delay to increase the load to test 
performance of your code.

You may read the help screen by running: `./bin/${YOUR_OS}/${YOUR_ARCH}/loyalty --help`


## Deliverable

We expect you to deliver a Node.js Typescript service with working code.
You may send us a link to an online git repo or zip the relevant files and send it by email. 

We value well-structured code, automated tests, documentation and reasoning 
behinds choices, assumptions and shortcuts you may have taken. 

If you do not finish, please submit what you have and describe your thoughts and 
what problems you ran into. This is still interesting to look at.

If you submit it using Github, please share it with `cod-wag` and `wagsor`.
