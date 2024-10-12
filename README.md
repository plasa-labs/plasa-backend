# Plasa Backend

Using Firebase Functions and Firestore.

## Firebase Functions Endpoints

### Endpoint Name: `accountOwnership`

-   **HTTP Method**: POST
-   **Description**: Handles Instagram account ownership verification and signs the account ownership.
-   **Authentication**: Required (assumed, as it's a Firebase Function)
-   **Request Body**:
    ```json
    {
    	"instagramUsername": "string",
    	"userAddress": "string"
    }
    ```
-   **Response**:
    -   Success (200 OK):
        ```json
        {
            "signature": "string",
            "deadline": number
        }
        ```
    -   Error (400 Bad Request):
        ```json
        {
        	"error": "Missing instagramUsername or userAddress"
        }
        ```
    -   Error (500 Internal Server Error):
        ```json
        {
        	"error": "Error signing account ownership"
        }
        ```
-   **Example Usage**:

    ```javascript
    const response = await fetch(
    	'https://your-firebase-function-url/accountOwnership',
    	{
    		method: 'POST',
    		headers: {
    			'Content-Type': 'application/json'
    		},
    		body: JSON.stringify({
    			instagramUsername: 'example_user',
    			userAddress: '0x1234567890123456789012345678901234567890'
    		})
    	}
    )

    const data = await response.json()
    console.log(data)
    ```

### Endpoint Name: `followerStamp`

-   **HTTP Method**: POST
-   **Description**: Handles Instagram follower stamp requests and verifies follower status.
-   **Authentication**: Required (assumed, as it's a Firebase Function)
-   **Request Body**:
    ```json
    {
    	"instagramUsername": "string",
    	"userAddress": "string",
    	"followedAccount": "string"
    }
    ```
-   **Response**:
    -   Success (200 OK):
        ```json
        {
            "signature": "string",
            "deadline": number,
            "followerSince": number
        }
        ```
    -   Error (400 Bad Request):
        ```json
        {
        	"error": "Missing instagramUsername, userAddress, or followedAccount"
        }
        ```
    -   Error (404 Not Found):
        ```json
        {
        	"error": "User is not a follower"
        }
        ```
    -   Error (500 Internal Server Error):
        ```json
        {
        	"error": "Error generating follower stamp"
        }
        ```
-   **Example Usage**:

    ```javascript
    const response = await fetch(
    	'https://your-firebase-function-url/followerStamp',
    	{
    		method: 'POST',
    		headers: {
    			'Content-Type': 'application/json'
    		},
    		body: JSON.stringify({
    			instagramUsername: 'example_user',
    			userAddress: '0x1234567890123456789012345678901234567890',
    			followedAccount: 'followed_account'
    		})
    	}
    )

    const data = await response.json()
    console.log(data)
    ```

## Firestore Collections Structure

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

## Firestore Scripts (@firestore-scripts)

### push-followers.ts

-   **Description**: This script reads follower data from a JSON file and adds it to Firestore.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `FOLLOWERS_COLLECTION_TO_PUSH`: The Firestore collection to push data to
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
        - `FOLLOWERS_DATA_PATH`: Path to the JSON file containing follower data
    2. Run the script using `ts-node push-followers.ts`
-   **Key Features**:
    -   Processes followers in batches of 100 for efficient Firestore writes
    -   Handles large datasets by committing in batches
    -   Logs progress and any errors encountered

### push-followers-multiple.ts

-   **Description**: This script processes multiple JSON files containing follower data and adds them to Firestore.
-   **Usage**:
    1. Set the required environment variables in a `.env` file:
        - `FOLLOWERS_COLLECTION_TO_PUSH`: The Firestore collection to push data to
        - `SERVICE_ACCOUNT_PATH`: Path to the Firebase service account JSON file
        - `FOLLOWERS_FOLDER_NAME`: Name of the folder containing follower JSON files
    2. Run the script using `ts-node push-followers-multiple.ts`
-   **Key Features**:
    -   Processes multiple JSON files in a specified folder
    -   Handles followers in batches of 500 for efficient Firestore writes
    -   Skips reserved usernames (starting and ending with `__`)
    -   Provides detailed logging, including total followers added and skipped

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
