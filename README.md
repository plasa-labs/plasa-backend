# Plasa Backend

Using Firebase Functions and Firestore.

## Table of Contents

- [Plasa Backend](#plasa-backend)
	- [Table of Contents](#table-of-contents)
	- [Firebase Functions Endpoints](#firebase-functions-endpoints)
		- [Endpoint Name: `/`](#endpoint-name-)
		- [Endpoint Name: `/user/:id`](#endpoint-name-userid)
		- [Endpoint Name: `/user/:id/instagram`](#endpoint-name-useridinstagram)
	- [Firestore Collections Structure](#firestore-collections-structure)
		- [Collection: `{followed_account}`](#collection-followed_account)
	- [Firestore Scripts (@firestore-scripts)](#firestore-scripts-firestore-scripts)
		- [push-followers-json.ts](#push-followers-jsonts)
		- [push-followers-json-multifile.ts](#push-followers-json-multifilets)
		- [push-followers-csv.ts](#push-followers-csvts)
		- [read-collection.ts](#read-collectionts)

## Firebase Functions Endpoints

### Endpoint Name: `/`

-   **HTTP Method**: GET
-   **Description**: Returns a simple greeting message.
-   **Response**:
    -   Success (200 OK):
        ```json
        "Hello!"
        ```

### Endpoint Name: `/user/:id`

-   **HTTP Method**: GET
-   **Description**: Retrieves full data for a user by ID.
-   **Query Parameters**:
    -   `id` (required): The ID of the user.
-   **Response**:
    -   Success (200 OK):
        ```json
        {
        	// User full data object
        }
        ```
    -   Error (400 Bad Request):
        ```json
        "User ID is required"
        ```
    -   Error (500 Internal Server Error):
        ```json
        "Failed to retrieve user data"
        ```

### Endpoint Name: `/user/:id/instagram`

-   **HTTP Method**: GET
-   **Description**: Sets the Instagram username for a user.
-   **Query Parameters**:
    -   `id` (required): The ID of the user.
    -   `username` (required): The Instagram username to set.
-   **Response**:
    -   Success (200 OK):
        ```json
        {
        	// Updated user full data object
        }
        ```
    -   Error (400 Bad Request):
        ```json
        "User ID is required"
        ```
        or
        ```json
        "Instagram username is required"
        ```
    -   Error (500 Internal Server Error):
        ```json
        "Failed to set Instagram username"
        ```

**Note**: Ensure that the `id` and `username` parameters are provided correctly to avoid errors.

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
