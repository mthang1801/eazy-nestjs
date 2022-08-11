<h1 style="font-size:42px;text-align: center"> NestJS Resource configure<h1>

<h1 style="font-size:32px">Table of Contents</h1>

<h2 style="font-size: 28px">1. Installation</h2>

- Install docker (prequisition)
- Open command line or terminal, so on. Then type commands:

* $ git clone https://github.com/mthang1801/nestjs-resource-configure.git
* $ npm install -f
* $ docker-compose up
* $ Crate file .env and fill value the same as .env.example
* $ npm run start:dev

<h2 style="font-size: 28px">2. Deprecated Features</h2>

- Some sql queries has been deprecated as ~~count~~, ~~find~~

<h2 style="font-size: 28px">3. New Features</h2>

<h3 style="font-size: 22px">3.1. SQL new Features queries :</h3>

<h4 style="font-size:20px">A. SQL builder</h4>

<h4 style="font-size:18px; font-weight : 600">Overview</h4>

```
await this.exampleRepo.findOne({
  select: '*',
  join: {
    [JoinTable.leftJoin] : {
      [Table.EXAMPLE_PROFILE]: {
        fieldJoin: `${Table.EXAMPLE_PROFILE}.example_id`,
        rootJoin: `${Table.EXAMPLE}.example_id`,
      },
      [Table.EXAMPLE_DATA]: {
        fieldJoin: `${Table.EXAMPLE_DATA}.example_id`,
        rootJoin: `${Table.EXAMPLE_DATA}.example_id`,
      },
    }
  },
  where: [
    {
      $or: [
        { [`${Table.EXAMPLE}.status`]: $gt(0) },
        { [`${Table.EXAMPLE}.example_id`]: $in([1, 2, 3, 4, 5]) },
        { [`${Table.EXAMPLE}.age`]: $bw(18, 60) },
        {
          $and: [
            { [`${Table.EXAMPLE}.gender`]: 1 },
            { [`${Table.EXAMPLE}.mobile_phone`]: $like('0932139321') },
            {
              $or: [
                { [`${Table.EXAMPLE}.gender`]: 0 },
                { [`${Table.EXAMPLE}.mobile_phone`]: $like('1234567') },
                {
                  $and: [
                    { [`${Table.EXAMPLE}.status`]: $lt(1) },
                    {
                      [`${Table.EXAMPLE}.example_id`]: $in([1, 2, 3, 4, 5]),
                    },
                  ],
                },
              ],
            },
            { [`${Table.EXAMPLE}.email`]: 'example@example.com' },
          ],
        },
        { [`${Table.EXAMPLE}.email`]: $like('example_order@gmail.comm') },
        { [`${Table.EXAMPLE}.status`]: $isNull() },
      ],
    },
  ],
});
```

<h4 style="font-size:18px; font-weight : 600">Select</h4>

As above, when we query with query build, **select** component is used to get what fields we want. `select` is with various options

Example empty select:

```
await this.exampleRepo.findOne({})
// SELECT * FROM examples
```

If we don't inject `select` as above, this query will automatically call `SELECT *`

<h4 style="font-size:20px">B. SQL Functions</h4>

<h4 style="font-size: 16px; font-weight: 600">findOne</h4>

Return a record when the condition is satisfied

```
await this.exampleRepo.findOne({user_id : 1})
or
await this.exampleRepo.findOne({where :{user_id : 1}})
```

<h4 style="font-size: 16px; font-weight: 600">findMany</h4>

Return many records with the condition is satisfied

Example:

```
await this.exampleRepo.findMany({ status : "A" })
or
await this.exampleRepo.findMany({where :{ company_id : 1}})
```

<h4 style="font-size: 16px; font-weight: 600">findById</h4>

Return a record by id (primary key)

Example

```
await this.exampleRepo.findById(1)
```

<h4 style="font-size: 16px; font-weight: 600">findOneAndCreate</h4>

Check a record whether has existed or not, if the record has not existed, this function will create a new record. Otherwise, this function will passover.

```
await this.exampleRepo.findOneAndCreate(
  { email : "example@email.com"}, // Condition
  { email : "example@email.com", // Input data to create new record
    phone : "0987654321",
    firstname : "John",
    lastname : "Doe"
  }
  )
```

<h4 style="font-size: 16px; font-weight: 600">setData</h4>

If user table has some fields as : user_id, fullname, mobile_phone, email, password, gender, avatar, created_at, updated_at. However, when client would like to create an user with more payloads defined in database (as injecting firstname, lastname...). Mysql will reject with invalid data. So we need to filter data fields before inserting new record in the database.
Example :

```
let userData = {
  fullname : "John Doe",
  mobile_phone : "0123456789",
  email : "johndoe@email.com",
  password : "123456",
  avatar : "avatar-default.png" ,
  firstname : "John",
  lastname : "Doe"
}
```

Then, we execute setData() in **userRepository** :

