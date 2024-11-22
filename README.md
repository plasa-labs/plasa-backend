# Plasa Backend

Using Firebase Functions and Firestore.

## Table of Contents

-   [Plasa Backend](#plasa-backend)
    -   [Table of Contents](#table-of-contents)
    -   [Firebase Functions Endpoints](#firebase-functions-endpoints)
        -   [Endpoint: `/`](#endpoint-)
        -   [Endpoint: `/user/:id`](#endpoint-userid)
        -   [Endpoint: `/instagram/code`](#endpoint-instagramcode)
        -   [Endpoint: `/instagram/verify`](#endpoint-instagramverify)
    -   [Firestore Collections Structure](#firestore-collections-structure)
        -   [Collection: `users`](#collection-users)
        -   [Collection: `instagram-codes`](#collection-instagram-codes)
        -   [Collection: `{followed_account}`](#collection-followed_account)
    -   [Firestore Scripts](#firestore-scripts)
        -   [push-followers-json.ts](#push-followers-jsonts)
        -   [push-followers-json-multifile.ts](#push-followers-json-multifilets)
        -   [push-followers-csv.ts](#push-followers-csvts)
        -   [read-collection.ts](#read-collectionts)

## Firebase Functions Endpoints

### Endpoint: `/`

-   **HTTP Method**: GET
-   **Description**: Returns a simple greeting message.
-   **Response**:
    -   Success (200 OK):
        ```json
        "Hello!"
        ```

### Endpoint: `/user/:id`

-   **HTTP Method**: GET
-   **Description**: Retrieves full data for a user by ID, including Instagram data and available stamps.
-   **Parameters**:
    -   `id` (required): The user's ID
-   **Response**:
    -   Success (200 OK):
        ```json
        {
        	"user_id": "string",
        	"instagram_username": "string | null",
        	"available_stamps": [
        		{
        			"signature": "string",
        			"deadline": "number",
        			"since": "number",
        			"stamp": {
        				"contractAddress": "string",
        				"chainId": "number",
        				"platform": "string",
        				"followedAccount": "string"
        			},
        			"authentic": "boolean"
        		}
        	] | null
        }
        ```
    -   Error (500 Internal Server Error):
        ```json
        {
        	"message": "Failed to retrieve user data",
        	"error": "error details"
        }
        ```

### Endpoint: `/instagram/code`

-   **HTTP Method**: POST
-   **Description**: Generates an Instagram verification code for ManyChat users.
-   **Headers**:
    -   `x-manychat-token` (required): ManyChat API token for authentication
-   **Request Body**: ManyChat Instagram user data
-   **Response**:
    -   Success (200 OK):
        ```json
        {
        	"version": "v2",
        	"content": {
        		"type": "instagram",
        		"messages": [
        			{
        				"type": "text",
        				"text": "string"
        			}
        		]
        	}
        }
        ```
    -   Error (401 Unauthorized):
        ```json
        {
        	"message": "Invalid ManyChat token"
        }
        ```

### Endpoint: `/instagram/verify`

-   **HTTP Method**: POST
-   **Description**: Verifies an Instagram code and links the Instagram account to a user.
-   **Request Body**:
    ```json
    {
    	"code": "number",
    	"user_id": "string"
    }
    ```
-   **Response**:
    -   Success (200 OK):
        ```json
        {
        	"status": "string",
        	"user_data": "UserResponse"
        }
        ```
    -   Error (400 Bad Request):
        ```json
        {
        	"message": "Invalid verification data"
        }
        ```

## Firestore Collections Structure

### Collection: `users`

-   **Description**: Stores user data.
-   **Document Structure**:
    ```json
    {
    	"user_id": "string",
    	"instagram_username": "string | null",
    	"available_stamps": [
    		{
    			"signature": "string",
    			"deadline": "number",
    			"since": "number",
    			"stamp": {
    				"contractAddress": "string",
    				"chainId": "number",
    				"platform": "string",
    				"followedAccount": "string"
    			},
    			"authentic": "boolean"
    		}
    	] | null
    }
    ```
-   **Document ID**: The document ID is the user's ID.
-   **Usage Examples**:

    ```javascript
    // Reading user data
    const userId = 'example_user'
    const docRef = db.collection('users').doc(userId)
    const doc = await docRef.get()
    if (doc.exists) {
    	console.log('User data:', doc.data())
    } else {
    	console.log('User not found')
    }

    // Writing user data (should be done through Firebase Functions)
    const userId = 'example_user'
    const userData = {
    	user_id: userId,
    	instagram_username: 'example_instagram',
    	available_stamps: [
    		{
    			signature: 'example_signature',
    			deadline: 1700000000,
    			since: 1600000000,
    			stamp: {
    				contractAddress: 'example_contractAddress',
    				chainId: 1,
    				platform: 'example_platform',
    				followedAccount: 'example_followedAccount'
    			},
    			authentic: true
    		}
    	]
    }
    await db.collection('users').doc(userId).set(userData)
    ```

### Collection: `instagram-codes`

-   **Description**: Stores Instagram verification codes.
-   **Document Structure**:
    ```json
    {
    	"code": "number",
    	"user_id": "string"
    }
    ```
-   **Document ID**: The document ID is the code.
-   **Usage Examples**:

    ```javascript
    // Reading Instagram code
    const code = 'example_code'
    const docRef = db.collection('instagram-codes').doc(code)
    const doc = await docRef.get()
    if (doc.exists) {
    	console.log('Instagram code:', doc.data())
    } else {
    	console.log('Instagram code not found')
    }

    // Writing Instagram code (should be done through Firebase Functions)
    const code = 'example_code'
    const userId = 'example_user'
    const codeData = {
    	code: code,
    	user_id: userId
    }
    await db.collection('instagram-codes').doc(code).set(codeData)
    ```

### Collection: `{followed_account}`

-   **Description**: Stores information about followers for each followed Instagram account. The collection name is the Instagram username of the followed account.
-   **Document Structure**:
    ```json
    {
    	"username": "string",
    	"follower_since": "number (timestamp)"
    }
    ```
-   **Document ID**: The document ID is the follower's Instagram username.
-   **Usage Examples**:

    ```javascript
    // Reading follower data
    const followedAccount = 'example_account'
    const followerUsername = 'follower_user'
    const docRef = db.collection(followedAccount).doc(followerUsername)
    const doc = await docRef.get()
    if (doc.exists) {
    	console.log('Follower data:', doc.data())
    } else {
    	console.log('Follower not found')
    }

    // Writing follower data (should be done through Firebase Functions)
    const followedAccount = 'example_account'
    const followerUsername = 'new_follower'
    const followerData = {
    	username: followerUsername,
    	follower_since: firebase.firestore.FieldValue.serverTimestamp()
    }
    await db.collection(followedAccount).doc(followerUsername).set(followerData)
    ```

## Firestore Scripts

### push-followers-json.ts

-   **Description**: This script reads follower data from a single JSON file and adds it to Firestore.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `FOLLOWERS_COLLECTION_TO_PUSH`: The Firestore collection to push data to
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
        - `FOLLOWERS_DATA_PATH`: Path to the JSON file containing follower data
    2. Run the script using `ts-node push-followers-json.ts`
-   **Key Features**:
    -   Processes followers in batches of 100 for efficient Firestore writes
    -   Handles large datasets by committing in batches
    -   Logs progress and any errors encountered

### push-followers-json-multifile.ts

-   **Description**: This script processes multiple JSON files containing follower data and adds them to Firestore.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `FOLLOWERS_COLLECTION_TO_PUSH`: The Firestore collection to push data to
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
        - `FOLLOWERS_FOLDER_NAME`: Name of the folder containing follower JSON files
    2. Run the script using `ts-node push-followers-json-multifile.ts`
-   **Key Features**:
    -   Processes multiple JSON files in a specified folder
    -   Handles followers in batches of 500 for efficient Firestore writes
    -   Skips reserved usernames (starting and ending with `__`)
    -   Provides detailed logging, including total followers added and skipped for each file and grand totals

### push-followers-csv.ts

-   **Description**: This script reads follower data from a CSV file and adds it to Firestore.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `FOLLOWERS_COLLECTION_TO_PUSH`: The Firestore collection to push data to
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
        - `CSV_FILE_PATH`: Path to the CSV file containing follower data
    2. Run the script using `ts-node push-followers-csv.ts`
-   **Key Features**:
    -   Processes followers from a CSV file
    -   Handles followers in batches of 100 for efficient Firestore writes
    -   Uses a fixed timestamp for all followers (currently set to '2024-06-12')
    -   Provides progress logging, including total records uploaded

### read-collection.ts

-   **Description**: This script reads and logs all documents from a specified Firestore collection.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `COLLECTION_TO_READ`: The Firestore collection to read from
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
    2. Run the script using `ts-node read-collection.ts`
-   **Key Features**:
    -   Reads all documents from the specified collection
    -   Logs document IDs and data
    -   Useful for verifying data after running the push scripts
