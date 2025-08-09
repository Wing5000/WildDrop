# **WildDrop**

WildDrop is a crypto Airdrop service with secure storage and management of various cryptocurrencies, offering a robust solution for individuals and institutions seeking reliable services. Join us to make crypto airdrops faster and more accessible than ever before.

## Important Notice

Keep in mind that this project is currently in a work-in-progress state. While we're actively developing and refining it, there are certain aspects that may be incomplete, unstable, or subject to change.

- **Incomplete Features**: Some features of the project may not be fully implemented or may be in various stages of development. As a result, certain functionalities may not work as expected or may be temporarily disabled.

- **Bugs and Issues**: Since the project is still in development, there may be bugs, errors, or issues that have not yet been addressed. We're working diligently to identify and resolve these issues, but your patience and understanding are appreciated.

- **Changes to Design and Functionality**: As we iterate on the project, there may be changes to the design or functionality. We're constantly refining our ideas and incorporating feedback to create the best possible experience for our users.

## Features:

- **Secure Storage**: Utilizes StarkNet blockchain technology for immutable and tamper-proof storage of crypto assets.
- **API Integration**: Provides a RESTful API for seamless integration with external applications and services.
- **Scalable Architecture**: Built on NodeJS for scalability, allowing the service to handle increasing demands effortlessly.
- **Private Key Management**: Implements robust encryption techniques for safeguarding private keys.

## Goals

- **KISS**: Avoid unnecessary complexity, favoring straightforward and easy-to-understand solutions over complex ones.
- **Easy**: In order to facilitate seamless integration with WildDrop servers, we provide libraries for this purpose.
- **Expandable**: We're preparing our platform to scale efficiently with the growth of the blockchain ecosystem.

## How You Can Help

- **Feedback**: Your feedback is invaluable to us! If you encounter any issues, have suggestions for improvement, or would like to share your thoughts, please don't hesitate to reach out to us. Your input helps us prioritize our efforts and make informed decisions.

- **Testing**: Help us identify bugs and issues by testing the project and providing feedback on your experience. Your testing efforts can help us improve the project's stability and usability.

## Security

- **Authentication**: Incoming requests are authenticated using asymmetric RSA encryption algorithm.
- **Data Encryption**: Each response coming from the WildDrop server is encrypted with symmetric AES-256-CBC. Keys are encrypted using the public key of the authenticated connection. Only holders of the private key will be able to read the response from the server.

# Run locally

Please be advised that you have the option to utilize Docker to run our project locally on your machine.

`docker build -t wilddrop .`  
`docker run --name wilddrop -p 9876:9876 -d wilddrop`

# Development

1. You need a PostgreSQL database. You can run it locally, use docker or host it remotely.
2. You also need an RSA key pair to run the server. You can generate them yourself or use the script we prepared:  
   `ts-node tools/gen-keypair.ts`
3. Create `.dev` file and fill with:

   | Key              | Value                          | Example                 |
   | ---------------- | ------------------------------ | ----------------------- |
   | PORT             | Server listen port             | 9876                    |
   | DB_HOST          | PostgreSQL host                | localhost               |
   | DB_NAME          | PostgreSQL database name       | wilddrop                |
   | DB_USER          | PostgreSQL user name           | wilddrop                |
   | DB_PASS          | PostgreSQL user password       | wilddrop                |
   | STARKNET_CONTRACT       | StarkNet contract address    | 0x0105665a1248be457eb9521b8f482c3bb920509fdf7a5cd8291f52ed613a5af9 |
   | STARKNET_ACCOUNT_ADDRESS | StarkNet account address     | 0x021be15fe1a2ade0a89a35fad3b3789c4a66673ffab25867741351ca82d78307 |
   | STARKNET_PRIVATE_KEY     | Private key for the account   | 0x01ec481195bf11fba6de6a6e3948c68047a32251c6e4820d7405ec41f07133cf |
   | STARKNET_RPC_URL         | StarkNet RPC node             | https://cloud.argent-api.com/v1/starknet/sepolia/rpc/v0.8 |

4. Install dependencies:  
   `yarn`
5. Run server locally:  
   `yarn dev`

To be able to connect to the server, you need to add the public key to the list of trusted keys in the database in the `auth_key` table.

# API

- **C#**: [Tubbly.WildDrop.Api.NET](https://github.com/Tam-Labs/Tubbly.WildDrop.Api.NET)
