Update the Upload component by adding drag-and-drop handlers and an onChange function that passes files to a new processFile function. Inside processFile, use FileReader to get a Base64 string and setInterval to increment progress using constants from lib/constants.ts file. When progress reaches 100, clear the interval and call onComplete with the Base64 data after a REDIRECT_DELAY_MS delay. Ensure all upload logic is blocked if isSignedIn is false and the dropzone UI reflects the isDragging state.

Generate two Puter worker router endpoints in `lib/puter.worker.js` file. 

The first endpoint should be a GET request for `/api/projects/list` that accesses user.puter to list all keys starting with a `PROJECT_PREFIX` from the KV store and returns an object containing an array of those values. 

The second endpoint should be a GET request for /`api/projects/get` that extracts an id from the request search parameters and fetches the specific project from the `user.puter.kv` store using the prefixed key. 

Ensure both endpoints include error handling with try-catch blocks that return a 500 status using a jsonError helper and check for user authentication before proceeding.