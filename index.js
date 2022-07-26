const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
//use middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m27xt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
      await client.connect();
      const membersCollection = client.db("donar").collection("members");
      const userCollection = client.db("users").collection("user");

// /******verifyAddmin ********/
const verifyAdmin=async(req,res,next)=>{
  const requerster = req.query.email;
  const requersterAccount = await userCollection.findOne({email:requerster});
  if(requersterAccount?.role==='admin'){
next();
  }else{
    res.status(403).send({message:"you are not admin"})
  }
}

//ADMIN ROLL
app.put('/verifyUsers',verifyAdmin,async(req,res)=>{
  const email = req.body.email;
  console.log(email)
    const filter = {email:email};
    const updateDoc = {
      $set:{role:"admin"},
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
 
})

 app.get('/admin',verifyAdmin, async(req,res)=>{
   const email = req.query.email;
   const user = await userCollection.findOne({email:email});
   const isAdmin =user.role==='admin';
   res.send({admin:isAdmin})
 })

/******delete user by email********/
app.delete('/removeUser',verifyAdmin,async(req,res)=>{
  const email = req.body.email;
  const query = {email:email}
  const result = await userCollection.deleteOne(query);
  return res.send(result);
})
 /******get user information sent backend********/
 app.post('/users',async(req,res)=>{
  const user = req.body;
  const result = await userCollection.insertOne(user );
  res.send(result)
})
/******get all user********/
app.get('/user',async(req,res)=>{
  const user= await userCollection.find().toArray();
  res.send(user)
})
/******delete user by email********/
app.delete('/removeuser/:email',verifyAdmin,async(req,res)=>{
  const email = req.params.email;
  const query = {email:email}
  const result = await userCollection.deleteOne(query);
  return res.send(result);
})

/******get member information sent backend********/
app.post('/member',async(req,res)=>{
    const members = req.body;
    const exist = await membersCollection.findOne({email:members.eamil})
    if(!exist){
      const result = await  membersCollection.insertOne(members );
       return res.send(result)
    }
    res.send({message:'User Already Exist'})
  })
   // ----------get all members---------
   app.get("/members",async(req,res)=>{
     const query = {};
     const cursor = membersCollection.find(query);
     const result = await cursor.toArray();
     res.send(result);
   })

     // ----------get one members---------
   app.get('/member',async(req,res)=>{
    const email = req.query.email;
    const query ={email:email};
    const result =await membersCollection.find(query).toArray();
    res.send(result)
  })

  /******delete order by Id********/
  app.delete("/removeMember/:Id",async(req,res)=>{
    const Id = req.params.Id
    console.log(Id)
    const query = {_id:ObjectId(Id)};
    const result = await membersCollection.deleteOne(query);
    res.send(result)
  })

// /---update-date-----------

app.patch('/updateDate',async(req,res)=>{
   const {update,user} = req.body;
   const filter = {email:user} 
   const updatedDoc = {
    $set:{date:update}
   }
   const result = await membersCollection.updateOne(filter,updatedDoc)
   res.send(result)
})

    }
    finally {
    
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Hello World!!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })