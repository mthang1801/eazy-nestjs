# NestJS Resource configure

## Table of Contents

### Installation

- Install docker (prequisition)
- Open command line or terminal, so on. Then type commands:

* $ git clone https://github.com/mthang1801/nestjs-resource-configure.git
* $ npm install -f
* $ docker-compose up
* $ Crate file .env and fill value the same as .env.example
* $ npm run start:dev

### Deprecated Features

- Some sql queries has been deprecated as ~~count~~, ~~find~~

### New Features

**1. Sql new Features queries :**

1. Query

1.1. findOne

Return a record when the condition is satisfied

Example :

```
await this.userRepo.findOne({user_id : 1})
or
await this.userRepo.findOne({where :{user_id : 1}})
```

1.2. findMany

Return many records with the condition is satisfied

Example:

```
await this.userRepo.findMany({ status : "A" })
or
await this.userRepo.findMany({where :{ company_id : 1}})
```

1.3. findById

Return a record by id (primary key)

Example

```
await this.userRepo.findById(1)
```

1.4. findOneAndCreate

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

- createOne, createMany.
- update.
- delete.
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

This project was developed by [MVT](https://github.com/mthang1801). Contributions of any kind welcome!

Especially, if you are exicited about Machine learning, Deep learning, Data science, etc... Visit my blog : [https://mvt-blog.com/](https://mvt-blog.com/)
