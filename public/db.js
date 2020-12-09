let db;

//creates a db request for a "budget" database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    // create object store "pending"
   const dbUpdate = event.target.result;
   dbUpdate.createObjectStore("pending", { autoIncrement: true });
 };
 
 request.onsuccess = function(event) {
   db = event.target.result;
 
   //checks if app is online and if so check db
   if (navigator.onLine) {
     checkDatabase();
   }
 };
 
 request.onerror = function(event) {
   console.log("Error " + event.target.errorCode);
 };
 
 function saveInput(input) {
   //Creates a transaction for pending db
   const transaction = db.transaction(["pending"], "readwrite");
 
   //Access the pending object store
   const store = transaction.objectStore("pending");
 
   //Add input to store
   store.add(input);
 }

 function checkDatabase() {
    //Opens transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    //Access pending object store
    const store = transaction.objectStore("pending");
    //Get all inputs from store and set to variable
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                //opens transaction on pending db
                const transaction = db.transaction(["pending"], "readwrite");

                //Accesses pending object store
                const store = transaction.objectStore("pending");

                store.clear();
            });
        }
    };
 }
