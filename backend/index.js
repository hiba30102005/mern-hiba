const express=require('express');
const app=express();
const port=3000;
const connectDB=require('./config/db');
connectDB();
app.get('/',(req,res)=>{
    res.send("hello world");
})

app.listen(port,()=>{
    console.log("server fonctionne dans le port"+port);
})
