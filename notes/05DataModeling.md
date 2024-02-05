## Data Modelling for backend with mongoose

1. **Data Modeling:**
   - **What is it?** Data modeling is the process of defining the structure of data and how it relates to other data elements. It involves creating a blueprint for organizing and representing data in a database.
   - **Importance in Backend:** In the backend, data modeling is crucial because it helps design databases effectively. It ensures that data is organized, stored, and retrieved in a way that aligns with the requirements of the application. A well-designed data model improves data integrity, query efficiency, and overall system performance.

2. **ODM (Object-Document Mapping) and ORM (Object-Relational Mapping):**
   - **ODM (Object-Document Mapping):**
     - **What is it?** ODM is a programming technique used in NoSQL databases (like MongoDB) where data is stored in a document format (e.g., JSON or BSON). ODM maps objects in your application directly to documents in the database.
     - **Example:** Mongoose for MongoDB is an example of an ODM. It allows you to define JavaScript objects that represent documents in MongoDB and provides a way to interact with the database using these objects.

   - **ORM (Object-Relational Mapping):**
     - **What is it?** ORM is a similar concept, but it is used in the context of relational databases. It maps objects in your application to tables in a relational database, handling the conversion between object-oriented code and relational database structures.
     - **Example:** Sequelize for PostgreSQL or MySQL is an example of an ORM. It allows you to interact with a relational database using JavaScript objects, making database operations more intuitive and object-oriented.

   - **Difference:**
     - The key difference lies in the type of database they are designed for. ODM is for NoSQL databases, and ORM is for relational databases. Both serve the purpose of simplifying database interactions by abstracting the underlying data model.

### Mongoose 
- To install `npm i mongoose`

- **Folder/File Stucture** - `src/models/modelName/` with have varous model files in `.js` with defined schema
```js
import mongoose from 'mongoose';
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
});
const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enums: ['PENDING', 'CANCELLED', 'DELIVERED'],
      default: 'PENDING',
    },
    orderItems: [orderItemSchema],
  },
  { timestamps: true }
);
export const Order =  mongoose.model('Order', orderSchema);

```
The model will be named as `orders` [Plural and Smallcase] and that's why we always name the Model in UpperCase and Singular , ie `Order`


Another Exammple - 
```js
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model('User', userSchema);
```

## Questions 
Q1. what is schema ? 

A1. In Mongoose, a schema is a blueprint that defines the structure of documents within a MongoDB collection. It specifies the fields, their types, validation rules, and other configuration options for the data stored in the collection.

Q2. What are various type of fields in mongoose ?

A2. Here are seven commonly used field types in Mongoose:
- String: Represents text data.
- Number: Represents numerical data.
- Boolean: Represents true/false values.
- Date: Represents a date and time.
- ObjectId: Represents MongoDB's ObjectId for establishing relationships between collections.
- Array: Represents an array of values or subdocuments.
- Object: Represents a nested object within a document.

Q3. What is `enums` in mongoose?

A3. In Mongoose, the enums field is used to define an enumeration (a set of allowed values) for a particular field. It restricts the field's possible values to those specified in the enumeration

Q4. What does `type: mongoose.Schema.Types.ObjectId` and `ref : SchemaName`mean?

A4. This line specifies that the field's type is a MongoDB ObjectId. ObjectId is a 12-byte identifier typically employed as a unique identifier for documents in MongoDB. When used in a schema, it often indicates a reference to another document in a different collection, establishing a relationship between the two collections. This is commonly used for creating relationships between documents in MongoDB databases.

`ref` - means reference to model with other schema

Q5. What does `{ timestamps: true }` in orderSchema do?

A5. `{ timestamps: true }` is an option in Mongoose schema that automatically adds createdAt and updatedAt fields to the documents. These fields store the timestamp when the document was created and when it was last updated, providing a convenient way to track document changes.

Q6. What does export const Order = mongoose.model('Order', orderSchema); do?

This line exports the Mongoose model named 'Order' based on the orderSchema. The model allows interacting with the 'orders' collection in the MongoDB database using the defined schema and provides methods for CRUD (Create, Read, Update, Delete) operations on orders.
