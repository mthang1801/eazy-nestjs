# NestJS Resource configure

## Table of Contents

### **Installation**

- Install docker (prequisition)
- Open command line or terminal, so on. Then type commands:

* $ git clone https://github.com/mthang1801/nestjs-resource-configure.git
* $ npm install -f
* $ docker-compose up
* $ Crate file .env and fill value the same as .env.example
* $ npm run start:dev

### **Deprecated Features**

- Some sql queries has been deprecated as ~~count~~, ~~find~~

### **New Features**

### **1. Sql new Features queries :**

**1.1.** _findOne_

Return a record when the condition is satisfied

Example :

```
await this.userRepo.findOne({user_id : 1})
or
await this.userRepo.findOne({where :{user_id : 1}})
```

**1.2.** _findMany_

Return many records with the condition is satisfied

Example:

```
await this.userRepo.findMany({ status : "A" })
or
await this.userRepo.findMany({where :{ company_id : 1}})
```

**1.3.** _findById_

Return a record by id (primary key)

Example

```
await this.userRepo.findById(1)
```

**1.4.** _findOneAndCreate_

Check a record whether has existed or not, if the record has not existed, this function will create a new record. Otherwise, this function will passover.

```
await this.userRepo.findOneAndCreate(
  { email : "example@email.com"}, // Condition
  { email : "example@email.com", // Input data to create new record
    phone : "0987654321",
    firstname : "John",
    lastname : "Doe"
  }
  )
```

**1.5.** _setData_

**1.6.** _createOne_
Create a record with input data, if argument 2 is true will return full record, else return primary key of that table

```
  //First of all, define input data
  const userData = { ...new UserEntity(), ...this.userRepo.setData(data) };
  // Equivalent, userData = {firstname : "John", lastname : "Doe", email : "johndoe@email.com", phone : "123456789"}
  const user = await this.userRepo.create(userData);
```

**1.7.** _createMany_

1.8. update.

1.9. delete.

1.10. SQL query properties

Advanced Example :

```
await this.userRepo.findOne({
      select: '*',
      join: {
        [Table.USER_PROFILE] : {
          fieldJoin : `${Table.USER_PROFILE}.user_id` ,
          rootJoin : `${Table.USER}.user_id`
        }
      },
      where: [
        {
          $or: [
            { [`${Table.USER}.status`]: $gt(0) },
            { [`${Table.USER}.user_id`]: $in([1, 2, 3, 4, 5]) },
            {
              $and: [
                { [`${Table.USER}.gender`]: 1 },
                { [`${Table.USER}.mobile_phone`]: $like('0932139321') },
                {
                  $or: [
                    { [`${Table.USER}.gender`]: 0 },
                    { [`${Table.USER}.mobile_phone`]: $like('1234567') },
                    {
                      $and: [
                        { [`${Table.USER}.status`]: $lt(1) },
                        { [`${Table.USER}.user_id`]: $in([1, 2, 3, 4, 5]) },
                      ],
                    },
                  ],
                },
                { [`${Table.USER}.email`]: 'example@example.com' },
              ],
            },
            { [`${Table.USER}.email`]: $like('example_order@gmail.comm') },
            { [`${Table.USER}.status`]: $isNull() },
          ],
        },
      ],
    });
```

- rawQuery.
- aggregation.
- Sql rollback transaction.

**2. Upload files**

- Upload files with multer

**3. Error Logs**

- Writing Error Log In Database

**4. RabbitMQ**

- RPC
- Routing

**5. Schedule**

- Static Cron
- Dynamic Cron

**6. Redis**

**7. Elasticsearch**

- search Term
- search Match
- search MatchPhrase
- search Nested

**8. Websockets**

**9. Swagger**

**10. Versioning**

- URI Versioning
- Header Versioning

**11. Prefix API**

**12. Mail Service**

- Config Email (Host, post, user, pass, template)
- Send Mail with multiple locales

This project was powered by [MVT](https://github.com/mthang1801). Contributions of any kind welcome!

Especially, if you are exicited about Machine learning, Deep learning, Data science, etc... Visit my blog : [https://mvt-blog.com/](https://mvt-blog.com/)