```
  let userFilteredData = this.userRepo.setData(userData);
  console.log(userFilteredData)
  /* {
    fullname : "John Doe",
    mobile_phone : "0123456789",
    email : "johndoe@email.com",
    password : "123456",
    avatar : "avatar-default.png" ,
  }
  */
```

<h4 style="font-size: 16px; font-weight: 600">createOne</h4>

Create a record with input data, if argument 2 is true will return full record, else return primary key of that table

```
  //First of all, define input data
  const userData = { ...new UserEntity(), ...this.exampleRepo.setData(data) };
  // Equivalent, userData = {firstname : "John", lastname : "Doe", email : "johndoe@email.com", phone : "123456789"}
  const user = await this.exampleRepo.create(userData);
```

<h4 style="font-size: 16px; font-weight: 600">createMany</h4>

Create manu records per request.

```
const usersData = [
  {
    "fullname": "Rhianon Palffrey",
    "email": "rpalffrey0@ebay.co.uk",
    "gender": "Female",
    "mobile_phone": "694-567-7471"
  },
  {
    "fullname": "Vin Walesa",
    "email": "vwalesa1@upenn.edu",
    "gender": "Female",
    "mobile_phone": "120-321-6514"
  }
]
await this.userRepo.createMany(users);
```

<h4 style="font-size: 16px; font-weight: 600">update</h4>

Update a record with some following conditions.

```
await this.userRepo.update(
  { user_id: user.user_id }, // condition
  { status: "D", updated_at: formatStandardTimeStamp() }, //payload to update
);
```

<h4 style="font-size: 16px; font-weight: 600">delete</h4>

Delete a record with some following conditions.
Example:

```
await this.exampleRepo.delete({status : "D"})
await this.userRepo.delete({age : $lt(18)})
```

<h4 style="font-size: 16px; font-weight: 600">rawQuery</h4>

Beside the available query builder, you can also write raw sql.

Example using with repository:

```
this.exampleRepo.query(`
        SELECT *
        FROM examples
        WHERE status = 'A'
      `);
```

Otherwise, using query directly from database service :

```
this.db.query(`
  SELECT *
  FROM examples
  WHERE status = 'A'
  `);
```

<h4 style="font-size: 16px; font-weight: 600">aggregation</h4>

This features are developing, comming soon. 😂

<h4 style="font-size: 16px; font-weight: 600">Sql rollback transaction</h4>

The rollback transaction, one of the important feature in sql when you execute logic with multitple repositories per service. For instance, In order to create an order includes with items, user info, you need to check user has existed in database or not, if that user has not yet, you need to create a record for that user. Then, you just create order followed with user_id. Suppose that, creating user successfully, but server crash, order is not able to create. Then, rollback transaction will help you clear anything which processed before.

**Note**: This feature you need to use **try...catch**

Example:

```
await this.db.startTracking(); // initialize rollback transaction
try{
  await this.userRepo.update({ user_id: 1 }, { status: 2 });
  await this.orderRepo.update({ order_id: 1 }, { status: 2 });
  await this.userRepo.delete({ user_id: 1 });
  await this.orderRepo.delete({ order_id: 1 });

  await this.db.commitTracking(); //commit transaction here
}catch(error){
  await this.db.rollback(); //rollback transaction  await this.db.rollback();
}
```

<h3 style="font-size: 22px">3.2. Upload files</h3>

- Upload files with multer

<h3 style="font-size: 22px">3.3. Error Logs</h3>

- Writing Error Log In Database

<h3 style="font-size: 22px">3.4. RabbitMQ</h3>

- RPC
- Named RPC
- Routing

<h3 style="font-size: 22px">3.5. Schedule</h3>

- Static Cron
- Dynamic Cron

<h3 style="font-size: 22px">3.6. Redis</h3>

- Config redis
- Cache Template

<h3 style="font-size: 22px">3.7. Elasticsearch</h3>

- search Term
- search Match
- search MatchPhrase
- search Nested

<h3 style="font-size: 22px">3.8. Websockets</h3>
 
This feature is developing.
<h3 style="font-size: 22px">3.9. Swagger</h3>

Example URL:
[localhost:5000/api/v1/docs](localhost:5000/api/v1/docs)

<h3 style="font-size: 22px">3.10. Versioning</h3>

- URI Versioning
- Header Versioning

<h3 style="font-size: 22px">3.11. Prefix API</h3>

- Config prefix enpoint for API

<h3 style="font-size: 22px">3.12. Mail Service</h3>

- Config Email
- Building Template
- Send Mail with multiple locales

<h3 style="font-size: 22px">3.13. Utility Functions</h3>

- util functions
- dates
- cryptocraphy

This project was powered by [MVT](https://github.com/mthang1801). Contributions of any kind welcome!

Especially, if you are exicited about Machine learning, Deep learning, Data science, etc... Visit my blog : [https://mvt-blog.com/](https://mvt-blog.com/)
