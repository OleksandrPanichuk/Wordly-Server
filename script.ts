import {MongoClient} from 'mongodb'


const uri =  "mongodb+srv://sashapanichuk:wD2XZVDaa9YrwlBz@cluster0.z1v0ctz.mongodb.net/dev?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri)


async function run() {
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("PasswordResetLink"); // Replace with your collection name

    const indexOptions = {
      expireAfterSeconds: 600, // Documents expire after 1 hour (3600 seconds)
    };

    await collection.createIndex("createdAt", indexOptions); // Replace "yourDateField" with your actual date field

    console.log("TTL index created successfully!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
